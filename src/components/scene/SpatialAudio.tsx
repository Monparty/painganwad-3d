"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { getChantEngine } from "@/lib/audio/engine";
import type { V3 } from "./layout";

/** ผูกหูผู้ฟังกับกล้อง และวางแหล่งเสียงสวดไว้ที่แถวพระ: หันหัวแล้วเสียงย้ายข้างตาม */
export function SpatialAudio({ position }: { position: V3 }) {
  const camera = useThree((s) => s.camera);
  const { engine, listener, source } = useMemo(() => {
    const engine = getChantEngine();
    const listener = new THREE.AudioListener();
    const source = new THREE.PositionalAudio(listener);
    source.setRefDistance(3);
    source.setRolloffFactor(0.7);
    source.setDistanceModel("inverse");
    source.panner.panningModel = "HRTF";
    return { engine, listener, source };
  }, []);

  useEffect(() => {
    camera.add(listener);
    source.setNodeSource(engine.chantOut);
    engine.ambientOut.connect(listener.getInput());
    return () => {
      camera.remove(listener);
      source.disconnect();
      engine.ambientOut.disconnect(listener.getInput());
    };
  }, [camera, engine, listener, source]);

  return <primitive object={source} position={position} />;
}
