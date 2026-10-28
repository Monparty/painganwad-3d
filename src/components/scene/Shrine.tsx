"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getMaterials } from "@/lib/materials";
import { ALTAR_Z } from "./layout";
import { Candle, IncenseSmoke } from "./Fire";
import { Lathe, Limb, hash, latheGeometry } from "./shapes";

// ---------- พระประธาน ปางมารวิชัย (สร้างจากรูปทรงพื้นฐาน) ----------

const PEDESTAL: [number, number][] = [
  [0.0, -0.36],
  [0.75, -0.36],
  [0.8, -0.3],
  [0.7, -0.22],
  [0.78, -0.12],
  [0.86, -0.03],
  [0.86, 0],
  [0, 0],
];
const TORSO: [number, number][] = [
  [0.0, 0.14],
  [0.36, 0.15],
  [0.34, 0.3],
  [0.33, 0.45],
  [0.37, 0.62],
  [0.41, 0.76],
  [0.37, 0.85],
  [0.22, 0.91],
  [0.1, 0.94],
  [0, 0.94],
];
const RASMI: [number, number][] = [
  [0, 0],
  [0.07, 0],
  [0.08, 0.05],
  [0.065, 0.14],
  [0.04, 0.28],
  [0.018, 0.42],
  [0, 0.52],
];
const HEAD_Y = 1.18;
const HEAD_R = 0.21;

function HairCurls() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dirs = useMemo(() => {
    const out: THREE.Vector3[] = [];
    const n = 600;
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = i * 2.399963;
      const d = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
      // แนวไรผม: ด้านหน้าสูงกว่าด้านหลัง
      if (d.y > 0.18 + Math.max(0, d.z) * 0.25) out.push(d);
    }
    return out;
  }, []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const scale = new THREE.Vector3(0.95, 1.12, 1);
    dirs.forEach((d, i) => {
      const p = d.clone().multiply(scale).multiplyScalar(HEAD_R * 1.01);
      m.makeTranslation(p.x, p.y + HEAD_Y, p.z + 0.02);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [dirs]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, getMaterials().buddhaGold, dirs.length]}
      castShadow
    >
      <sphereGeometry args={[0.024, 8, 6]} />
    </instancedMesh>
  );
}

/** ซุ้มเรือนแก้ว: กรอบโค้งแหลมพร้อมเปลวกระหนกด้านนอก */
function Halo() {
  const m = getMaterials();
  const { tube, flames } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const half = 0.98;
    const springY = 0.95;
    const apex = 2.25;
    for (let i = 0; i <= 10; i++) pts.push(new THREE.Vector3(-half, -0.3 + (i / 10) * (springY + 0.3), 0));
    for (let i = 1; i <= 24; i++) {
      const t = i / 24;
      const a = (t * Math.PI) / 2;
      pts.push(new THREE.Vector3(-half * Math.cos(a) ** 1.4, springY + (apex - springY) * Math.sin(a) ** 0.85, 0));
    }
    const right = pts.slice(0, -1).reverse().map((p) => new THREE.Vector3(-p.x, p.y, 0));
    const curve = new THREE.CatmullRomCurve3([...pts, ...right]);
    const tube = new THREE.TubeGeometry(curve, 160, 0.045, 8);

    const flames: { pos: THREE.Vector3; rot: THREE.Euler; s: number }[] = [];
    const count = 46;
    for (let i = 1; i < count; i++) {
      const t = i / count;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const normal = new THREE.Vector3(-tan.y, tan.x, 0).normalize();
      if (normal.dot(new THREE.Vector3(p.x, p.y - 0.8, 0)) < 0) normal.negate();
      const rot = new THREE.Euler(0, 0, Math.atan2(normal.y, normal.x) - Math.PI / 2);
      flames.push({ pos: p.clone().addScaledVector(normal, 0.1), rot, s: Math.abs(t - 0.5) < 0.02 ? 2.4 : 1 });
    }
    return { tube, flames };
  }, []);
  return (
    <group position={[0, 0, -0.5]}>
      <mesh geometry={tube} material={m.buddhaGold} />
      {flames.map((f, i) => (
        <mesh key={i} position={f.pos} rotation={f.rot} scale={f.s} material={m.buddhaGold}>
          <coneGeometry args={[0.035, 0.16, 6]} />
        </mesh>
      ))}
    </group>
  );
}

