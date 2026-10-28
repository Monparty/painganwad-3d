"use client";

import { MeshReflectorMaterial } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { getMaterials } from "@/lib/materials";
import {
  bodhiTexture,
  carpetTexture,
  ceilingTexture,
  floorTexture,
  matTexture,
  muralTexture,
  outsideTexture,
} from "@/lib/textures";
import {
  HALL,
  HALL_CENTER_Z,
  HALL_LENGTH,
  PILLAR_X,
  PILLAR_Z,
  WINDOW,
  WINDOW_Z,
} from "./layout";
import { latheGeometry } from "./shapes";

const W = HALL.halfWidth * 2;
const BEAM_Y = HALL.height - 0.225;
const MURAL_WIDTH = (1024 / 1600) * HALL.height;

function capitalGeometry() {
  const parts: THREE.BufferGeometry[] = [
    latheGeometry(
      [
        [0.3, 0],
        [0.36, 0.08],
        [0.42, 0.25],
        [0.45, 0.45],
        [0.41, 0.6],
        [0.34, 0.7],
        [0.3, 0.75],
      ],
      24,
    ),
  ];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const petal = new THREE.SphereGeometry(1, 10, 8);
    petal.scale(0.09, 0.26, 0.04);
    petal.rotateX(-0.25);
    petal.translate(0, 0.32, 0.42);
    petal.rotateY(a);
    parts.push(petal);
  }
  return mergeGeometries(parts)!;
}

function Pillars() {
  const m = getMaterials();
  const capital = useMemo(() => capitalGeometry(), []);
  const H = BEAM_Y - 0.225;
  return (
    <>
      {PILLAR_Z.flatMap((z) =>
        [-PILLAR_X, PILLAR_X].map((x) => (
          <group key={`${x}:${z}`} position={[x, 0, z]}>
            <mesh position={[0, 0.16, 0]} material={m.gold} receiveShadow>
              <cylinderGeometry args={[0.44, 0.48, 0.32, 8]} />
            </mesh>
            <mesh position={[0, H / 2, 0]} material={m.pillar} castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.33, H, 8]} />
            </mesh>
            <mesh geometry={capital} position={[0, H - 0.78, 0]} material={m.gold} />
          </group>
        )),
      )}
    </>
  );
}

function Beams() {
  const m = getMaterials();
  return (
    <>
      {PILLAR_Z.map((z) => (
        <group key={z} position={[0, BEAM_Y, z]}>
          <mesh material={m.red}>
            <boxGeometry args={[W, 0.45, 0.32]} />
          </mesh>
          <mesh position={[0, -0.235, 0]} material={m.gold}>
            <boxGeometry args={[W, 0.04, 0.36]} />
          </mesh>
        </group>
      ))}
      {[-PILLAR_X, PILLAR_X].map((x) => (
        <mesh key={x} position={[x, BEAM_Y, HALL_CENTER_Z]} material={m.red}>
          <boxGeometry args={[0.34, 0.45, HALL_LENGTH]} />
        </mesh>
      ))}
    </>
  );
}

/** ซุ้มหน้าต่าง/ซุ้มประตู ทรงยอดแหลม */
function spireShape(width: number, height: number) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0);
  s.lineTo(width / 2, 0);
  s.quadraticCurveTo(width * 0.12, height * 0.18, 0.025, height);
  s.lineTo(-0.025, height);
  s.quadraticCurveTo(-width * 0.12, height * 0.18, -width / 2, 0);
  return s;
}

function Spire({ width, height, y }: { width: number; height: number; y: number }) {
  const m = getMaterials();
  const { outer, inner } = useMemo(
    () => ({
      outer: new THREE.ExtrudeGeometry(spireShape(width, height), {
        depth: 0.06,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.015,
        bevelSegments: 2,
      }),
      inner: new THREE.ShapeGeometry(spireShape(width * 0.72, height * 0.7)),
    }),
    [width, height],
  );
  return (
    <group position={[0, y, 0.02]}>
      <mesh geometry={outer} material={m.gold} />
      <mesh geometry={inner} position={[0, 0.05, 0.085]} material={m.red} />
    </group>
  );
}

function Opening({
  width,
  bottom,
  top,
  glow,
  shutterAngle = 1.95,
}: {
  width: number;
  bottom: number;
  top: number;
  glow: number;
  shutterAngle?: number;
}) {
  const m = getMaterials();
  const h = top - bottom;
  const yc = (top + bottom) / 2;
  const light = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: outsideTexture(),
        color: new THREE.Color(glow, glow * 0.96, glow * 0.88),
        toneMapped: false,
      }),
    [glow],
  );
  const frame = 0.09;
  return (
    <group>
      <mesh position={[0, yc, 0.01]} material={light}>
        <planeGeometry args={[width, h]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[(side * width) / 2, yc, 0.02]} rotation-y={side * shutterAngle}>
          <mesh position={[(-side * width) / 4, 0, 0]} material={m.lacquer} castShadow>
            <boxGeometry args={[width / 2, h, 0.05]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, top + frame / 2, 0.05]} material={m.gold}>
        <boxGeometry args={[width + frame * 2, frame, 0.1]} />
      </mesh>
      <mesh position={[0, bottom - frame / 2, 0.07]} material={m.gold}>
        <boxGeometry args={[width + frame * 3, frame, 0.16]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * (width + frame)) / 2, yc, 0.05]} material={m.gold}>
          <boxGeometry args={[frame, h, 0.1]} />
        </mesh>
      ))}
      <Spire width={width + 0.6} height={h * 0.42} y={top + frame} />
    </group>
  );
}

