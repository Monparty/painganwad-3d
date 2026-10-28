"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { getMaterials } from "@/lib/materials";
import { flameTexture, softTexture } from "@/lib/textures";
import type { V3 } from "./layout";
import { hash } from "./shapes";

const FLAME_COLOR = new THREE.Color(3.2, 1.9, 0.8);

/** เปลวเทียนแบบ sprite + แสงจุดที่ไหววูบวาบ */
export function Flame({
  position,
  size = 1,
  light = 0,
  lightDistance = 6,
}: {
  position: V3;
  size?: number;
  light?: number;
  lightDistance?: number;
}) {
  const sprite = useRef<THREE.Sprite>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const seed = hash(position[0] * 13 + position[1] * 5 + position[2] * 7) * 100;
  const material = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: flameTexture(),
        color: FLAME_COLOR,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed;
    const f = 1 + 0.09 * Math.sin(t * 13) + 0.06 * Math.sin(t * 7.3) + 0.05 * Math.sin(t * 23.1);
    sprite.current?.scale.set(0.034 * size * (2 - f), 0.1 * size * f, 1);
    if (lamp.current) lamp.current.intensity = light * (0.8 + 0.2 * f);
  });

  return (
    <group position={position}>
      <sprite ref={sprite} material={material} center={[0.5, 0.12]} />
      {light > 0 && (
        <pointLight
          ref={lamp}
          position={[0, 0.06 * size, 0]}
          color="#ffb25e"
          intensity={light}
          distance={lightDistance}
          decay={2}
        />
      )}
    </group>
  );
}

/** เทียนขี้ผึ้ง พร้อมไส้และเปลว */
export function Candle({
  position,
  height = 0.25,
  radius = 0.025,
  light = 0,
  lit = true,
}: {
  position: V3;
  height?: number;
  radius?: number;
  light?: number;
  lit?: boolean;
}) {
  const m = getMaterials();
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} material={m.candle} castShadow>
        <cylinderGeometry args={[radius, radius * 1.05, height, 16]} />
      </mesh>
      <mesh position={[0, height + 0.008, 0]} material={m.dark}>
        <cylinderGeometry args={[0.0025, 0.0025, 0.016, 4]} />
      </mesh>
      {lit && <Flame position={[0, height + 0.012, 0]} size={radius / 0.025} light={light} />}
    </group>
  );
}

const smokeVertex = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  uniform float uScale;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
    vAlpha = aAlpha;
  }
`;

const smokeFragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float a = texture2D(uTex, gl_PointCoord).a * vAlpha;
    gl_FragColor = vec4(uColor, a);
  }
`;

/** ควันธูปลอยขึ้นช้าๆ */
export function IncenseSmoke({ position, count = 36 }: { position: V3; count?: number }) {
  const { size, viewport } = useThree();
  const points = useRef<THREE.Points>(null);
  const { geometry, material, seeds } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(count), 1));
    geometry.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(count), 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: smokeVertex,
      fragmentShader: smokeFragment,
      uniforms: {
        uTex: { value: softTexture() },
        uColor: { value: new THREE.Color("#d8cfc4") },
        uScale: { value: 400 },
      },
      transparent: true,
      depthWrite: false,
    });
    const seeds = Array.from({ length: count }, (_, i) => ({
      offset: i / count,
      phase: hash(i) * Math.PI * 2,
      drift: (hash(i + 50) - 0.5) * 0.25,
    }));
    return { geometry, material, seeds };
  }, [count]);

  useFrame(({ clock }) => {
    material.uniforms.uScale.value = size.height * viewport.dpr * 0.5;
    const t = clock.elapsedTime;
    const pos = geometry.attributes.position.array as Float32Array;
    const sz = geometry.attributes.aSize.array as Float32Array;
    const al = geometry.attributes.aAlpha.array as Float32Array;
    seeds.forEach((s, i) => {
      const life = (t * 0.09 + s.offset) % 1;
      const sway = Math.sin(life * 7 + s.phase + t * 0.6) * 0.05 * (0.3 + life);
      pos[i * 3] = sway + s.drift * life;
      pos[i * 3 + 1] = life * 1.7;
      pos[i * 3 + 2] = Math.cos(life * 5 + s.phase) * 0.04 * life;
      sz[i] = 0.04 + life * 0.45;
      al[i] = Math.sin(life * Math.PI) * 0.16 * (1 - life * 0.5);
    });
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aSize.needsUpdate = true;
    geometry.attributes.aAlpha.needsUpdate = true;
  });

  return (
    <points
      ref={points}
      geometry={geometry}
      material={material}
      position={position}
      frustumCulled={false}
    />
  );
}
