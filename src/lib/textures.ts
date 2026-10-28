import * as THREE from "three";

// ลวดลายไทยทั้งหมดวาดด้วย canvas ตอนรันไทม์ ไม่ต้องโหลดรูปภาพ

const GOLD = "#d9a63a";
const GOLD_LIGHT = "#f3cf72";
const LACQUER = "#6a100c";

const cache = new Map<string, unknown>();

function cached<T>(key: string, make: () => T): T {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key) as T;
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

function toTexture(
  c: HTMLCanvasElement,
  { repeat, color = true }: { repeat?: [number, number]; color?: boolean } = {},
) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (repeat) t.repeat.set(...repeat);
  return t;
}

function speckle(g: CanvasRenderingContext2D, w: number, h: number, n: number, alpha: number) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = Math.random() > 0.5 ? `rgba(0,0,0,${alpha})` : `rgba(255,220,180,${alpha * 0.6})`;
    const s = 1 + Math.random() * 3;
    g.fillRect(Math.random() * w, Math.random() * h, s, s);
  }
}

/** ลายประจำยาม: ดอกสี่กลีบชี้สี่ทิศ */
function prajamYam(g: CanvasRenderingContext2D, x: number, y: number, r: number, gold: string, bg: string) {
  g.save();
  g.translate(x, y);
  g.fillStyle = gold;
  for (let k = 0; k < 4; k++) {
    g.save();
    g.rotate((k * Math.PI) / 2);
    g.beginPath();
    g.moveTo(0, -r * 0.15);
    g.bezierCurveTo(r * 0.45, -r * 0.35, r * 0.25, -r * 0.8, 0, -r);
    g.bezierCurveTo(-r * 0.25, -r * 0.8, -r * 0.45, -r * 0.35, 0, -r * 0.15);
    g.fill();
    g.rotate(Math.PI / 4);
    g.beginPath();
    g.moveTo(0, -r * 0.2);
    g.quadraticCurveTo(r * 0.18, -r * 0.45, 0, -r * 0.62);
    g.quadraticCurveTo(-r * 0.18, -r * 0.45, 0, -r * 0.2);
    g.fill();
    g.restore();
  }
  g.beginPath();
  g.arc(0, 0, r * 0.24, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = bg;
  g.beginPath();
  g.arc(0, 0, r * 0.11, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** ลายรดน้ำบนพื้นรัก: ตาข่ายข้าวหลามตัดกับดอกประจำยาม (ต่อกันได้ไร้รอยต่อ) */
function paintLacquer(g: CanvasRenderingContext2D, size: number, bg: string, gold: string, n = 4) {
  g.fillStyle = bg;
  g.fillRect(0, 0, size, size);
  const s = size / n;
  g.strokeStyle = gold;
  g.lineWidth = size / 220;
  for (let k = -n; k <= 2 * n; k++) {
    g.beginPath();
    g.moveTo(k * s, 0);
    g.lineTo(k * s + size, size);
    g.stroke();
    g.beginPath();
    g.moveTo(k * s, 0);
    g.lineTo(k * s - size, size);
    g.stroke();
  }
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      prajamYam(g, i * s, j * s, s * 0.34, gold, bg);
      if (i < n && j < n) {
        g.fillStyle = gold;
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2;
          g.beginPath();
          g.arc((i + 0.5) * s + Math.cos(a) * s * 0.07, (j + 0.5) * s + Math.sin(a) * s * 0.07, s * 0.045, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
  }
}

function lacquerCanvases(size = 512, n = 4) {
  const color = makeCanvas(size, size);
  paintLacquer(color.g, size, LACQUER, GOLD, n);
  speckle(color.g, size, size, 2500, 0.06);
  const mask = makeCanvas(size, size);
  paintLacquer(mask.g, size, "#000", "#fff", n);
  return { color: color.c, mask: mask.c };
}

export function lacquerTextures(repeat: [number, number] = [1, 1]) {
  return cached(`lacquer-${repeat}`, () => {
    const { color, mask } = lacquerCanvases();
    return {
      map: toTexture(color, { repeat }),
      mask: toTexture(mask, { repeat, color: false }),
    };
  });
}

/** กาบพรหมศร: สามเหลี่ยมทองเชิงเสา */
function kaabBand(
  g: CanvasRenderingContext2D,
  w: number,
  y: number,
  h: number,
  count: number,
  up: boolean,
  gold: string,
  bg: string,
) {
  const tw = w / count;
  for (let i = 0; i < count; i++) {
    const x = i * tw;
    const base = up ? y + h : y;
    const tip = up ? y : y + h;
    g.fillStyle = gold;
    g.beginPath();
    g.moveTo(x, base);
    g.lineTo(x + tw, base);
    g.lineTo(x + tw / 2, tip);
    g.closePath();
    g.fill();
    g.fillStyle = bg;
    const inset = tw * 0.16;
    g.beginPath();
    g.moveTo(x + inset, base - (up ? inset * 0.5 : -inset * 0.5));
    g.lineTo(x + tw - inset, base - (up ? inset * 0.5 : -inset * 0.5));
    g.lineTo(x + tw / 2, tip + (up ? h * 0.25 : -h * 0.25));
    g.closePath();
    g.fill();
    prajamYam(g, x + tw / 2, up ? y + h * 0.66 : y + h * 0.34, tw * 0.17, gold, bg);
  }
  g.fillStyle = gold;
  g.fillRect(0, up ? y + h - 6 : y, w, 6);
}

export function pillarTextures() {
  return cached("pillar", () => {
    const W = 512;
    const H = 2048;
    const paint = (g: CanvasRenderingContext2D, bg: string, gold: string, pattern: HTMLCanvasElement) => {
      g.fillStyle = g.createPattern(pattern, "repeat")!;
      g.fillRect(0, 0, W, H);
      g.fillStyle = bg;
      g.fillRect(0, 0, W, 250);
      g.fillRect(0, H - 300, W, 300);
      kaabBand(g, W, 10, 230, 8, false, gold, bg);
      kaabBand(g, W, H - 290, 280, 8, true, gold, bg);
      g.fillStyle = gold;
      g.fillRect(0, 250, W, 10);
      g.fillRect(0, H - 310, W, 10);
    };
    const tiles = lacquerCanvases(256, 4);
    const color = makeCanvas(W, H);
    paint(color.g, LACQUER, GOLD, tiles.color);
    const mask = makeCanvas(W, H);
    paint(mask.g, "#000", "#fff", tiles.mask);
    return { map: toTexture(color.c), mask: toTexture(mask.c, { color: false }) };
  });
}

function deity(g: CanvasRenderingContext2D, cx: number, by: number, s: number, robe: string) {
  g.fillStyle = "rgba(240,200,110,0.28)";
  g.beginPath();
  g.arc(cx, by - 100 * s, 34 * s, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = GOLD;
  g.beginPath();
  g.ellipse(cx, by, 52 * s, 11 * s, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = robe;
  g.beginPath();
  g.moveTo(cx - 46 * s, by - 2 * s);
  g.quadraticCurveTo(cx - 40 * s, by - 40 * s, cx - 24 * s, by - 76 * s);
  g.lineTo(cx + 24 * s, by - 76 * s);
  g.quadraticCurveTo(cx + 40 * s, by - 40 * s, cx + 46 * s, by - 2 * s);
  g.closePath();
  g.fill();
  g.strokeStyle = "rgba(20,6,4,0.6)";
  g.lineWidth = 1.5 * s;
  g.stroke();
  g.fillStyle = "#f0d6a8";
  g.beginPath();
  g.ellipse(cx, by - 62 * s, 5 * s, 15 * s, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(cx, by - 92 * s, 13 * s, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = GOLD_LIGHT;
  g.beginPath();
  g.moveTo(cx - 12 * s, by - 100 * s);
  g.lineTo(cx + 12 * s, by - 100 * s);
  g.lineTo(cx, by - 152 * s);
  g.closePath();
  g.fill();
  g.fillStyle = GOLD;
  for (let k = 0; k < 3; k++) g.fillRect(cx - (9 - k * 2.5) * s, by - (110 + k * 11) * s, (18 - k * 5) * s, 3 * s);
}

function kanok(g: CanvasRenderingContext2D, x: number, y: number, s: number) {
  g.fillStyle = GOLD;
  g.beginPath();
  g.moveTo(x, y);
  g.bezierCurveTo(x - 16 * s, y - 20 * s, x - 6 * s, y - 50 * s, x + 6 * s, y - 70 * s);
  g.bezierCurveTo(x + 2 * s, y - 45 * s, x + 18 * s, y - 25 * s, x, y);
  g.fill();
}

/** จิตรกรรมฝาผนัง: แถวเทพชุมนุม ลายสินเทา และพื้นลายประจำยาม */
export function muralTexture(repeatX: number) {
  return cached(`mural-${repeatX}`, () => {
    const W = 1024;
    const H = 1600;
    const { c, g } = makeCanvas(W, H);
    g.fillStyle = "#5a120e";
    g.fillRect(0, 0, W, H);

    g.fillStyle = "#2d0806";
    g.fillRect(0, 0, W, 110);
    g.fillStyle = GOLD;
    g.fillRect(0, 96, W, 12);
    for (let x = 0; x < W; x += 64) {
      g.fillStyle = GOLD;
      g.beginPath();
      g.moveTo(x, 108);
      g.lineTo(x + 64, 108);
      g.lineTo(x + 32, 160);
      g.closePath();
      g.fill();
      g.fillStyle = "#7d1a12";
      g.beginPath();
      g.moveTo(x + 12, 112);
      g.lineTo(x + 52, 112);
      g.lineTo(x + 32, 145);
      g.closePath();
      g.fill();
    }

    const robes = ["#2f6b4f", "#a32a1c", "#2c3f6b", "#e9dcc2", "#7a4a1c", "#3f6b2f"];
    for (let r = 0; r < 3; r++) {
      const baseY = 340 + r * 170;
      const grad = g.createLinearGradient(0, baseY - 165, 0, baseY + 10);
      grad.addColorStop(0, "#4a0f0b");
      grad.addColorStop(1, "#6e1d14");
      g.fillStyle = grad;
      g.fillRect(0, baseY - 165, W, 175);
      for (let i = 0; i < 6; i++) {
        const cx = 85 + i * 170 + (r % 2) * 0;
        deity(g, cx, baseY, 1, robes[(i + r * 2) % robes.length]);
        kanok(g, cx + 85, baseY - 6, 0.9);
      }
      g.fillStyle = GOLD;
      g.fillRect(0, baseY + 10, W, 4);
    }

    // ลายสินเทา (ซิกแซก)
    const zy = 840;
    g.fillStyle = "#1c0605";
    g.fillRect(0, zy, W, 60);
    g.fillStyle = "#efe2c4";
    g.beginPath();
    g.moveTo(0, zy + 50);
    for (let x = 0; x <= W; x += 32) g.lineTo(x, x % 64 === 0 ? zy + 50 : zy + 10);
    g.lineTo(W, zy + 60);
    g.lineTo(0, zy + 60);
    g.closePath();
    g.fill();
    g.fillStyle = GOLD;
    g.fillRect(0, zy - 6, W, 6);
    g.fillRect(0, zy + 60, W, 6);

    for (let y = 980; y < 1520; y += 120) {
      for (let x = 0; x <= W; x += 128) {
        prajamYam(g, x + ((y / 120) % 2) * 64, y, 26, "rgba(217,166,58,0.75)", "#5a120e");
      }
    }
    g.fillStyle = "#1c0605";
    g.fillRect(0, 1540, W, 60);
    g.fillStyle = GOLD;
    g.fillRect(0, 1536, W, 6);

    speckle(g, W, H, 9000, 0.07);
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const rg = g.createRadialGradient(x, y, 0, x, y, 40 + Math.random() * 120);
      rg.addColorStop(0, "rgba(20,5,3,0.18)");
      rg.addColorStop(1, "rgba(20,5,3,0)");
      g.fillStyle = rg;
      g.fillRect(0, 0, W, H);
    }
    return toTexture(c, { repeat: [repeatX, 1] });
  });
}

function bodhiLeaf(g: CanvasRenderingContext2D, x: number, y: number, len: number, angle: number) {
  g.save();
  g.translate(x, y);
  g.rotate(angle);
  g.beginPath();
  g.moveTo(0, 0);
  g.bezierCurveTo(-0.6 * len, -0.1 * len, -0.45 * len, -0.65 * len, 0, -len);
  g.bezierCurveTo(0.45 * len, -0.65 * len, 0.6 * len, -0.1 * len, 0, 0);
  g.fill();
  g.restore();
}

/** ฝาผนังหลังพระประธาน: ต้นพระศรีมหาโพธิ์ลายทองบนพื้นรักดำแดง */
export function bodhiTexture() {
  return cached("bodhi", () => {
    const W = 1600;
    const H = 1024;
    const { c, g } = makeCanvas(W, H);
    const bg = g.createRadialGradient(W / 2, H * 0.4, 50, W / 2, H * 0.4, W * 0.65);
    bg.addColorStop(0, "#5a110c");
    bg.addColorStop(1, "#1a0403");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    const leaves: [number, number][] = [];
    const branch = (x: number, y: number, a: number, len: number, w: number, depth: number) => {
      const ex = x + Math.cos(a) * len;
      const ey = y + Math.sin(a) * len;
      const bend = (Math.random() - 0.5) * len * 0.4;
      g.strokeStyle = GOLD;
      g.lineWidth = w;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo((x + ex) / 2 + bend, (y + ey) / 2, ex, ey);
      g.stroke();
      if (depth === 0) {
        leaves.push([ex, ey]);
        return;
      }
      const kids = depth > 4 ? 2 : 3;
      for (let k = 0; k < kids; k++) {
        const spread = (k - (kids - 1) / 2) * 0.55 + (Math.random() - 0.5) * 0.35;
        branch(ex, ey, a + spread, len * (0.68 + Math.random() * 0.12), w * 0.66, depth - 1);
      }
    };
    branch(W / 2, H, -Math.PI / 2, 240, 34, 7);

    g.fillStyle = GOLD;
    for (const [x, y] of leaves) {
      for (let k = 0; k < 5; k++) {
        g.globalAlpha = 0.55 + Math.random() * 0.45;
        bodhiLeaf(g, x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 50, 16 + Math.random() * 12, Math.random() * Math.PI * 2);
      }
    }
    g.globalAlpha = 1;
    g.fillStyle = GOLD_LIGHT;
    for (let i = 0; i < 260; i++) {
      g.beginPath();
      g.arc(Math.random() * W, Math.random() * H * 0.8, 1 + Math.random() * 2, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = GOLD;
    g.lineWidth = 10;
    g.strokeRect(24, 24, W - 48, H - 48);
    g.lineWidth = 3;
    g.strokeRect(44, 44, W - 88, H - 88);
    speckle(g, W, H, 8000, 0.06);
    return toTexture(c);
  });
}

/** ดาวเพดาน */
export function ceilingTexture() {
  return cached("ceiling", () => {
    const S = 512;
    const { c, g } = makeCanvas(S, S);
    g.fillStyle = "#3e0a08";
    g.fillRect(0, 0, S, S);
    g.strokeStyle = GOLD;
    g.lineWidth = 8;
    g.strokeRect(0, 0, S, S);
    g.lineWidth = 2;
    g.strokeRect(14, 14, S - 28, S - 28);
    const star = (cx: number, cy: number, ro: number, ri: number, points: number, fill: string) => {
      g.fillStyle = fill;
      g.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? ro : ri;
        const a = (i * Math.PI) / points - Math.PI / 2;
        g[i === 0 ? "moveTo" : "lineTo"](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      g.closePath();
      g.fill();
    };
    star(S / 2, S / 2, S * 0.36, S * 0.15, 8, GOLD);
    star(S / 2, S / 2, S * 0.2, S * 0.1, 8, "#7d1a12");
    g.fillStyle = GOLD_LIGHT;
    g.beginPath();
    g.arc(S / 2, S / 2, S * 0.06, 0, Math.PI * 2);
    g.fill();
    for (const [x, y] of [[0, 0], [S, 0], [0, S], [S, S]]) star(x, y, S * 0.14, S * 0.06, 8, GOLD);
    speckle(g, S, S, 1500, 0.06);
    return toTexture(c, { repeat: [6, 10.6] });
  });
}

export function carpetTexture() {
  return cached("carpet", () => {
    const W = 256;
    const H = 1024;
    const { c, g } = makeCanvas(W, H);
    g.fillStyle = "#7a1212";
    g.fillRect(0, 0, W, H);
    g.fillStyle = GOLD;
    g.fillRect(10, 0, 12, H);
    g.fillRect(W - 22, 0, 12, H);
    g.fillRect(30, 0, 3, H);
    g.fillRect(W - 33, 0, 3, H);
    for (let y = 0; y < H; y += 64) {
      g.save();
      g.translate(W / 2, y + 32);
      g.rotate(Math.PI / 4);
      g.strokeStyle = "rgba(217,166,58,0.7)";
      g.lineWidth = 3;
      g.strokeRect(-18, -18, 36, 36);
      g.restore();
      prajamYam(g, W / 2, y + 32, 12, "rgba(217,166,58,0.8)", "#7a1212");
    }
    speckle(g, W, H, 6000, 0.08);
    return toTexture(c, { repeat: [1, 1.45] });
  });
}

/** พื้นหินขัดสีแดงเข้ม ช่องละ 1 ม. */
export function floorTexture() {
  return cached("floor", () => {
    const S = 512;
    const { c, g } = makeCanvas(S, S);
    const t = S / 2;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const l = 16 + Math.random() * 4;
        g.fillStyle = `hsl(12, 42%, ${l}%)`;
        g.fillRect(i * t, j * t, t, t);
      }
    }
    speckle(g, S, S, 5000, 0.08);
    g.strokeStyle = "rgba(10,3,2,0.8)";
    g.lineWidth = 3;
    for (let k = 0; k <= 2; k++) {
      g.beginPath();
      g.moveTo(k * t, 0);
      g.lineTo(k * t, S);
      g.moveTo(0, k * t);
      g.lineTo(S, k * t);
      g.stroke();
    }
    return toTexture(c, { repeat: [7.5, 13.25] });
  });
}

/** ภาพนอกหน้าต่าง: ฟ้าสว่างกับยอดไม้ */
export function outsideTexture() {
  return cached("outside", () => {
    const W = 128;
    const H = 256;
    const { c, g } = makeCanvas(W, H);
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#fff8e8");
    sky.addColorStop(1, "#ffe0a8");
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 30; i++) {
      g.fillStyle = `rgba(${70 + Math.random() * 40},${100 + Math.random() * 40},50,0.55)`;
      g.beginPath();
      g.arc(Math.random() * W, H * 0.62 + Math.random() * H * 0.4, 14 + Math.random() * 26, 0, Math.PI * 2);
      g.fill();
    }
    return toTexture(c);
  });
}

/** ตาลปัตร: พื้นกำมะหยี่แดง ปักธรรมจักรทอง */
export function talapatTexture() {
  return cached("talapat", () => {
    const S = 512;
    const { c, g } = makeCanvas(S, S);
    g.fillStyle = "#5b0d1a";
    g.fillRect(0, 0, S, S);
    g.strokeStyle = GOLD;
    g.lineWidth = 10;
    g.beginPath();
    g.ellipse(S / 2, S / 2, S * 0.44, S * 0.44, 0, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = GOLD_LIGHT;
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      g.beginPath();
      g.arc(S / 2 + Math.cos(a) * S * 0.39, S / 2 + Math.sin(a) * S * 0.39, 5, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = GOLD_LIGHT;
    g.lineWidth = 12;
    g.beginPath();
    g.arc(S / 2, S / 2, S * 0.2, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 7;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.moveTo(S / 2 + Math.cos(a) * S * 0.04, S / 2 + Math.sin(a) * S * 0.04);
      g.lineTo(S / 2 + Math.cos(a) * S * 0.2, S / 2 + Math.sin(a) * S * 0.2);
      g.stroke();
      g.fillStyle = GOLD_LIGHT;
      g.beginPath();
      g.arc(S / 2 + Math.cos(a) * S * 0.255, S / 2 + Math.sin(a) * S * 0.255, 10, 0, Math.PI * 2);
      g.fill();
    }
    g.beginPath();
    g.arc(S / 2, S / 2, S * 0.05, 0, Math.PI * 2);
    g.fill();
    return toTexture(c);
  });
}

/** ผ้าลายขิดของหมอนขวาน */
export function pillowTexture() {
  return cached("pillow", () => {
    const S = 256;
    const { c, g } = makeCanvas(S, S);
    const bands = ["#8e1b14", GOLD, "#8e1b14", "#1f4d3a", "#8e1b14", GOLD, "#8e1b14"];
    const bh = S / bands.length;
    bands.forEach((col, i) => {
      g.fillStyle = col;
      g.fillRect(0, i * bh, S, bh);
      if (col !== GOLD) {
        g.fillStyle = "rgba(240,210,140,0.7)";
        for (let x = 0; x < S; x += 16) {
          g.beginPath();
          g.moveTo(x, i * bh + bh / 2);
          g.lineTo(x + 8, i * bh + 6);
          g.lineTo(x + 16, i * bh + bh / 2);
          g.lineTo(x + 8, i * bh + bh - 6);
          g.closePath();
          g.fill();
        }
      }
    });
    return toTexture(c);
  });
}

export function matTexture() {
  return cached("mat", () => {
    const S = 256;
    const { c, g } = makeCanvas(S, S);
    for (let y = 0; y < S; y += 4) {
      g.fillStyle = (y / 4) % 2 ? "#c9a777" : "#b8935f";
      g.fillRect(0, y, S, 4);
    }
    g.fillStyle = "rgba(140,30,25,0.85)";
    for (const y of [24, 40, S - 48, S - 32]) g.fillRect(0, y, S, 8);
    speckle(g, S, S, 1200, 0.08);
    return toTexture(c);
  });
}

export function flameTexture() {
  return cached("flame", () => {
    const { c, g } = makeCanvas(64, 128);
    g.save();
    g.scale(1, 2);
    const rg = g.createRadialGradient(32, 40, 0, 32, 36, 30);
    rg.addColorStop(0, "rgba(255,255,240,1)");
    rg.addColorStop(0.25, "rgba(255,226,140,0.95)");
    rg.addColorStop(0.55, "rgba(255,150,50,0.45)");
    rg.addColorStop(1, "rgba(255,80,0,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 64, 64);
    g.restore();
    const t = toTexture(c);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  });
}

export function softTexture() {
  return cached("soft", () => {
    const { c, g } = makeCanvas(64, 64);
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, "rgba(255,255,255,1)");
    rg.addColorStop(0.4, "rgba(255,255,255,0.45)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 64, 64);
    const t = toTexture(c);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  });
}

/** แสงแดดตกกระทบพื้น: สี่เหลี่ยมขอบฟุ้ง */
export function sunPatchTexture() {
  return cached("sunpatch", () => {
    const S = 256;
    const { c, g } = makeCanvas(S, S);
    g.fillStyle = "#fff";
    g.shadowColor = "#fff";
    g.shadowBlur = 36;
    g.fillRect(48, 48, S - 96, S - 96);
    const t = toTexture(c);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  });
}