function BuddhaImage() {
  const m = getMaterials();
  const g = m.buddhaGold;
  const petals = useMemo(() => {
    const out: { pos: [number, number, number]; rotY: number }[] = [];
    for (let row = 0; row < 2; row++) {
      const n = 22;
      for (let i = 0; i < n; i++) {
        const a = ((i + row * 0.5) / n) * Math.PI * 2;
        out.push({
          pos: [Math.sin(a) * (0.82 - row * 0.04), -0.2 + row * 0.09, Math.cos(a) * (0.82 - row * 0.04)],
          rotY: a,
        });
      }
    }
    return out;
  }, []);

  return (
    <group>
      <Lathe profile={PEDESTAL} segments={48} material={g} />
      {petals.map((p, i) => (
        <group key={i} position={p.pos} rotation-y={p.rotY}>
          <mesh rotation-x={-0.35} scale={[0.1, 0.15, 0.04]} material={g}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
        </group>
      ))}

      {/* ขาขัดสมาธิ + ชายจีวร */}
      <mesh position={[0, 0.17, 0.14]} rotation-z={Math.PI / 2} scale={[0.8, 1, 1.15]} material={g} castShadow>
        <capsuleGeometry args={[0.2, 0.92, 8, 24]} />
      </mesh>
      <mesh position={[0.3, 0.32, 0.26]} rotation-y={0.3} scale={[0.17, 0.05, 0.08]} material={g}>
        <sphereGeometry args={[1, 16, 10]} />
      </mesh>

      <Lathe profile={TORSO} segments={40} material={g} scale={[1, 1, 0.7]} />
      {/* สังฆาฏิพาดบ่าซ้าย */}
      <mesh position={[0.15, 0.6, 0.25]} rotation={[0.12, 0, -0.12]} material={m.goldDim}>
        <boxGeometry args={[0.1, 0.56, 0.03]} />
      </mesh>
      <mesh position={[-0.02, 0.66, 0.25]} rotation={[0.2, 0, -0.8]} material={m.goldDim}>
        <boxGeometry args={[0.035, 0.66, 0.02]} />
      </mesh>

      {/* แขนขวาวางเหนือเข่า นิ้วชี้ลงธรณี */}
      <Limb from={[-0.38, 0.78, 0]} to={[-0.45, 0.42, 0.08]} radius={0.085} material={g} />
      <Limb from={[-0.45, 0.42, 0.08]} to={[-0.47, 0.26, 0.5]} radius={0.068} material={g} />
      <mesh position={[-0.47, 0.17, 0.58]} rotation-x={-0.35} scale={[0.07, 0.12, 0.05]} material={g}>
        <sphereGeometry args={[1, 14, 10]} />
      </mesh>
      {/* แขนซ้ายวางบนตัก หงายฝ่ามือ */}
      <Limb from={[0.38, 0.78, 0]} to={[0.43, 0.42, 0.06]} radius={0.085} material={g} />
      <Limb from={[0.43, 0.42, 0.06]} to={[0.08, 0.31, 0.32]} radius={0.068} material={g} />
      <mesh position={[0, 0.31, 0.36]} scale={[0.13, 0.04, 0.08]} material={g}>
        <sphereGeometry args={[1, 14, 10]} />
      </mesh>

      <mesh position={[0, 0.98, 0.01]} material={g}>
        <cylinderGeometry args={[0.095, 0.11, 0.14, 20]} />
      </mesh>
      <group position={[0, HEAD_Y, 0.02]}>
        <mesh scale={[0.95, 1.12, 1]} material={g} castShadow>
          <sphereGeometry args={[HEAD_R, 32, 24]} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.2, -0.05, -0.01]} scale={[0.035, 0.13, 0.06]} material={g}>
              <sphereGeometry args={[1, 12, 10]} />
            </mesh>
            <mesh position={[s * 0.065, 0.02, 0.19]} rotation={[0, 0, Math.PI * 0.225 - s * 0.1]} material={g}>
              <torusGeometry args={[0.055, 0.008, 6, 16, Math.PI * 0.55]} />
            </mesh>
            <mesh position={[s * 0.066, 0.025, 0.188]} rotation-z={s * -0.12} scale={[0.04, 0.008, 0.02]} material={m.goldDim}>
              <sphereGeometry args={[1, 10, 6]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.005, 0.205]} rotation-x={0.3} scale={[0.03, 0.065, 0.035]} material={g}>
          <sphereGeometry args={[1, 12, 10]} />
        </mesh>
        <mesh position={[0, -0.1, 0.19]} scale={[0.045, 0.014, 0.02]} material={m.goldDim}>
          <sphereGeometry args={[1, 12, 8]} />
        </mesh>
      </group>
      <HairCurls />
      <mesh position={[0, HEAD_Y + 0.22, 0.01]} scale={[1, 0.8, 1]} material={g}>
        <sphereGeometry args={[0.11, 20, 14]} />
      </mesh>
      <Lathe profile={RASMI} segments={20} material={g} position={[0, HEAD_Y + 0.27, 0.01]} />

      <Halo />
    </group>
  );
}

