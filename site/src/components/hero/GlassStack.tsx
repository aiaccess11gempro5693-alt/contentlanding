import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, RoundedBox, useFBO } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { PLATE_COUNT, lerp, plateSize, smooth, stageParams } from "./sceneConfig";
import { ParticleField } from "./ParticleField";
import { Mist } from "./Mist";
import { Lattice } from "./Lattice";
import { MicroWorld } from "./MicroWorld";
import { PlateShadow } from "./PlateShadow";

/** Состояние сцены на текущий кадр — пересчитывается из прогресса скролла. */
export type SceneState = ReturnType<typeof stageParams> & {
  micro: number;
  plateRot: number[];
  cloudWorld: THREE.Vector3;
  cloudLocal: THREE.Vector3;
  cloudSpread: number;
  frozen: boolean;
};

type Props = {
  progress: MotionValue<number>;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
  mobile: boolean;
};

const CLOUD_START = new THREE.Vector3(-1.6, 0.15, -1.4);
const CLOUD_END = new THREE.Vector3(-4.5, -0.05, -2.7);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
/** Насколько последняя пластина развёрнута к зрителю относительно первой (рад) */
const FAN = 0.5;

export function GlassStack({ progress, pointer, reducedMotion, mobile }: Props) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const plates = useRef<(THREE.Group | null)[]>([]);
  const glass = useRef<(THREE.Mesh | null)[]>([]);
  // материал последней пластины: при сборке кадра убираем аберрацию — кадр становится резким
  const lastGlass = useRef<{ chromaticAberration: number; thickness: number } | null>(null);
  const smoothP = useRef(reducedMotion ? 1 : progress.get());
  // в режиме reduced motion кадры рисуются по требованию: дорисовываем первые, пока состояние не установится
  const warmup = useRef(0);

  const state = useRef<SceneState>({
    ...stageParams(smoothP.current),
    micro: 0,
    plateRot: new Array(PLATE_COUNT).fill(0),
    cloudWorld: CLOUD_START.clone(),
    cloudLocal: new THREE.Vector3(),
    cloudSpread: 1.5,
    frozen: reducedMotion,
  });

  // Общий буфер «того, что за стеклом»: сцена рендерится один раз без пластин,
  // и все пластины преломляют этот кадр. Это в разы дешевле, чем по буферу на пластину.
  const { size, viewport } = useThree();
  const bufferScale = mobile ? 0.85 : 1;
  const fbo = useFBO(Math.round(size.width * viewport.dpr * bufferScale), Math.round(size.height * viewport.dpr * bufferScale), {
    samples: 0,
  });


  useFrame((three, delta) => {
    if (reducedMotion && warmup.current++ < 12) three.invalidate();
    // плавно догоняем прогресс скролла
    const target = reducedMotion ? 1 : progress.get();
    smoothP.current = THREE.MathUtils.damp(smoothP.current, target, 5, Math.min(delta, 0.1));
    const p = smoothP.current;
    const s = state.current;
    Object.assign(s, stageParams(p));
    s.micro = smooth(0.36, 0.66, p);
    for (let i = 0; i < PLATE_COUNT; i++) s.plateRot[i] = -FAN * (i / (PLATE_COUNT - 1)) * (1 - s.align);

    // облако: большое и рассеянное → компактное, у начала стопки
    s.cloudWorld.lerpVectors(CLOUD_START, CLOUD_END, s.condense);
    s.cloudSpread = lerp(1.55, 0.75, s.condense);

    // раскладка под пропорции холста
    const cam = three.camera as THREE.PerspectiveCamera;
    const aspect = three.size.width / three.size.height;
    const halfW = cam.position.z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * aspect;
    const wide = aspect > 1.15;
    const layoutScale = wide ? 1 : THREE.MathUtils.clamp(halfW / 3.7, 0.42, 1);
    const anchorX = wide ? lerp(halfW * 0.56, halfW * 0.5, s.align) : lerp(1.3 * layoutScale, 0.05, s.align);

    if (outer.current) {
      const t = three.clock.elapsedTime;
      const g = outer.current;
      g.position.set(anchorX, (wide ? -0.05 : 0.1) + (s.frozen ? 0 : Math.sin(t * 0.6) * 0.04), 0);
      g.scale.setScalar(layoutScale * (wide ? 1 : 1 + s.align * 0.75));
      // параллакс за курсором
      const px = reducedMotion ? 0 : pointer.current.x;
      const py = reducedMotion ? 0 : pointer.current.y;
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, px * 0.14, 3, delta);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -py * 0.06, 3, delta);
    }
    if (inner.current) inner.current.rotation.y = s.angle;
    // центр облака в локальных координатах вращающейся стопки
    s.cloudLocal.copy(s.cloudWorld).applyAxisAngle(Y_AXIS, -s.angle);

    for (let i = 0; i < PLATE_COUNT; i++) {
      const plate = plates.current[i];
      if (!plate) continue;
      const sc = s.plateScale[i];
      plate.visible = sc > 0.01;
      plate.scale.setScalar(Math.max(sc, 0.001));
      plate.position.z = (i - (PLATE_COUNT - 1)) * s.gap;
      plate.position.y = (1 - sc) * -0.4;
      // веер: дальние пластины развёрнуты сильнее, последняя — почти анфас
      plate.rotation.y = s.plateRot[i];
    }

    if (lastGlass.current) {
      lastGlass.current.chromaticAberration = lerp(0.06, 0.004, s.align);
      lastGlass.current.thickness = lerp(1.2, 0.35, s.align);
    }

    // рендер буфера для стекла (без самих пластин)
    glass.current.forEach((m) => m && (m.visible = false));
    three.gl.setRenderTarget(fbo);
    three.gl.render(three.scene, three.camera);
    three.gl.setRenderTarget(null);
    glass.current.forEach((m) => m && (m.visible = true));
  });

  return (
    <group ref={outer}>
      <Mist state={state} count={mobile ? 90 : 170} />
      <group ref={inner}>
        <ParticleField state={state} density={mobile ? 0.5 : 1} />
        {Array.from({ length: PLATE_COUNT }, (_, i) => {
          const dims = plateSize(i);
          const last = i === PLATE_COUNT - 1;
          return (
            <group key={i} ref={(el) => (plates.current[i] = el)}>
              <RoundedBox
                ref={(el: THREE.Mesh | null) => (glass.current[i] = el)}
                args={[dims.w, dims.h, dims.d]}
                radius={dims.radius}
                smoothness={4}
                renderOrder={3}
              >
                <MeshTransmissionMaterial
                  ref={last ? (lastGlass as never) : undefined}
                  buffer={fbo.texture}
                  resolution={32}
                  backsideResolution={32}
                  samples={mobile ? 3 : 4}
                  transmission={1}
                  thickness={last ? 1.2 : 0.7}
                  roughness={0}
                  ior={last ? 1.45 : 1.25}
                  chromaticAberration={last ? 0.06 : 0.04}
                  anisotropicBlur={0}
                  distortion={0}
                  temporalDistortion={0}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  envMapIntensity={last ? 0.55 : 0.45}
                  color="#ffffff"
                  toneMapped={false}
                  attenuationColor={last ? "#dff3f5" : "#e9f0ff"}
                  attenuationDistance={last ? 3 : 6}
                />
              </RoundedBox>
              {i === 3 && <Lattice state={state} />}
              {last && <MicroWorld state={state} />}
              <PlateShadow width={dims.w} depth={dims.d} y={-dims.h / 2 - 0.16} />
            </group>
          );
        })}
      </group>
    </group>
  );
}
