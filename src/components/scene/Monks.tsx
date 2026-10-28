"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { audioLevel } from "@/lib/audio/store";
import { getMaterials } from "@/lib/materials";
import { talapatTexture } from "@/lib/textures";
import { Candle } from "./Fire";
import { ALTAR_Z, MONK_SEAT, MONK_X, MONK_Z, PLATFORM } from "./layout";
import { Lathe, Limb } from "./shapes";

const LOWER_TORSO: [number, number][] = [
  [0, 0.1],
  [0.17, 0.11],
  [0.19, 0.2],
  [0.185, 0.32],
  [0.195, 0.4],
  [0, 0.4],
];
const UPPER_TORSO: [number, number][] = [
  [0, 0.38],
  [0.192, 0.38],
  [0.2, 0.44],
  [0.215, 0.52],
  [0.19, 0.575],
  [0.12, 0.605],
  [0.05, 0.615],
  [0, 0.615],
];
const HANDS: [number, number, number] = [0, 0.47, 0.235];

function pillowGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-0.18, 0);
  s.lineTo(0.18, 0);
  s.lineTo(-0.18, 0.42);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 3,
  });
  g.translate(0, 0, -0.21);
  g.rotateY(-Math.PI / 2);
  return g;
}

type MonkProps = {
  x: number;
  robe: number;
  phase: number;
  scale: number;
};