// ---------- ฐานชุกชีและเครื่องบูชา ----------

function Tier({ y, w, d, h, gold = false }: { y: number; w: number; d: number; h: number; gold?: boolean }) {
  const m = getMaterials();
  return (
    <mesh position={[0, y + h / 2, 0]} material={gold ? m.gold : m.lacquer} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
    </mesh>
  );
}

const VASE: [number, number][] = [
  [0, 0],
  [0.06, 0],
  [0.05, 0.03],
  [0.035, 0.06],
  [0.07, 0.14],
  [0.06, 0.2],
  [0.035, 0.24],
  [0.05, 0.27],
  [0, 0.27],
];
const BURNER: [number, number][] = [
  [0, 0],
  [0.1, 0],
  [0.08, 0.03],
  [0.16, 0.08],
  [0.17, 0.14],
  [0.15, 0.17],
  [0, 0.16],
];
const CANDLESTICK: [number, number][] = [
  [0, 0],
  [0.2, 0],
  [0.18, 0.05],
  [0.05, 0.12],
  [0.04, 0.6],
  [0.07, 0.66],
  [0.035, 0.72],
  [0.035, 1.25],
  [0.12, 1.3],
  [0.12, 1.33],
  [0, 1.33],
];

function Bouquet({ position }: { position: [number, number, number] }) {
  const m = getMaterials();
  const seed = position[0] * 10;
  const blooms = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = i * 2.4;
        const r = 0.04 + (i % 4) * 0.025;
        return {
          pos: [Math.cos(a) * r, 0.33 + hash(i + seed) * 0.12, Math.sin(a) * r] as [number, number, number],
          mat: i % 3 === 0 ? m.jasmine : m.marigold,
        };
      }),
    [m, seed],
  );
  return (
    <group position={position}>
      <Lathe profile={VASE} material={m.gold} />
      {blooms.map((b, i) => (
        <mesh key={i} position={b.pos} material={b.mat}>
          <sphereGeometry args={[0.035, 10, 8]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.07, 0.36, 0]} rotation-z={s * -0.6} scale={[0.03, 0.09, 0.01]} material={m.leaf}>
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

function OfferingTables() {
  const m = getMaterials();
  const table = (x: number, z: number, w: number, h: number, d: number) => (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} material={m.lacquer} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh position={[0, h + 0.015, 0]} material={m.gold}>
        <boxGeometry args={[w + 0.06, 0.03, d + 0.06]} />
      </mesh>
    </group>
  );
  return (
    <group position={[0, 0, ALTAR_Z + 2.9]}>
      {/* โต๊ะหมู่บูชา */}
      {table(0, -0.35, 0.6, 1.25, 0.45)}
      {table(-0.68, -0.3, 0.5, 1.0, 0.42)}
      {table(0.68, -0.3, 0.5, 1.0, 0.42)}
      {table(-0.45, 0.25, 0.5, 0.7, 0.4)}
      {table(0.45, 0.25, 0.5, 0.7, 0.4)}
      {table(0, 0.3, 0.42, 0.55, 0.42)}

      <Bouquet position={[-0.68, 1.03, -0.3]} />
      <Bouquet position={[0.68, 1.03, -0.3]} />
      <Bouquet position={[-0.15, 1.28, -0.35]} />
      <Bouquet position={[0.15, 1.28, -0.35]} />
      <Candle position={[-0.45, 0.73, 0.25]} height={0.32} radius={0.03} light={1.6} />
      <Candle position={[0.45, 0.73, 0.25]} height={0.32} radius={0.03} light={1.6} />

      <group position={[0, 0.58, 0.3]}>
        <Lathe profile={BURNER} material={m.gold} />
        {[-0.03, 0, 0.03].map((x, i) => (
          <group key={i} position={[x, 0.15, 0]} rotation-z={x * 3}>
            <mesh position={[0, 0.12, 0]} material={m.incense}>
              <cylinderGeometry args={[0.004, 0.004, 0.24, 4]} />
            </mesh>
            <mesh position={[0, 0.245, 0]} material={m.ember}>
              <sphereGeometry args={[0.006, 6, 4]} />
            </mesh>
          </group>
        ))}
        <IncenseSmoke position={[0, 0.4, 0]} />
      </group>

      {/* เชิงเทียนใหญ่ตั้งพื้น */}
      {[-1.7, 1.7].map((x) => (
        <group key={x} position={[x, 0, 0.2]}>
          <Lathe profile={CANDLESTICK} material={m.gold} />
          <Candle position={[0, 1.33, 0]} height={0.45} radius={0.045} light={4} />
        </group>
      ))}
    </group>
  );
}

const LOTUS_BUD: [number, number][] = [
  [0, 0],
  [0.05, 0.03],
  [0.07, 0.09],
  [0.06, 0.15],
  [0.03, 0.21],
  [0, 0.25],
];

/** ฐานชุกชี + พระประธาน + เครื่องบูชา */
export function Shrine() {
  const m = getMaterials();
  const bud = useMemo(() => latheGeometry(LOTUS_BUD, 16), []);
  const baseTop = 2.2;
  return (
    <group>
      <group position={[0, 0, ALTAR_Z]}>
        <Tier y={0} w={4.4} d={3.2} h={0.55} />
        <Tier y={0.55} w={4.6} d={3.4} h={0.12} gold />
        <Tier y={0.67} w={3.8} d={2.7} h={0.18} gold />
        <Tier y={0.85} w={3.5} d={2.4} h={0.75} />
        <Tier y={1.6} w={3.8} d={2.7} h={0.14} gold />
        <Tier y={1.74} w={3.2} d={2.1} h={0.28} />
        <Tier y={2.02} w={3.4} d={2.3} h={0.18} gold />
        {/* ดอกบัวตูมประดับขอบฐาน */}
        {[-1.45, -0.75, 0.75, 1.45].map((x) => (
          <mesh key={x} geometry={bud} position={[x, baseTop, 1.0]} material={m.lotus} />
        ))}
        <group position={[0, baseTop + 0.36 * 2.1, 0]} scale={2.1}>
          <BuddhaImage />
        </group>
      </group>
      <OfferingTables />
    </group>
  );
}
