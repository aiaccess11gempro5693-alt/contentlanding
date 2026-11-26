import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { COLORS, PLATE, PLATE_COUNT } from "./sceneConfig";
import type { SceneState } from "./GlassStack";

/**
 * Частицы: облако → пластины → сетки.
 * Вся анимация считается в шейдере, на CPU только юниформы — это дёшево
 * даже для мобильных устройств.
 */

type Props = {
  state: React.MutableRefObject<SceneState>;
  /** Масштаб количества частиц (1 — десктоп, ~0.5 — мобильные) */
  density?: number;
};

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uCondense;
  uniform float uOrder;
  uniform float uAlign;
  uniform float uGap;
  uniform float uPlateScale[${PLATE_COUNT}];
  uniform float uPlateRot[${PLATE_COUNT}];
  uniform vec3 uCloudCenter;
  uniform float uCloudSpread;
  uniform float uPxScale;

  attribute vec3 aCloud;
  attribute vec3 aLoose;
  attribute vec3 aOrdered;
  attribute float aPlate;
  attribute vec4 aRand;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vSharp;

  void main() {
    float t = uTime * 0.35 + aRand.w * 6.2831;
    // мягкий «дрейф» облака
    vec3 drift = vec3(sin(t + aCloud.y * 1.7), cos(t * 0.8 + aCloud.x * 1.3), sin(t * 0.6 + aCloud.z)) * 0.18;
    vec3 cloudPos = uCloudCenter + aCloud * uCloudSpread + drift * (0.6 + uCloudSpread * 0.4);

    vec3 pos = cloudPos;
    vec3 col = aColor;
    float alpha = 0.3 + aRand.y * 0.4;
    float size = mix(0.014, 0.036, aRand.y);
    float sharp = 0.35;

    if (aPlate >= 0.0) {
      int pi = int(aPlate + 0.5);
      float s = uPlateScale[pi];
      float plateZ = (aPlate - float(${PLATE_COUNT - 1})) * uGap;
      float ord = smoothstep(aRand.x * 0.4, aRand.x * 0.4 + 0.6, uOrder);
      vec3 local = mix(aLoose, aOrdered, ord);
      // хаотичное покачивание затухает по мере упорядочивания
      local += vec3(sin(t * 1.3), cos(t * 1.1), 0.0) * 0.025 * (1.0 - ord);
      float ra = uPlateRot[pi];
      vec3 l = local * s;
      vec3 target = vec3(l.x * cos(ra) + l.z * sin(ra), l.y, -l.x * sin(ra) + l.z * cos(ra) + plateZ);

      float k = smoothstep(aRand.x * 0.45, aRand.x * 0.45 + 0.55, uCondense);
      // частицы летят к пластинам по дуге
      vec3 arc = vec3(0.0, sin(k * 3.14159) * (aRand.z - 0.5) * 0.9, 0.0);
      pos = mix(cloudPos, target, k) + arc;

      col = mix(vec3(0.74, 0.76, 0.95), aColor, k);
      alpha = mix(alpha, 0.95, k) * (1.0 - uAlign * 0.55);
      size = mix(size, 0.026 + aRand.y * 0.01, k);
      sharp = mix(0.35, 1.0, k);
    } else {
      // остаточная дымка — исчезает при сборке кадра
      alpha *= (0.55 + 0.45 * (1.0 - uCondense)) * (1.0 - uAlign * 0.9);
    }

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uPxScale / -mv.z;
    vColor = col;
    vAlpha = alpha;
    vSharp = sharp;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSharp;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    if (d > 1.0) discard;
    // резкая «бусина» для частиц в пластинах, мягкая — для облака
    float edge = mix(1.0 - d * d, smoothstep(1.0, 0.75, d), vSharp);
    float shade = 0.82 + 0.3 * (1.0 - length(c + vec2(0.18, 0.18)) * 2.0) * vSharp;
    gl_FragColor = vec4(vColor * shade, vAlpha * edge);
  }
