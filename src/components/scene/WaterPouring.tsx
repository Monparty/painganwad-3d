"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { KRUATNAM } from "@/lib/audio/chants";
import { chantStore } from "@/lib/audio/store";
import { requestGaze } from "@/lib/gaze";
import { getMaterials } from "@/lib/materials";
import { VIEWER, type V3 } from "./layout";
import { Lathe, Limb } from "./shapes";

// ชุดกรวดน้ำ: ขันเงินบนพานวางอยู่ข้างพานดอกไม้ เมื่อพระสวดบทกรวดน้ำ
// มือยกเต้าน้ำขึ้น รินน้ำเป็นสายลงขันจนจบบท แล้ววางกลับที่เดิม

const STAND: [number, number][] = [
  [0, 0],
  [0.075, 0],
  [0.078, 0.012],
  [0.05, 0.03],
  [0.022, 0.05],
  [0.018, 0.12],
  [0.03, 0.15],
  [0.08, 0.18],
  [0.085, 0.192],
  [0.075, 0.196],
  [0, 0.188],
];
// ผนังขันมีความหนา (ขอบนอกขึ้นไป แล้ววนกลับลงมาเป็นผนังใน)
const BOWL: [number, number][] = [
  [0, 0],
  [0.04, 0],
  [0.055, 0.015],
  [0.066, 0.045],
  [0.07, 0.075],
  [0.066, 0.076],
  [0.062, 0.047],
  [0.05, 0.02],
  [0, 0.01],
];
const VESSEL: [number, number][] = [
  [0, 0],
  [0.03, 0],
  [0.045, 0.012],
  [0.055, 0.04],
  [0.05, 0.07],
  [0.03, 0.09],
  [0.016, 0.1],
  [0.014, 0.13],
  [0.021, 0.145],
  [0.02, 0.152],
  [0, 0.155],
];

const STAND_POS: V3 = [0.12, 0, VIEWER[2] - 0.72];
const BOWL_Y = 0.19;
/** ระดับน้ำในขัน (เทียบกับก้นขัน) ตอนเริ่มและตอนเต็ม */
const WATER_MIN = 0.018;
const WATER_MAX = 0.06;
/** เต้าน้ำวางพื้นอยู่ข้างพาน และตำแหน่งตอนยกขึ้นริน (จุดหมุนอยู่ที่ก้นเต้า) */
const REST = new THREE.Vector3(0.3, 0, STAND_POS[2] + 0.06);
const HOLD = new THREE.Vector3(0.28, 0.4, STAND_POS[2]);
const POUR_ANGLE = 0.78;
const SPOUT_TIP: V3 = [-0.108, 0.118, 0];
/** โคนแขน (พิกัดของกล้อง) อยู่ใต้ขอบจอเสมอ แขนเสื้อสีขาวจึงยื่นเข้ามาจากขอบล่างไม่ว่าจะหันไปทางไหน */
const ARM_BASES: V3[] = [
  [0.12, -0.34, -0.06],
  [-0.1, -0.34, -0.06],
];
const SLEEVE = { base: 0.03, cuff: 0.021 };
/** ข้อมือ (พิกัดของเต้าน้ำ): มือขวาจับคอเต้า มือซ้ายรองก้น */
const WRISTS: V3[] = [
  [0.06, 0.098, 0.036],
  [-0.012, -0.018, 0.055],
];
/** มองลงที่ขันน้ำ */
const GAZE = { yaw: -0.2, pitch: -0.78 };

const streamVertex = /* glsl */ `
  uniform vec3 uP0;
  uniform vec3 uP1;
  uniform vec3 uP2;
  uniform float uTime;
  varying float vT;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    // cylinderGeometry: uv.y = 1 ที่ปลายบน → t = 0 ที่ปากพวยเต้า
    float t = 1.0 - uv.y;
    float s = 1.0 - t;
    vec3 c = s * s * uP0 + 2.0 * s * t * uP1 + t * t * uP2;
    vec3 tangent = normalize(2.0 * s * (uP1 - uP0) + 2.0 * t * (uP2 - uP1));
    vec3 side = normalize(cross(tangent, abs(tangent.z) > 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 0.0, 1.0)));
    vec3 up = cross(side, tangent);
    float r = mix(0.0042, 0.0024, t) * (1.0 + 0.14 * sin(t * 46.0 - uTime * 22.0));
    vNormal = side * position.x + up * position.z;
    vWorld = c + vNormal * r;
    vT = t;
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
  }
`;

