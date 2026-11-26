import { useMemo } from "react";

/**
 * Мягкая тень под пластиной — дешёвая замена ContactShadows:
 * плоскость с эллиптическим градиентом, движется вместе с пластиной.
 */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const fragment = /* glsl */ `
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float d = length(p * vec2(1.0, 1.0));
    float a = exp(-d * d * 3.2) * uOpacity;
    gl_FragColor = vec4(0.12, 0.18, 0.34, a);
  }
`;

export function PlateShadow({ width, depth, y }: { width: number; depth: number; y: number }) {
  const uniforms = useMemo(() => ({ uOpacity: { value: 0.32 } }), []);
  return (
    <mesh position={[0, y, 0.1]} rotation-x={-Math.PI / 2} renderOrder={0}>
      <planeGeometry args={[width * 1.35, depth + 1.1]} />
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  );
}
