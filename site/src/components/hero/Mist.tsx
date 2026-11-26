import { useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { SceneState } from "./GlassStack";

/**
 * Объёмная «дымка» облака: крупные мягкие спрайты.
 * Живёт в пространстве внешней группы (не вращается вместе со стопкой).
 */

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCenter;
  uniform float uSpread;
  uniform float uPxScale;
  attribute vec3 aOffset;
  attribute vec4 aRand;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float t = uTime * 0.12 + aRand.w * 6.2831;
    vec3 drift = vec3(sin(t), cos(t * 0.7), sin(t * 0.5)) * 0.25;
    vec3 pos = uCenter + aOffset * uSpread + drift;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = mix(0.6, 1.7, aRand.y) * uSpread * uPxScale / -mv.z;
    vColor = aColor;
    vAlpha = aRand.z;
  }
`;

const fragment = /* glsl */ `
  uniform float uAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float a = exp(-d * d * 4.0) * vAlpha * uAlpha;
    gl_FragColor = vec4(vColor, a);
  }
`;

function gaussian() {
  const u = 1 - Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

export function Mist({ state, count = 160 }: { state: React.MutableRefObject<SceneState>; count?: number }) {
  const { size, gl } = useThree();
  const geometry = useMemo(() => {
    const aOffset = new Float32Array(count * 3);
    const aRand = new Float32Array(count * 4);
    const aColor = new Float32Array(count * 3);
    const white = new THREE.Color("#FFFFFF");
    const lav = new THREE.Color("#B8B4EE");
    const blue = new THREE.Color("#9FB4DE");
    for (let i = 0; i < count; i++) {
      aOffset.set([gaussian() * 0.85, gaussian() * 0.5, gaussian() * 0.55], i * 3);
      const r = Math.random();
      const c = r < 0.5 ? white : r < 0.72 ? lav : blue;
      const alpha = c === white ? 0.65 + Math.random() * 0.3 : 0.12 + Math.random() * 0.1;
      aRand.set([Math.random(), Math.random(), alpha, Math.random()], i * 4);
      aColor.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aOffset", new THREE.BufferAttribute(aOffset, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(aRand, 4));
    g.setAttribute("aColor", new THREE.BufferAttribute(aColor, 3));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCenter: { value: new THREE.Vector3() },
      uSpread: { value: 1 },
      uAlpha: { value: 1 },
      uPxScale: { value: 500 },
    }),
    [],
  );

  useFrame((three, delta) => {
    const s = state.current;
    if (!s.frozen) uniforms.uTime.value += Math.min(delta, 0.05);
    uniforms.uCenter.value.copy(s.cloudWorld);
    uniforms.uSpread.value = s.cloudSpread;
    uniforms.uAlpha.value = (1 - s.condense * 0.35) * (1 - s.align * 0.85);
    const fov = (three.camera as THREE.PerspectiveCamera).fov;
    uniforms.uPxScale.value = (size.height * gl.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
  });

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={1}>
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
