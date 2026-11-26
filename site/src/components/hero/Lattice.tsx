import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { LATTICE, LATTICE_DEPTH } from "./ParticleField";
import type { SceneState } from "./GlassStack";

/** Объёмная решётка-«каркас» за четвёртой пластиной. */
export function Lattice({ state }: { state: React.MutableRefObject<SceneState> }) {
  const mat = useRef<THREE.LineBasicMaterial>(null);

  const geometry = useMemo(() => {
    const pts: number[] = [];
    const { cols, rows, w, h } = LATTICE;
    const X = (x: number) => (x / (cols - 1) - 0.5) * w;
    const Y = (y: number) => (y / (rows - 1) - 0.5) * h;
    for (const z of [0, -LATTICE_DEPTH]) {
      for (let x = 0; x < cols; x++) pts.push(X(x), Y(0), z, X(x), Y(rows - 1), z);
      for (let y = 0; y < rows; y++) pts.push(X(0), Y(y), z, X(cols - 1), Y(y), z);
    }
    for (let x = 0; x < cols; x++)
      for (let y = 0; y < rows; y++) pts.push(X(x), Y(y), 0, X(x), Y(y), -LATTICE_DEPTH);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useFrame(() => {
    if (!mat.current) return;
    const s = state.current;
    mat.current.opacity = s.order * 0.85 * (1 - s.align * 0.7);
  });

  return (
    <lineSegments geometry={geometry} renderOrder={2}>
      <lineBasicMaterial ref={mat} color="#3F66F5" transparent opacity={0} depthWrite={false} />
    </lineSegments>
  );
}