function Monk({ x, robe, phase, scale }: MonkProps) {
  const m = getMaterials();
  const robeMat = m.robes[robe % m.robes.length];
  const upper = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const pillow = useMemo(() => pillowGeometry(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const level = audioLevel.chant;
    if (upper.current) {
      upper.current.scale.y = 1 + 0.01 * Math.sin(t * 1.05 + phase);
      upper.current.rotation.z = 0.012 * Math.sin(t * 0.37 + phase);
    }
    if (head.current) {
      head.current.rotation.x = 0.16 + 0.03 * level * Math.sin(t * 8 + phase) + 0.01 * Math.sin(t * 0.5 + phase);
      head.current.rotation.y = 0.03 * Math.sin(t * 0.23 + phase * 2);
    }
    if (mouth.current) {
      mouth.current.scale.y = 0.0025 + 0.011 * level * (0.75 + 0.25 * Math.sin(t * 21 + phase));
    }
  });

  return (
    <group position={[x, MONK_SEAT, MONK_Z]} scale={scale}>
      <mesh position={[0, -0.02, 0.02]} material={m.lacquer} receiveShadow>
        <boxGeometry args={[0.82, 0.04, 0.78]} />
      </mesh>
      <mesh geometry={pillow} position={[0, 0, -0.34]} material={m.pillow} castShadow receiveShadow />

      <mesh position={[0, 0.1, 0.1]} rotation-z={Math.PI / 2} scale={[0.75, 1, 1.3]} material={robeMat} castShadow>
        <capsuleGeometry args={[0.12, 0.5, 6, 16]} />
      </mesh>
      <mesh position={[0, 0.08, 0.04]} scale={[1.15, 0.33, 0.85]} material={robeMat} castShadow>
        <sphereGeometry args={[0.3, 24, 14]} />
      </mesh>

      <group ref={upper}>
        <Lathe profile={LOWER_TORSO} segments={28} material={robeMat} scale={[1, 1, 0.72]} />
        <Lathe profile={UPPER_TORSO} segments={28} material={m.skin} scale={[1, 1, 0.72]} />
        {/* จีวรห่มเฉียง เปิดไหล่ขวา */}
        <mesh position={[0.075, 0.44, 0.1]} rotation-z={-0.5} scale={[0.12, 0.22, 0.05]} material={robeMat}>
          <sphereGeometry args={[1, 20, 14]} />
        </mesh>
        <mesh position={[0.11, 0.46, -0.02]} rotation-z={-0.4} scale={[0.11, 0.18, 0.12]} material={robeMat}>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
        <mesh position={[0.12, 0.42, 0.13]} rotation={[0.1, 0, -0.08]} material={m.sash}>
          <boxGeometry args={[0.06, 0.3, 0.02]} />
        </mesh>
        <mesh position={[-0.185, 0.53, 0]} scale={[1, 0.85, 0.9]} material={m.skin} castShadow>
          <sphereGeometry args={[0.07, 16, 12]} />
        </mesh>
        <mesh position={[0.185, 0.53, 0]} scale={[1, 0.85, 0.9]} material={robeMat} castShadow>
          <sphereGeometry args={[0.075, 16, 12]} />
        </mesh>

        {/* ประนมมือ */}
        <Limb from={[-0.19, 0.52, 0]} to={[-0.17, 0.33, 0.1]} radius={0.046} material={m.skin} />
        <Limb from={[-0.17, 0.33, 0.1]} to={[-0.02, 0.43, 0.22]} radius={0.04} material={m.skin} />
        <Limb from={[0.19, 0.52, 0]} to={[0.17, 0.33, 0.1]} radius={0.05} material={robeMat} />
        <Limb from={[0.17, 0.33, 0.1]} to={[0.02, 0.43, 0.22]} radius={0.04} material={m.skin} />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[HANDS[0] + s * 0.012, HANDS[1], HANDS[2]]} rotation-x={-0.25} scale={[0.02, 0.075, 0.034]} material={m.skin}>
            <sphereGeometry args={[1, 12, 10]} />
          </mesh>
        ))}

        <mesh position={[0, 0.645, 0.005]} material={m.skin}>
          <cylinderGeometry args={[0.045, 0.05, 0.09, 14]} />
        </mesh>
        <group ref={head} position={[0, 0.745, 0.012]}>
          <mesh scale={[0.92, 1.06, 1]} material={m.skin} castShadow>
            <sphereGeometry args={[0.1, 28, 20]} />
          </mesh>
          <mesh scale={[0.92, 1.06, 1]} material={m.scalp}>
            <sphereGeometry args={[0.1015, 28, 10, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
          </mesh>
          {[-1, 1].map((s) => (
            <group key={s}>
              <mesh position={[s * 0.092, -0.005, 0]} scale={[0.018, 0.03, 0.022]} material={m.skin}>
                <sphereGeometry args={[1, 10, 8]} />
              </mesh>
              <mesh position={[s * 0.034, 0.012, 0.088]} rotation-z={s * 0.1} scale={[0.017, 0.003, 0.006]} material={m.dark}>
                <sphereGeometry args={[1, 8, 6]} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, -0.01, 0.098]} scale={[0.016, 0.024, 0.018]} material={m.skin}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
          <mesh ref={mouth} position={[0, -0.045, 0.088]} scale={[0.014, 0.003, 0.006]} material={m.dark}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function talapatGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.28);
  s.bezierCurveTo(0.27, -0.26, 0.27, 0.18, 0, 0.33);
  s.bezierCurveTo(-0.27, 0.18, -0.27, -0.26, 0, -0.28);
  const g = new THREE.ShapeGeometry(s, 24);
  g.computeBoundingBox();
  const { min, max } = g.boundingBox!;
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - min.x) / (max.x - min.x), (pos.getY(i) - min.y) / (max.y - min.y));
  }
  return g;
}

/** ตาลปัตรตั้งข้างพระผู้นำสวด */
function Talapat({ position }: { position: [number, number, number] }) {
  const m = getMaterials();
  const { face, mat } = useMemo(
    () => ({
      face: talapatGeometry(),
      mat: new THREE.MeshStandardMaterial({ map: talapatTexture(), roughness: 0.7, side: THREE.DoubleSide }),
    }),
    [],
  );
  return (
    <group position={position} rotation={[-0.1, -0.35, 0.04]}>
      <mesh position={[0, 0.5, 0]} material={m.jasmine}>
        <cylinderGeometry args={[0.012, 0.014, 1.0, 8]} />
      </mesh>
      <mesh position={[0, 0.02, 0]} material={m.gold}>
        <cylinderGeometry args={[0.07, 0.09, 0.04, 16]} />
      </mesh>
      <group position={[0, 1.22, 0]}>
        <mesh geometry={face} material={mat} position={[0, 0, 0.006]} />
        <mesh geometry={face} material={m.gold} scale={1.07} />
        <mesh position={[0, 0.36, 0]} material={m.gold}>
          <coneGeometry args={[0.025, 0.08, 8]} />
        </mesh>
      </group>
    </group>
  );
}