function Windows() {
  return (
    <>
      {WINDOW_Z.flatMap((z) =>
        [-1, 1].map((side) => (
          <group
            key={`${side}:${z}`}
            position={[side * (HALL.halfWidth - 0.01), 0, z]}
            rotation-y={side < 0 ? Math.PI / 2 : -Math.PI / 2}
          >
            <Opening
              width={WINDOW.width}
              bottom={WINDOW.bottom}
              top={WINDOW.top}
              glow={side < 0 ? 2.6 : 1.5}
            />
          </group>
        )),
      )}
    </>
  );
}

function Lamp({ x, z }: { x: number; z: number }) {
  const m = getMaterials();
  const y = 6.2;
  const glass = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.1, 1.2), toneMapped: false }),
    [],
  );
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, (HALL.height - y) / 2, 0]} material={m.dark}>
        <cylinderGeometry args={[0.008, 0.008, HALL.height - y, 4]} />
      </mesh>
      <mesh position={[0, -0.05, 0]} material={m.gold}>
        <coneGeometry args={[0.22, 0.32, 12, 1, true]} />
      </mesh>
      <mesh position={[0, -0.22, 0]} material={glass}>
        <sphereGeometry args={[0.09, 16, 12]} />
      </mesh>
    </group>
  );
}

export function Hall() {
  const m = getMaterials();
  const tex = useMemo(
    () => ({
      floor: floorTexture(),
      carpet: carpetTexture(),
      sideMural: muralTexture(HALL_LENGTH / MURAL_WIDTH),
      frontMural: muralTexture(W / MURAL_WIDTH),
      bodhi: bodhiTexture(),
      ceiling: ceilingTexture(),
      mat: matTexture(),
    }),
    [],
  );
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, HALL_CENTER_Z]} receiveShadow>
        <planeGeometry args={[W, HALL_LENGTH]} />
        <MeshReflectorMaterial
          map={tex.floor}
          blur={[400, 120]}
          resolution={512}
          mixBlur={1}
          mixStrength={1.6}
          mixContrast={1}
          roughness={0.55}
          metalness={0.1}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          mirror={0}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 4.5]} receiveShadow>
        <planeGeometry args={[2.4, 14]} />
        <meshStandardMaterial map={tex.carpet} roughness={0.95} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 4.55]} receiveShadow>
        <planeGeometry args={[1.1, 1.3]} />
        <meshStandardMaterial map={tex.mat} roughness={0.9} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * HALL.halfWidth, HALL.height / 2, HALL_CENTER_Z]}
          rotation-y={side < 0 ? Math.PI / 2 : -Math.PI / 2}
          receiveShadow
        >
          <planeGeometry args={[HALL_LENGTH, HALL.height]} />
          <meshStandardMaterial map={tex.sideMural} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, HALL.height / 2, HALL.back]} receiveShadow>
        <planeGeometry args={[W, HALL.height]} />
        <meshStandardMaterial map={tex.bodhi} roughness={0.7} metalness={0.15} />
      </mesh>
      <mesh position={[0, HALL.height / 2, HALL.front]} rotation-y={Math.PI}>
        <planeGeometry args={[W, HALL.height]} />
        <meshStandardMaterial map={tex.frontMural} roughness={0.85} />
      </mesh>
      <mesh position={[0, HALL.height, HALL_CENTER_Z]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[W, HALL_LENGTH]} />
        <meshStandardMaterial map={tex.ceiling} roughness={0.6} metalness={0.2} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * (HALL.halfWidth - 0.08), HALL.height - 0.2, HALL_CENTER_Z]} material={m.gold}>
            <boxGeometry args={[0.16, 0.3, HALL_LENGTH]} />
          </mesh>
          <mesh position={[side * (HALL.halfWidth - 0.05), 0.18, HALL_CENTER_Z]} material={m.dark}>
            <boxGeometry args={[0.1, 0.36, HALL_LENGTH]} />
          </mesh>
        </group>
      ))}

      <Pillars />
      <Beams />
      <Windows />

      {/* ประตูหน้าโบสถ์ เปิดรับแสงจากภายนอก */}
      <group position={[0, 0, HALL.front - 0.01]} rotation-y={Math.PI}>
        <Opening width={3} bottom={0} top={4.6} glow={3.2} shutterAngle={1.75} />
      </group>
      <pointLight position={[0, 3, HALL.front - 1]} color="#fff1dc" intensity={25} distance={14} decay={2} />

      {[-6.5, -2.5, 2.5, 7].flatMap((z) =>
        [-2.6, 2.6].map((x) => <Lamp key={`${x}:${z}`} x={x} z={z} />),
      )}
    </group>
  );
}
