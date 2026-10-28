import * as THREE from "three";

export type V3 = [number, number, number];

// พระอุโบสถ: แกน -z คือทิศไปหาพระประธาน, ผู้ชมนั่งอยู่ใกล้ประตูด้านหน้า (+z)
export const HALL = { halfWidth: 7.5, back: -14.5, front: 12, height: 9.5 };
export const HALL_LENGTH = HALL.front - HALL.back;
export const HALL_CENTER_Z = (HALL.front + HALL.back) / 2;

export const PILLAR_X = 4.8;
export const PILLAR_Z = [-12, -8.5, -5, -1.5, 2, 5.5, 9];
export const WINDOW_Z = [-10.25, -6.75, -3.25, 0.25, 3.75, 7.25];
export const WINDOW = { bottom: 1.3, top: 3.9, width: 1.3 };

/** ทิศแสงแดดที่ส่องผ่านหน้าต่างฝั่งซ้าย */
export const SUN_DIR = new THREE.Vector3(1, -0.62, -0.32).normalize();

/** ตำแหน่งตาของผู้ชมที่นั่งพับเพียบบนพื้น */
export const VIEWER: V3 = [0, 1.05, 4.4];

export const PLATFORM = { top: 0.42, z: -0.75, width: 7.2, depth: 1.7 };
export const MONK_X = [-2.5, -1.25, 0, 1.25, 2.5];
export const MONK_Z = -0.75;
export const MONK_SEAT = PLATFORM.top + 0.04;

export const ALTAR_Z = -11.8;
