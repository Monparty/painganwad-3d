// กราบ 3 ครั้ง: UI กดปุ่ม → กล้องก้มลงตามจังหวะ

export const BOW_TIME = 1.8;
export const BOW_COUNT = 3;

export const bowState = { start: -1 };

export function requestBow() {
  if (bowState.start >= 0) return;
  bowState.start = performance.now();
}

/** ระดับการก้ม 0..1 ณ เวลาที่ผ่านไป (วินาที) */
export function bowAmount(elapsed: number) {
  const p = (elapsed % BOW_TIME) / BOW_TIME;
  const ease = (x: number) => x * x * (3 - 2 * x);
  if (p < 0.38) return ease(p / 0.38);
  if (p < 0.6) return 1;
  return 1 - ease((p - 0.6) / 0.4);
}