const streamFragment = /* glsl */ `
  uniform float uHead;
  uniform float uTail;
  uniform float uTime;
  varying float vT;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    if (vT > uHead || vT < uTail) discard;
    vec3 view = normalize(cameraPosition - vWorld);
    float fres = 1.0 - abs(dot(normalize(vNormal), view));
    float glint = smoothstep(0.75, 1.0, sin(vT * 70.0 - uTime * 28.0 + vNormal.x * 2.0));
    vec3 col = mix(vec3(0.55, 0.62, 0.66), vec3(1.6, 1.4, 1.1), fres * 0.8 + glint * 0.5);
    gl_FragColor = vec4(col, 0.32 + 0.5 * fres + 0.25 * glint);
  }
`;

const UP = new THREE.Vector3(0, 1, 0);
const ease = (x: number) => x * x * (3 - 2 * x);

/** วางทรงกระบอกให้เชื่อมจุด a กับ b (ใช้กับแขนเสื้อที่ขยับทุกเฟรม) */
function setSegment(mesh: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3, radius: number) {
  const dir = b.clone().sub(a);
  const len = dir.length();
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.divideScalar(len || 1));
  mesh.scale.set(radius, len, radius);
}

function Hands() {
  const m = getMaterials();
  return (
    <>
      {/* มือขวากำคอเต้า */}
      <group position={[0.026, 0.115, 0.012]} rotation={[0, -0.5, 0.15]}>
        <mesh material={m.skin} scale={[0.017, 0.042, 0.03]} castShadow>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
        <mesh material={m.skin} position={[-0.016, 0.004, 0.018]} scale={[0.012, 0.036, 0.016]}>
          <sphereGeometry args={[1, 12, 10]} />
        </mesh>
        <Limb from={[0.004, 0.02, 0.022]} to={[-0.018, 0.028, 0.03]} radius={0.007} material={m.skin} />
      </group>
      {/* มือซ้ายรองก้นเต้า */}
      <group position={[0.0, -0.012, 0.012]} rotation={[0.1, 0.4, 0]}>
        <mesh material={m.skin} scale={[0.04, 0.011, 0.034]} castShadow>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
      </group>
    </>
  );
}

