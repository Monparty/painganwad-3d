// ขอให้กล้องหันไปมองทิศที่กำหนด (เช่น ก้มมองขันน้ำตอนกรวดน้ำ) ผู้ใช้ลากมองที่อื่นต่อได้ตามปกติ

export const gazeState: { request: { yaw: number; pitch: number } | null } = { request: null };

export function requestGaze(yaw: number, pitch: number) {
  gazeState.request = { yaw, pitch };
}
