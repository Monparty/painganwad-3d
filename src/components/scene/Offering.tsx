"use client";

import { useMemo } from "react";
import { getMaterials } from "@/lib/materials";
import { VIEWER } from "./layout";
import { Lathe, latheGeometry } from "./shapes";

const TRAY: [number, number][] = [
  [0, 0],
  [0.09, 0],
  [0.08, 0.02],
  [0.035, 0.05],
  [0.035, 0.08],
  [0.16, 0.1],
  [0.19, 0.125],
  [0.17, 0.12],
  [0, 0.105],
];
const BUD: [number, number][] = [
  [0, 0],
  [0.03, 0.02],
  [0.045, 0.06],
  [0.04, 0.1],
  [0.02, 0.14],
  [0, 0.17],
];

/** พานดอกไม้ธูปเทียนที่วางอยู่ตรงหน้าเรา (มองลงเพื่อเห็น) */
export function Offering() {
  const m = getMaterials();
  const bud = useMemo(() => latheGeometry(BUD, 14), []);
  return (
    <group position={[-0.24, 0.012, VIEWER[2] - 0.62]} rotation-y={0.2}>
      <Lathe profile={TRAY} segments={36} material={m.gold} />
      {[-0.05, 0, 0.05].map((x, i) => (
        <group key={i} position={[x, 0.12, -0.02 + i * 0.015]} rotation={[0.9, 0.15 * (i - 1), 0]}>
          <mesh geometry={bud} material={m.lotus} />
          <mesh position={[0, -0.09, 0]} material={m.leaf}>
            <cylinderGeometry args={[0.006, 0.006, 0.18, 5]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.08, 0.135, 0.06]} rotation={[Math.PI / 2, 0, 0.5]} material={m.candle}>
        <cylinderGeometry args={[0.012, 0.012, 0.16, 12]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.06 + i * 0.012, 0.128, 0.08]} rotation={[Math.PI / 2, 0, -0.4]} material={m.incense}>
          <cylinderGeometry args={[0.0035, 0.0035, 0.26, 4]} />
        </mesh>
      ))}
    </group>
  );
}
