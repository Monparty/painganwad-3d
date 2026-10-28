import * as THREE from "three";
import { lacquerTextures, pillarTextures, pillowTexture } from "./textures";

function create() {
  const lacquer = lacquerTextures([2, 2]);
  const pillar = pillarTextures();

  const robe = (color: string) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.82,
      sheen: 1,
      sheenColor: new THREE.Color("#ffb46a"),
      sheenRoughness: 0.55,
    });

  return {
    gold: new THREE.MeshStandardMaterial({ color: "#e8b54a", metalness: 1, roughness: 0.28 }),
    goldDim: new THREE.MeshStandardMaterial({ color: "#c08a2c", metalness: 1, roughness: 0.42 }),
    buddhaGold: new THREE.MeshStandardMaterial({
      color: "#f4c65a",
      metalness: 1,
      roughness: 0.2,
      emissive: new THREE.Color("#5a3200"),
      emissiveIntensity: 0.35,
    }),
    lacquer: new THREE.MeshStandardMaterial({
      map: lacquer.map,
      metalnessMap: lacquer.mask,
      metalness: 1,
      roughness: 0.38,
    }),
    pillar: new THREE.MeshStandardMaterial({
      map: pillar.map,
      metalnessMap: pillar.mask,
      metalness: 1,
      roughness: 0.36,
      flatShading: true,
    }),
    red: new THREE.MeshStandardMaterial({ color: "#6a110d", roughness: 0.45 }),
    wood: new THREE.MeshStandardMaterial({ color: "#3b1d10", roughness: 0.55 }),
    cloth: new THREE.MeshStandardMaterial({ color: "#efe8da", roughness: 0.95 }),
    skin: new THREE.MeshStandardMaterial({ color: "#c08560", roughness: 0.62 }),
    scalp: new THREE.MeshStandardMaterial({
      color: "#2c2420",
      roughness: 0.9,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    }),
    dark: new THREE.MeshStandardMaterial({ color: "#1a0b07", roughness: 0.7 }),
    robes: ["#c8661c", "#b9561a", "#d07a2a", "#a8541f", "#c46a24"].map(robe),
    sash: robe("#9c4815"),
    candle: new THREE.MeshStandardMaterial({
      color: "#f4ead2",
      roughness: 0.45,
      emissive: new THREE.Color("#ffb060"),
      emissiveIntensity: 0.08,
    }),
    pillow: new THREE.MeshStandardMaterial({ map: pillowTexture(), roughness: 0.8 }),
    lotus: new THREE.MeshStandardMaterial({ color: "#f2a7b8", roughness: 0.6 }),
    leaf: new THREE.MeshStandardMaterial({ color: "#3f6b2a", roughness: 0.7 }),
    marigold: new THREE.MeshStandardMaterial({ color: "#f5a614", roughness: 0.75 }),
    jasmine: new THREE.MeshStandardMaterial({ color: "#f6f1e4", roughness: 0.7 }),
    incense: new THREE.MeshStandardMaterial({ color: "#7a2a18", roughness: 0.8 }),
    ember: new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 1.2, 0.3), toneMapped: false }),
  };
}

export type Materials = ReturnType<typeof create>;

let cache: Materials | null = null;

export function getMaterials() {
  cache ??= create();
  return cache;
}