export function WaterPouring() {
  const m = getMaterials();
  const vessel = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Object3D>(null);
  const hands = useRef<THREE.Group>(null);
  const wristRefs = useRef<(THREE.Object3D | null)[]>([]);
  const armRefs = useRef<(THREE.Mesh | null)[]>([]);
  const water = useRef<THREE.Mesh>(null);
  const ripples = useRef<(THREE.Mesh | null)[]>([]);
  const st = useRef({ lift: 0, tilt: 0, head: 0, tail: 0, level: 0, active: false });

  const { stream, rippleMat } = useMemo(() => {
    const stream = new THREE.ShaderMaterial({
      vertexShader: streamVertex,
      fragmentShader: streamFragment,
      uniforms: {
        uP0: { value: new THREE.Vector3() },
        uP1: { value: new THREE.Vector3() },
        uP2: { value: new THREE.Vector3() },
        uHead: { value: 0 },
        uTail: { value: 0 },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
    });
    const rippleMat = [0, 1, 2].map(
      () =>
        new THREE.MeshBasicMaterial({
          color: "#fff1d6",
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
    );
    return { stream, rippleMat };
  }, []);

  const tmp = useMemo(
    () => ({
      tip: new THREE.Vector3(),
      wrist: new THREE.Vector3(),
      base: new THREE.Vector3(),
      dir: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state, delta) => {
    const s = st.current;
    const dt = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    const chant = chantStore.get();
    const active = chant.mode === "synth" && chant.section === KRUATNAM;
    const chanting = chant.status === "chanting";

    if (active && !s.active) {
      if (s.lift < 0.05) s.level = 0;
      requestGaze(GAZE.yaw, GAZE.pitch);
    }
    // จบบทแล้วเงยหน้ากลับไปทางพระประธาน
    if (!active && s.active) requestGaze(0, 0.06);
    s.active = active;

    s.lift += ((active ? 1 : 0) - s.lift) * (1 - Math.exp(-dt * 2.2));
    const pour = active && chanting && s.lift > 0.9;
    s.tilt += ((pour ? 1 : 0) - s.tilt) * (1 - Math.exp(-dt * 2.6));
    const flowing = s.tilt > 0.85;

    if (flowing) {
      if (s.tail > 0) s.head = s.tail = 0;
      s.head = Math.min(1, s.head + dt * 3.2);
      if (s.head >= 1) s.level = Math.min(1, s.level + dt / 30);
    } else if (s.head > 0) {
      s.tail = Math.min(1, s.tail + dt * 3.2);
      if (s.tail >= 1) s.head = s.tail = 0;
    }

    const v = vessel.current;
    if (!v) return;
    const lifted = s.lift > 0.004;
    hands.current!.visible = lifted;
    const k = ease(s.lift);
    v.position.lerpVectors(REST, HOLD, k);
    v.position.y += Math.sin(t * 1.1) * 0.003 * k;
    v.rotation.set(Math.sin(t * 1.4) * 0.012 * k, 0, ease(s.tilt) * POUR_ANGLE);
    v.updateMatrixWorld();

    // แขนเสื้อ: จากใต้ขอบจอถึงข้อมือ
    for (let i = 0; i < 2; i++) {
      const wristObj = wristRefs.current[i];
      const arm = armRefs.current[i];
      if (!wristObj || !arm) continue;
      arm.visible = lifted;
      if (!lifted) continue;
      wristObj.getWorldPosition(tmp.wrist);
      tmp.base.set(...ARM_BASES[i]);
      state.camera.localToWorld(tmp.base);
      setSegment(arm, tmp.base, tmp.wrist, SLEEVE.base);
    }

    // สายน้ำ: เส้นโค้งจากปากพวยลงสู่ผิวน้ำในขัน
    tip.current!.getWorldPosition(tmp.tip);
    const surfaceY = BOWL_Y + WATER_MIN + s.level * (WATER_MAX - WATER_MIN);
    const u = stream.uniforms;
    u.uP0.value.copy(tmp.tip);
    u.uP1.value.set(tmp.tip.x - 0.014, tmp.tip.y + 0.004, tmp.tip.z);
    u.uP2.value.set(tmp.tip.x - 0.012, STAND_POS[1] + surfaceY, tmp.tip.z);
    u.uHead.value = s.head;
    u.uTail.value = s.tail;
    u.uTime.value = t;

    const w = water.current!;
    w.visible = s.level > 0 || s.head > 0.9;
    w.position.y = surfaceY;
    w.scale.setScalar(0.05 + (surfaceY - BOWL_Y - 0.02) * 0.4);

    const splash = s.head >= 1 && s.tail === 0 ? s.tilt : 0;
    ripples.current.forEach((r, i) => {
      if (!r) return;
      const phase = (t * 1.3 + i / 3) % 1;
      r.position.set(u.uP2.value.x, surfaceY + 0.001, u.uP2.value.z);
      r.scale.setScalar(0.004 + phase * 0.032);
      rippleMat[i].opacity = (1 - phase) * 0.3 * splash;
    });
  });

  return (
    <group>
      <group position={STAND_POS}>
        <Lathe profile={STAND} segments={40} material={m.gold} />
        <Lathe profile={BOWL} segments={40} material={m.silver} position-y={BOWL_Y} />
      </group>
      <group position-x={STAND_POS[0]} position-z={STAND_POS[2]}>
        <mesh ref={water} material={m.water} rotation-x={-Math.PI / 2} visible={false}>
          <circleGeometry args={[1, 40]} />
        </mesh>
      </group>
      {rippleMat.map((mat, i) => (
        <mesh
          key={i}
          ref={(el) => {
            ripples.current[i] = el;
          }}
          material={mat}
          rotation-x={-Math.PI / 2}
        >
          <ringGeometry args={[0.82, 1, 40]} />
        </mesh>
      ))}

      <group ref={vessel}>
        <Lathe profile={VESSEL} segments={36} material={m.gold} />
        <Limb from={[-0.045, 0.05, 0]} to={[-0.104, 0.114, 0]} radius={0.008} material={m.gold} />
        <object3D ref={tip} position={SPOUT_TIP} />
        {WRISTS.map((p, i) => (
          <object3D
            key={i}
            position={p}
            ref={(el) => {
              wristRefs.current[i] = el;
            }}
          />
        ))}
        <group ref={hands} visible={false}>
          <Hands />
        </group>
      </group>

      {[0, 1].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            armRefs.current[i] = el;
          }}
          material={m.cloth}
          visible={false}
          frustumCulled={false}
        >
          {/* ปลายบน (+y) คือข้อมือ เรียวกว่าโคนแขน */}
          <cylinderGeometry args={[SLEEVE.cuff / SLEEVE.base, 1, 1, 14]} />
        </mesh>
      ))}

      <mesh material={stream} frustumCulled={false}>
        <cylinderGeometry args={[1, 1, 1, 10, 40, true]} />
      </mesh>
    </group>
  );
}