const BOWL: [number, number][] = [
  [0, 0],
  [0.07, 0],
  [0.06, 0.03],
  [0.11, 0.05],
  [0.15, 0.11],
  [0.15, 0.17],
  [0.13, 0.21],
  [0.05, 0.235],
  [0.03, 0.26],
  [0, 0.26],
];

/** สายสิญจน์: จากฐานพระประธาน อ้อมมาตามแถวพระ ผ่านมือที่พนมทุกรูป */
function SacredThread() {
  const geometry = useMemo(() => {
    const handY = MONK_SEAT + HANDS[1];
    const handZ = MONK_Z + HANDS[2];
    const xs = [...MONK_X].sort((a, b) => b - a);
    const pts: THREE.Vector3[] = [
      new THREE.Vector3(1.6, 2.25, ALTAR_Z + 1.3),
      new THREE.Vector3(2.6, 1.6, -7.5),
      new THREE.Vector3(3.4, 0.75, -3.5),
      new THREE.Vector3(3.6, PLATFORM.top + 0.25, handZ + 0.1),
    ];
    xs.forEach((x, i) => {
      if (i > 0) pts.push(new THREE.Vector3((x + xs[i - 1]) / 2, handY - 0.14, handZ + 0.06));
      pts.push(new THREE.Vector3(x, handY, handZ + 0.035));
    });
    pts.push(new THREE.Vector3(xs[xs.length - 1] - 0.4, handY - 0.2, handZ + 0.1));
    pts.push(new THREE.Vector3(xs[xs.length - 1] - 0.6, PLATFORM.top + 0.01, handZ + 0.15));
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    return new THREE.TubeGeometry(curve, 400, 0.0035, 5);
  }, []);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#fffaf0" emissive="#fff4e0" emissiveIntensity={0.25} roughness={0.8} />
    </mesh>
  );
}

const MONKS: MonkProps[] = MONK_X.map((x, i) => ({
  x,
  robe: [3, 1, 0, 2, 4][i],
  phase: i * 1.7,
  scale: [0.98, 1.02, 1.04, 0.97, 1.0][i],
}));

/** อาสน์สงฆ์และพระสงฆ์ 5 รูป */
export function Monks() {
  const m = getMaterials();
  const { width, depth, top, z } = PLATFORM;
  return (
    <group>
      <mesh position={[0, top / 2, z]} material={m.wood} castShadow receiveShadow>
        <boxGeometry args={[width, top, depth]} />
      </mesh>
      <mesh position={[0, top - 0.005, z]} material={m.cloth} receiveShadow>
        <boxGeometry args={[width + 0.04, 0.02, depth + 0.04]} />
      </mesh>
      <mesh position={[0, top * 0.55, z + depth / 2 + 0.025]} material={m.cloth} receiveShadow>
        <boxGeometry args={[width + 0.04, top * 0.9, 0.012]} />
      </mesh>
      <mesh position={[0, top - 0.035, z + depth / 2 + 0.035]} material={m.gold}>
        <boxGeometry args={[width + 0.06, 0.04, 0.01]} />
      </mesh>

      {MONKS.map((p) => (
        <Monk key={p.x} {...p} />
      ))}

      <Talapat position={[0.55, top, MONK_Z - 0.22]} />

      {/* บาตรน้ำมนต์ปักเทียนไว้ที่ฝา */}
      <group position={[0.42, top, MONK_Z + 0.6]}>
        <Lathe profile={BOWL} segments={32} material={m.goldDim} />
        <Candle position={[0, 0.26, 0]} height={0.16} radius={0.014} light={1.2} />
      </group>

      <SacredThread />
    </group>
  );
}