`;

function gaussian() {
  // Box–Muller
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function buildGeometry(density: number) {
  const counts = {
    cloud: Math.round(2600 * density),
    p0: Math.round(900 * density),
    p1: Math.round(650 * density),
  };
  const grid2 = { cols: 15, rows: 20 };
  const grid1 = { cols: 10, rows: 13 };
  const lattice = { cols: 7, rows: 9, layers: 2 };
  const total =
    counts.cloud + counts.p0 + counts.p1 + grid2.cols * grid2.rows + lattice.cols * lattice.rows * lattice.layers;

  const aCloud = new Float32Array(total * 3);
  const aLoose = new Float32Array(total * 3);
  const aOrdered = new Float32Array(total * 3);
  const aPlate = new Float32Array(total);
  const aRand = new Float32Array(total * 4);
  const aColor = new Float32Array(total * 3);
  const position = new Float32Array(total * 3);

  const w = PLATE.w * 0.82;
  const h = PLATE.h * 0.84;
  const cCloudA = new THREE.Color("#8F9EEA");
  const cCloudB = new THREE.Color("#C7BDF7");
  const plateColors = [COLORS.violet, "#7C63FF", "#5A63F5", COLORS.blue].map((c) => new THREE.Color(c));

  let idx = 0;
  const push = (plate: number, loose: THREE.Vector3, ordered: THREE.Vector3, color: THREE.Color) => {
    aCloud.set([gaussian() * 0.95, gaussian() * 0.6, gaussian() * 0.6], idx * 3);
    aLoose.set([loose.x, loose.y, loose.z], idx * 3);
    aOrdered.set([ordered.x, ordered.y, ordered.z], idx * 3);
    aPlate[idx] = plate;
    aRand.set([Math.random(), Math.random(), Math.random(), Math.random()], idx * 4);
    aColor.set([color.r, color.g, color.b], idx * 3);
    idx++;
  };
  const randomInPlate = (spread = 1) =>
    new THREE.Vector3(((Math.random() - 0.5) * w) / spread, ((Math.random() - 0.5) * h) / spread, (Math.random() - 0.5) * 0.04);

  for (let i = 0; i < counts.cloud; i++) {
    const c = cCloudA.clone().lerp(cCloudB, Math.random());
    push(-1, new THREE.Vector3(), new THREE.Vector3(), c);
  }
  // 01 — свободные фиолетовые частицы (собираются в мягкое «ядро»)
  for (let i = 0; i < counts.p0; i++) {
    const loose = new THREE.Vector3(gaussian() * w * 0.22, gaussian() * h * 0.2, (Math.random() - 0.5) * 0.04);
    loose.x = THREE.MathUtils.clamp(loose.x, -w / 2, w / 2);
    loose.y = THREE.MathUtils.clamp(loose.y, -h / 2, h / 2);
    push(0, loose, loose.clone().multiplyScalar(0.9), plateColors[0]);
  }
  // 02 — полуупорядоченные точки
  for (let i = 0; i < counts.p1; i++) {
    const gx = Math.floor(Math.random() * grid1.cols);
    const gy = Math.floor(Math.random() * grid1.rows);
    const ordered = new THREE.Vector3(
      (gx / (grid1.cols - 1) - 0.5) * w * 0.9 + gaussian() * 0.035,
      (gy / (grid1.rows - 1) - 0.5) * h * 0.9 + gaussian() * 0.035,
      0,
    );
    push(1, randomInPlate(), ordered, plateColors[1]);
  }
  // 03 — точная сетка
  for (let x = 0; x < grid2.cols; x++)
    for (let y = 0; y < grid2.rows; y++) {
      const ordered = new THREE.Vector3((x / (grid2.cols - 1) - 0.5) * w * 0.86, (y / (grid2.rows - 1) - 0.5) * h * 0.88, 0);
      push(2, randomInPlate(), ordered, plateColors[2]);
    }
  // 04 — узлы решётки (объёмная, уходит назад от пластины)
  for (let l = 0; l < lattice.layers; l++)
    for (let x = 0; x < lattice.cols; x++)
      for (let y = 0; y < lattice.rows; y++) {
        const ordered = new THREE.Vector3(
          (x / (lattice.cols - 1) - 0.5) * w * 0.8,
          (y / (lattice.rows - 1) - 0.5) * h * 0.82,
          -l * LATTICE_DEPTH,
        );
        push(3, randomInPlate(), ordered, plateColors[3]);
      }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geo.setAttribute("aCloud", new THREE.BufferAttribute(aCloud, 3));
  geo.setAttribute("aLoose", new THREE.BufferAttribute(aLoose, 3));
  geo.setAttribute("aOrdered", new THREE.BufferAttribute(aOrdered, 3));
  geo.setAttribute("aPlate", new THREE.BufferAttribute(aPlate, 1));
  geo.setAttribute("aRand", new THREE.BufferAttribute(aRand, 4));
  geo.setAttribute("aColor", new THREE.BufferAttribute(aColor, 3));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
  return geo;
}

export const LATTICE_DEPTH = 0.42;
export const LATTICE = { cols: 7, rows: 9, w: PLATE.w * 0.82 * 0.8, h: PLATE.h * 0.84 * 0.82 };

export function ParticleField({ state, density = 1 }: Props) {
  const geometry = useMemo(() => buildGeometry(density), [density]);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { size, camera, gl } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCondense: { value: 0 },
      uOrder: { value: 0 },
      uAlign: { value: 0 },
      uGap: { value: 1 },
      uPlateScale: { value: new Array(PLATE_COUNT).fill(1) },
      uPlateRot: { value: new Array(PLATE_COUNT).fill(0) },
      uCloudCenter: { value: new THREE.Vector3() },
      uCloudSpread: { value: 1 },
      uPxScale: { value: 500 },
    }),
    [],
  );

  useFrame((_, delta) => {
    const s = state.current;
    const u = uniforms;
    if (!s.frozen) u.uTime.value += Math.min(delta, 0.05);
    u.uCondense.value = s.condense;
    u.uOrder.value = s.order;
    u.uAlign.value = s.align;
    u.uGap.value = s.gap;
    for (let i = 0; i < PLATE_COUNT; i++) {
      u.uPlateScale.value[i] = s.plateScale[i];
      u.uPlateRot.value[i] = s.plateRot[i];
    }
    u.uCloudCenter.value.copy(s.cloudLocal);
    u.uCloudSpread.value = s.cloudSpread;
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 30;
    u.uPxScale.value = (size.height * gl.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
  });

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={2}>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
