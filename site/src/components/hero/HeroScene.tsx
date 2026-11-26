import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { COLORS } from "./sceneConfig";
import { GlassStack } from "./GlassStack";

type Props = {
  progress: MotionValue<number>;
  active: boolean;
  reducedMotion: boolean;
};

/**
 * Canvas hero-сцены. Освещение — собственная «студия» из Lightformer'ов,
 * поэтому ничего не загружается из сети (пресеты drei тянут HDR с CDN).
 */
export default function HeroScene({ progress, active, reducedMotion }: Props) {
  const pointer = useRef({ x: 0, y: 0 });
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 1.75]}
      camera={{ position: [0, 0.45, 12], fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      frameloop={!active ? "never" : reducedMotion ? "demand" : "always"}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <color attach="background" args={[COLORS.background]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-6, 2, -4]} intensity={0.6} color="#bcd0ff" />

      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#4a5468"]} />
        {/* верхний софтбокс */}
        <Lightformer form="rect" intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
        {/* боковые «полосы» дают яркие кромки стекла */}
        <Lightformer form="rect" intensity={4} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[3, 10, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[6, 1, 3]} rotation-y={-Math.PI / 2} scale={[2, 10, 1]} />
        <Lightformer form="rect" intensity={2} color="#b9ccff" position={[0, 0, 8]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#cbb8ff" position={[0, -2, -8]} scale={[10, 3, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[3, 3, 6]} scale={2} />
      </Environment>

      <GlassStack progress={progress} pointer={pointer} reducedMotion={reducedMotion} mobile={mobile} />
    </Canvas>
  );
}
