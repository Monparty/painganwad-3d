"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { V3 } from "./layout";

const UP = new THREE.Vector3(0, 1, 0);

/** สุ่มแบบกำหนดผลได้ (0..1) เพื่อให้ render ซ้ำแล้วได้ผลเหมือนเดิม */
export function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** แคปซูลเชื่อมสองจุด ใช้ทำแขนขา */
export function Limb({
  from,
  to,
  radius,
  material,
}: {
  from: V3;
  to: V3;
  radius: number;
  material: THREE.Material;
}) {
  const [fx, fy, fz] = from;
  const [tx, ty, tz] = to;
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(fx, fy, fz);
    const b = new THREE.Vector3(tx, ty, tz);
    const dir = b.clone().sub(a);
    const length = dir.length();
    return {
      position: a.add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize()),
      length,
    };
  }, [fx, fy, fz, tx, ty, tz]);
  return (
    <mesh position={position} quaternion={quaternion} material={material} castShadow>
      <capsuleGeometry args={[radius, Math.max(0.001, length), 6, 14]} />
    </mesh>
  );
}

export function latheGeometry(profile: [number, number][], segments = 32) {
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
}

/** วัตถุทรงกลึง (แจกัน ฐานบัว ฯลฯ) จากโปรไฟล์ [รัศมี, ความสูง] */
export function Lathe({
  profile,
  segments = 32,
  material,
  ...props
}: {
  profile: [number, number][];
  segments?: number;
  material: THREE.Material;
} & Omit<React.ComponentProps<"mesh">, "material">) {
  const geometry = useMemo(() => latheGeometry(profile, segments), [profile, segments]);
  return <mesh geometry={geometry} material={material} castShadow receiveShadow {...props} />;
}
