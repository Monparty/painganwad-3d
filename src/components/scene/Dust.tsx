"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import type { V3 } from "./layout";
import { hash } from "./shapes";

const vertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uScale;
  uniform vec3 uBox;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * (0.03 + aSeed * 0.04), uBox.y) - uBox.y * 0.5;
    p.x += sin(uTime * 0.3 + aSeed * 40.0) * 0.25;
    p.z += cos(uTime * 0.25 + aSeed * 30.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (0.6 + aSeed) * uScale / max(-mv.z, 0.1);
    gl_Position = projectionMatrix * mv;
    vAlpha = 0.5 + 0.5 * sin(uTime * (0.6 + aSeed) + aSeed * 20.0);
  }
`;

// ค่า alpha อยู่ในช่วง 0..1 เสมอ (Sparkles ของ drei หารด้วยระยะจากจุดศูนย์กลางจนได้ค่าอนันต์
// แล้ว bloom ขยาย NaN จนจอมืดทั้งจอ)
const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = clamp(1.0 - d, 0.0, 1.0);
    gl_FragColor = vec4(uColor, a * a * vAlpha * uOpacity);
  }
`;

/** ฝุ่นละอองลอยในแสง */
export function Dust({
  count,
  box,
  position,
  color = "#ffdcae",
  opacity = 0.35,
}: {
  count: number;
  box: V3;
  position: V3;
  color?: string;
  opacity?: number;
}) {
  const { size, viewport } = useThree();
  const [bx, by, bz] = box;
  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (hash(i * 3) - 0.5) * bx;
      pos[i * 3 + 1] = hash(i * 3 + 1) * by;
      pos[i * 3 + 2] = (hash(i * 3 + 2) - 0.5) * bz;
      seed[i] = hash(i + 1000);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: 1 },
        uBox: { value: new THREE.Vector3(bx, by, bz) },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry, material };
  }, [count, bx, by, bz, color, opacity]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uScale.value = size.height * viewport.dpr * 0.004;
  });

  return <points geometry={geometry} material={material} position={position} frustumCulled={false} />;
}
