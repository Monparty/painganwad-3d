"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { memo, Suspense, useState } from "react";
import * as THREE from "three";
import { Dust } from "./scene/Dust";
import { Hall } from "./scene/Hall";
import { ALTAR_Z, MONK_SEAT, MONK_Z, SUN_DIR, VIEWER, type V3 } from "./scene/layout";
import { LightShafts } from "./scene/LightShafts";
import { LookControls } from "./scene/LookControls";
import { Monks } from "./scene/Monks";
import { Offering } from "./scene/Offering";
import { Shrine } from "./scene/Shrine";
import { SpatialAudio } from "./scene/SpatialAudio";
import { WaterPouring } from "./scene/WaterPouring";

function Spot({
  position,
  target,
  ...props
}: { position: V3; target: V3 } & Omit<React.ComponentProps<"spotLight">, "position" | "target">) {
  const [obj] = useState(() => new THREE.Object3D());
  return (
    <>
      <primitive object={obj} position={target} />
      <spotLight
        position={position}
        target={obj}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        decay={2}
        {...props}
      />
    </>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.1} color="#ffd9b0" />
      <hemisphereLight args={["#ffe6c4", "#3a1a10", 0.35]} />
      <directionalLight
        position={SUN_DIR.clone().multiplyScalar(-20).toArray()}
        intensity={0.8}
        color="#ffe2b5"
      />
      {/* ไฟส่องพระประธาน */}
      <Spot
        position={[0, 9.2, ALTAR_Z + 6.5]}
        target={[0, 4.4, ALTAR_Z]}
        angle={0.42}
        penumbra={0.7}
        intensity={260}
        color="#ffd8a0"
      />
      {/* ไฟส่องอาสน์สงฆ์ */}
      <Spot
        position={[0, 8.8, 3.2]}
        target={[0, 0.6, MONK_Z]}
        angle={0.55}
        penumbra={0.9}
        intensity={150}
        color="#ffe2bd"
      />
    </>
  );
}

function Reflections() {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={0.6}>
      <color attach="background" args={["#1a0b06"]} />
      <Lightformer intensity={2.5} color="#ffd9a0" position={[-8, 3, 0]} rotation-y={Math.PI / 2} scale={[20, 3, 1]} />
      <Lightformer intensity={1.2} color="#ffe8c8" position={[8, 3, 0]} rotation-y={-Math.PI / 2} scale={[20, 3, 1]} />
      <Lightformer intensity={3} color="#fff4e0" position={[0, 3, 12]} rotation-y={Math.PI} scale={[4, 5, 1]} />
      <Lightformer form="ring" intensity={1.5} color="#ffb060" position={[0, 9, -4]} rotation-x={Math.PI / 2} scale={6} />
    </Environment>
  );
}

// UI ด้านบนเปลี่ยนสถานะหลายครั้งต่อวินาที (คำบรรยาย) ไม่ต้อง re-render ฉาก 3 มิติตาม
export default memo(function TempleScene({
  active,
  asleep = false,
  onLook,
}: {
  active: boolean;
  /** จอมืดสนิทแล้ว (จบโหมดก่อนนอน) หยุดวาดภาพเพื่อประหยัดแบตเตอรี่ */
  asleep?: boolean;
  onLook?: () => void;
}) {
  // ปิดเอฟเฟกต์ทีละอย่างเพื่อหาปัญหาภาพ เช่น ?fx=0&reflect=0&shafts=0&monks=0
  const [off] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (key: string) => params.get(key) === "0";
  });
  return (
    <Canvas
      shadows
      frameloop={asleep ? "never" : "always"}
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: VIEWER, fov: 62, near: 0.05, far: 80 }}
    >
      <color attach="background" args={["#120806"]} />
      <fog attach="fog" args={["#1c0e09", 16, 46]} />
      <Suspense fallback={null}>
        <Lights />
        <Reflections />
        <Hall reflect={!off("reflect")} />
        <Shrine />
        {!off("monks") && <Monks />}
        <Offering />
        <WaterPouring />
        {!off("shafts") && <LightShafts />}
        <Dust count={160} box={[13, 6, 22]} position={[0, 3.2, -1]} />
        <SpatialAudio position={[0, MONK_SEAT + 0.7, MONK_Z]} />
        {!off("fx") && (
          <EffectComposer multisampling={4}>
            <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.75} radius={0.75} />
            <Vignette offset={0.28} darkness={0.75} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        )}
      </Suspense>
      <LookControls enabled={active} onInteract={onLook} />
    </Canvas>
  );
});
