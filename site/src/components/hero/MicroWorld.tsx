import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { COLORS, LAST_PLATE } from "./sceneConfig";
import { seeded } from "@/lib/random";
import type { SceneState } from "./GlassStack";

/**
 * Микромир внутри толстой пластины: тёмная бирюзовая глубина с боке,
 * сеть нитей «фибрина» (ближние — яркие, дальние — тусклые),
 * светящиеся узлы и глянцевые красные клетки-диски.
 * Всё лежит внутри объёма стекла и видно только сквозь преломление.
 */

const W = LAST_PLATE.w - 0.16;
const H = LAST_PLATE.h - 0.16;
const D = LAST_PLATE.d;

const backdropVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const backdropFragment = /* glsl */ `
  uniform float uReveal;
  uniform vec2 uSize;
  varying vec2 vUv;
  float roundRect(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float sd = roundRect(p, uSize * 0.5, 0.09);
    if (sd > 0.0) discard;
    vec2 c = vUv - vec2(0.38, 0.62);
    float glow = exp(-dot(c, c) * 4.0);
    vec3 deep = vec3(0.01, 0.045, 0.075);
    vec3 mid = vec3(0.04, 0.26, 0.31);
    vec3 col = mix(deep, mid, glow);
    // боке: размытые огоньки на дальнем плане
    for (int i = 0; i < 16; i++) {
      vec2 o = vec2(hash(vec2(float(i), 1.3)), hash(vec2(float(i), 7.1)));
      float r = 0.02 + 0.05 * hash(vec2(float(i), 3.7));
      float m = smoothstep(r, r * 0.55, length((vUv - o) * vec2(uSize.x / uSize.y, 1.0)));
      vec3 bc = hash(vec2(float(i), 9.2)) > 0.75 ? vec3(0.75, 0.2, 0.28) : vec3(0.3, 0.85, 0.85);
      col += bc * m * 0.16;
    }
    // виньетка к краям
    col *= 0.75 + 0.25 * smoothstep(0.0, -0.35, sd);
    col += (hash(vUv * 500.0) - 0.5) * 0.015;
    gl_FragColor = vec4(col, uReveal);
  }
`;

type LineHandle = { material: { opacity: number } };

export function MicroWorld({ state }: { state: React.MutableRefObject<SceneState> }) {
  const group = useRef<THREE.Group>(null);
  const cells = useRef<THREE.InstancedMesh>(null);
  const nodesMat = useRef<THREE.PointsMaterial>(null);
  const cellMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const nearLine = useRef<LineHandle | null>(null);
  const farLine = useRef<LineHandle | null>(null);

  const { near, far, nodes, cellData } = useMemo(() => {
    const rnd = seeded(42);
    const r = (a: number, b: number) => a + rnd() * (b - a);
    const zr = D * 0.36;
    const pts = Array.from({ length: 64 }, () => new THREE.Vector3(r(-W / 2, W / 2), r(-H / 2, H / 2), r(-zr, zr)));
    const near: THREE.Vector3[] = [];
    const far: THREE.Vector3[] = [];
    const add = (a: THREE.Vector3, b: THREE.Vector3) => ((a.z + b.z) / 2 > -zr * 0.2 ? near : far).push(a, b);
    pts.forEach((p) => {
      [...pts]
        .sort((a, b) => a.distanceTo(p) - b.distanceTo(p))
        .slice(1, 4)
        .forEach((n) => add(p, n));
    });
    // длинные провисающие нити через весь кадр
    for (let i = 0; i < 22; i++) {
      const horizontal = i % 2 === 1;
      const a = horizontal ? new THREE.Vector3(-W / 2, r(-H / 2, H / 2), r(-zr, zr)) : new THREE.Vector3(r(-W / 2, W / 2), H / 2, r(-zr, zr));
      const b = horizontal ? new THREE.Vector3(W / 2, r(-H / 2, H / 2), r(-zr, zr)) : new THREE.Vector3(r(-W / 2, W / 2), -H / 2, r(-zr, zr));
      const sag = new THREE.Vector3(r(-0.25, 0.25), r(-0.25, 0.25), 0);
      const steps = 10;
      let prev = a.clone();
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const cur = a.clone().lerp(b, t).addScaledVector(sag, Math.sin(t * Math.PI));
        add(prev, cur);
        prev = cur;
      }
    }
    const cellData = Array.from({ length: 22 }, () => ({
      pos: new THREE.Vector3(r(-W / 2 + 0.12, W / 2 - 0.12), r(-H / 2 + 0.12, H / 2 - 0.12), r(-zr, zr * 0.6)),
      r: r(0.05, 0.11),
      rot: new THREE.Euler(r(-1.1, 1.1), r(-1.1, 1.1), 0),
    }));
    return { near, far, nodes: pts, cellData };
  }, []);

  const nodeGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(nodes), [nodes]);
  const backdropUniforms = useMemo(() => ({ uReveal: { value: 0 }, uSize: { value: new THREE.Vector2(W, H) } }), []);

  // красная клетка — двояковогнутый диск: сфера, сплюснутая и «продавленная» в центре
  const cellGeo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 32, 20);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const rr = Math.min(1, Math.hypot(v.x, v.y));
      const dimple = 0.55 * Math.exp(-rr * rr * 5);
      v.z = Math.sign(v.z) * Math.max(0.08, Math.abs(v.z) * 0.42 - dimple * 0.3);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const sc = new THREE.Vector3();
    cellData.forEach((c, i) => {
      q.setFromEuler(c.rot);
      m.compose(c.pos, q, sc.setScalar(c.r));
      cells.current?.setMatrixAt(i, m);
    });
    if (cells.current) cells.current.instanceMatrix.needsUpdate = true;
  }, [cellData]);

  useFrame((_, delta) => {
    const s = state.current;
    const r = s.micro;
    backdropUniforms.uReveal.value = r;
    if (nodesMat.current) nodesMat.current.opacity = r;
    if (cellMat.current) cellMat.current.opacity = r;
    if (nearLine.current) nearLine.current.material.opacity = r * 0.9;
    if (farLine.current) farLine.current.material.opacity = r * 0.35;
    if (group.current) {
      group.current.visible = r > 0.01;
      if (!s.frozen && cells.current) cells.current.rotation.z += delta * 0.01;
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0, -D / 2 + 0.03]}>
        <planeGeometry args={[W, H]} />
        <shaderMaterial vertexShader={backdropVertex} fragmentShader={backdropFragment} uniforms={backdropUniforms} transparent />
      </mesh>
      <Line ref={farLine as never} points={far} segments color="#5FC9C4" lineWidth={0.8} transparent opacity={0} depthWrite={false} />
      <Line ref={nearLine as never} points={near} segments color="#A8F2E8" lineWidth={1} transparent opacity={0} depthWrite={false} />
      <points geometry={nodeGeo}>
        <pointsMaterial ref={nodesMat} color="#E8FFFC" size={0.03} sizeAttenuation transparent opacity={0} depthWrite={false} />
      </points>
      <instancedMesh ref={cells} args={[cellGeo, undefined, cellData.length]}>
        <meshPhysicalMaterial
          ref={cellMat}
          color={COLORS.cell}
          roughness={0.35}
          clearcoat={0.8}
          clearcoatRoughness={0.25}
          sheen={0.6}
          sheenColor="#ff9aa8"
          emissive="#3a0610"
          emissiveIntensity={0.6}
          transparent
          opacity={0}
        />
      </instancedMesh>
    </group>
  );
}
