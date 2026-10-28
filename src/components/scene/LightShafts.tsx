"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { sunPatchTexture } from "@/lib/textures";
import { HALL, SUN_DIR, WINDOW, WINDOW_Z } from "./layout";

const vertex = /* glsl */ `
  attribute float along;
  varying float vAlong;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vAlong = along;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying float vAlong;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float facing = pow(abs(dot(normalize(vNormalW), viewDir)), 1.6);
    // clamp กันค่าติดลบจากการ interpolate (pow ของค่าลบ = NaN แล้ว bloom จะลามทั้งจอ)
    float along = clamp(vAlong, 0.0, 1.0);
    float fade = pow(1.0 - along, 1.3) * smoothstep(0.0, 0.06, along);
    float ground = smoothstep(0.0, 0.6, vWorld.y);
    float shimmer = 0.85 + 0.15 * sin(uTime * 0.6 + vWorld.z * 0.9 + vWorld.x * 0.4);
    gl_FragColor = vec4(max(uColor * facing * fade * ground * shimmer, 0.0), 1.0);
  }
`;

/** ปริซึมจากกรอบหน้าต่างพุ่งไปตามทิศแดด */
function shaftGeometry(corners: THREE.Vector3[], length: number) {
  const ends = corners.map((c) => c.clone().addScaledVector(SUN_DIR, length));
  const pos: number[] = [];
  const along: number[] = [];
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    const a2 = ends[i];
    const b2 = ends[(i + 1) % 4];
    for (const [v, t] of [
      [a, 0],
      [b, 0],
      [b2, 1],
      [a, 0],
      [b2, 1],
      [a2, 1],
    ] as [THREE.Vector3, number][]) {
      pos.push(v.x, v.y, v.z);
      along.push(t);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("along", new THREE.Float32BufferAttribute(along, 1));
  g.computeVertexNormals();
  return g;
}

/** แสงแดดเป็นลำผ่านหน้าต่างฝั่งซ้าย พร้อมรอยแดดบนพื้น */
export function LightShafts() {
  const { shafts, patches, material, patchMaterial } = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uColor: { value: new THREE.Color(0.32, 0.24, 0.14) },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const patchMaterial = new THREE.MeshBasicMaterial({
      map: sunPatchTexture(),
      color: new THREE.Color(0.55, 0.4, 0.22),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const x = -HALL.halfWidth + 0.05;
    const half = WINDOW.width / 2;
    const length = WINDOW.top / -SUN_DIR.y;

    const shafts: THREE.BufferGeometry[] = [];
    const patches: THREE.BufferGeometry[] = [];
    for (const z of WINDOW_Z) {
      const corners = [
        new THREE.Vector3(x, WINDOW.bottom, z - half),
        new THREE.Vector3(x, WINDOW.bottom, z + half),
        new THREE.Vector3(x, WINDOW.top, z + half),
        new THREE.Vector3(x, WINDOW.top, z - half),
      ];
      shafts.push(shaftGeometry(corners, length));

      // ฉายมุมหน้าต่างลงพื้น y=0 → สี่เหลี่ยมด้านขนานบนพื้น
      const floor = corners.map((c) => c.clone().addScaledVector(SUN_DIR, c.y / -SUN_DIR.y));
      const p = new THREE.BufferGeometry();
      p.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(floor.flatMap((v) => [v.x, 0.02, v.z]), 3),
      );
      p.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
      p.setIndex([0, 1, 2, 0, 2, 3]);
      patches.push(p);
    }
    return { shafts, patches, material, patchMaterial };
  }, []);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <group>
      {shafts.map((g, i) => (
        <mesh key={i} geometry={g} material={material} renderOrder={2} />
      ))}
      {patches.map((g, i) => (
        <mesh key={i} geometry={g} material={patchMaterial} renderOrder={1} />
      ))}
    </group>
  );
}
