"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BOW_COUNT, BOW_TIME, bowAmount, bowState } from "@/lib/bow";
import { gazeState } from "@/lib/gaze";
import { VIEWER } from "./layout";

const PITCH_MIN = -0.85;
const PITCH_MAX = 0.8;
const TAU = Math.PI * 2;
const TURN_KEYS: Record<string, [yaw: number, pitch: number]> = {
  arrowleft: [1, 0],
  a: [1, 0],
  arrowright: [-1, 0],
  d: [-1, 0],
  arrowup: [0, 1],
  w: [0, 1],
  arrowdown: [0, -1],
  s: [0, -1],
};

/** นั่งอยู่กับที่ ลากเมาส์/นิ้ว หรือกดลูกศรเพื่อหันมองรอบตัว ล้อเมาส์เพื่อซูม */
export function LookControls({
  enabled,
  onInteract,
}: {
  enabled: boolean;
  onInteract?: () => void;
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const live = useRef({ enabled, onInteract });
  const st = useRef({
    yaw: 0,
    pitch: 0.06,
    tYaw: 0,
    tPitch: 0.06,
    zoom: 1,
    tZoom: 1,
    drag: null as null | { id: number; x: number; y: number },
    keys: new Set<string>(),
    interacted: false,
  });

  useEffect(() => {
    live.current = { enabled, onInteract };
  }, [enabled, onInteract]);

  useEffect(() => {
    const el = gl.domElement;
    const s = st.current;
    const notify = () => {
      if (s.interacted) return;
      s.interacted = true;
      live.current.onInteract?.();
    };
    const down = (e: PointerEvent) => {
      if (!live.current.enabled) return;
      s.drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!s.drag || s.drag.id !== e.pointerId) return;
      const k = (camera.fov * THREE.MathUtils.DEG2RAD) / el.clientHeight;
      s.tYaw += (e.clientX - s.drag.x) * k;
      s.tPitch += (e.clientY - s.drag.y) * k;
      s.drag.x = e.clientX;
      s.drag.y = e.clientY;
      notify();
    };
    const up = (e: PointerEvent) => {
      if (s.drag?.id !== e.pointerId) return;
      s.drag = null;
      el.style.cursor = "grab";
    };
    const wheel = (e: WheelEvent) => {
      if (!live.current.enabled) return;
      e.preventDefault();
      s.tZoom = THREE.MathUtils.clamp(s.tZoom * Math.exp(e.deltaY * 0.001), 0.4, 1.15);
    };
    const keydown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!(key in TURN_KEYS) || !live.current.enabled) return;
      if (key.startsWith("arrow")) e.preventDefault();
      s.keys.add(key);
      notify();
    };
    const keyup = (e: KeyboardEvent) => s.keys.delete(e.key.toLowerCase());
    const blur = () => s.keys.clear();

    el.style.cursor = "grab";
    el.style.touchAction = "none";
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", blur);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", blur);
    };
  }, [camera, gl]);

  useFrame((state, delta) => {
    const s = st.current;
    const dt = Math.min(delta, 0.1);

    for (const key of s.keys) {
      const [yaw, pitch] = TURN_KEYS[key];
      s.tYaw += yaw * dt * 1.3;
      s.tPitch += pitch * dt * 0.9;
    }

    const gaze = gazeState.request;
    if (gaze) {
      gazeState.request = null;
      // หมุนทางที่ใกล้ที่สุด
      s.tYaw = gaze.yaw + Math.round((s.tYaw - gaze.yaw) / TAU) * TAU;
      s.tPitch = gaze.pitch;
    }

    let bow = 0;
    if (bowState.start >= 0) {
      const elapsed = (performance.now() - bowState.start) / 1000;
      if (elapsed >= BOW_TIME * BOW_COUNT) {
        bowState.start = -1;
      } else {
        bow = bowAmount(elapsed);
        // หันกลับไปทางพระประธานก่อนกราบ
        s.tYaw = Math.round(s.tYaw / TAU) * TAU;
        s.tPitch = 0.06;
      }
    }

    s.tPitch = THREE.MathUtils.clamp(s.tPitch, PITCH_MIN, PITCH_MAX);
    const a = 1 - Math.exp(-dt * 9);
    s.yaw += (s.tYaw - s.yaw) * a;
    s.pitch += (s.tPitch - s.pitch) * a;
    s.zoom += (s.tZoom - s.zoom) * a;

    const t = state.clock.elapsedTime;
    const idle = live.current.enabled ? 0 : Math.sin(t * 0.15) * 0.06;
    camera.rotation.set(s.pitch - bow * 0.95, s.yaw + idle, 0, "YXZ");
    const lean = bow * 0.3;
    camera.position.set(
      VIEWER[0] - Math.sin(s.yaw) * lean,
      VIEWER[1] - bow * 0.5 + Math.sin(t * 0.9) * 0.004,
      VIEWER[2] - Math.cos(s.yaw) * lean,
    );

    const fov = (size.width < size.height ? 80 : 62) * s.zoom;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
