// Dependency-free detailed RGB PNG chart renderer for the Telegram V8 runtime.
// Uses uncompressed DEFLATE; no Node APIs or external chart service.
const W = 720,
  H = 360;

const FONT = {
  "0": ["111", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "111"],
  "2": ["111", "001", "111", "100", "111"],
  "3": ["111", "001", "111", "001", "111"],
  "4": ["101", "101", "111", "001", "001"],
  "5": ["111", "100", "111", "001", "111"],
  "6": ["111", "100", "111", "101", "111"],
  "7": ["111", "001", "010", "010", "010"],
  "8": ["111", "101", "111", "101", "111"],
  "9": ["111", "101", "111", "001", "111"],
  ".": ["000", "000", "000", "000", "010"],
  ",": ["000", "000", "000", "010", "100"],
  ":": ["000", "010", "000", "010", "000"],
  "-": ["000", "000", "111", "000", "000"],
  "+": ["000", "010", "111", "010", "000"],
  "%": ["101", "001", "010", "100", "101"],
  "/": ["001", "001", "010", "100", "100"],
  " ": ["000", "000", "000", "000", "000"],
  A: ["010", "101", "111", "101", "101"],
  B: ["110", "101", "110", "101", "110"],
  C: ["011", "100", "100", "100", "011"],
  D: ["110", "101", "101", "101", "110"],
  E: ["111", "100", "110", "100", "111"],
  F: ["111", "100", "110", "100", "100"],
  G: ["011", "100", "101", "101", "011"],
  H: ["101", "101", "111", "101", "101"],
  I: ["111", "010", "010", "010", "111"],
  J: ["001", "001", "001", "101", "010"],
  K: ["101", "101", "110", "101", "101"],
  L: ["100", "100", "100", "100", "111"],
  M: ["101", "111", "111", "101", "101"],
  N: ["101", "111", "111", "111", "101"],
  O: ["010", "101", "101", "101", "010"],
  P: ["110", "101", "110", "100", "100"],
  Q: ["010", "101", "101", "111", "011"],
  R: ["110", "101", "110", "101", "101"],
  S: ["011", "100", "010", "001", "110"],
  T: ["111", "010", "010", "010", "010"],
  U: ["101", "101", "101", "101", "111"],
  V: ["101", "101", "101", "101", "010"],
  W: ["101", "101", "111", "111", "101"],
  X: ["101", "101", "010", "101", "101"],
  Y: ["101", "101", "010", "010", "010"],
  Z: ["111", "001", "010", "100", "111"],
};

function u32(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
}
function crc(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let k = 0; k < 8; k++)
      value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
}
function join(parts) {
  const result = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}
function chunk(type, data) {
  const body = join([Uint8Array.from(type, (c) => c.charCodeAt(0)), data]);
  return join([u32(data.length), body, u32(crc(body))]);
}
function deflate(bytes) {
  const parts = [Uint8Array.of(0x78, 0x01)];
  for (let i = 0; i < bytes.length; i += 65535) {
    const part = bytes.subarray(i, i + 65535),
      n = part.length;
    parts.push(
      Uint8Array.of(
        i + n === bytes.length ? 1 : 0,
        n & 255,
        n >>> 8,
        ~n & 255,
        (~n >>> 8) & 255,
      ),
      part,
    );
  }
  let a = 1,
    b = 0;
  for (const v of bytes) {
    a = (a + v) % 65521;
    b = (b + a) % 65521;
  }
  parts.push(u32(((b << 16) | a) >>> 0));
  return join(parts);
}

function formatNumber(n, isOunce = false) {
  if (!Number.isFinite(n)) return "0";
  const rounded = isOunce ? Math.round(n * 100) / 100 : Math.round(n);
  const [intPart, decPart] = String(rounded).split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart ? `${withCommas}.${decPart}` : withCommas;
}

export function chartPng(points, unit = "toman", asset = "usd") {
  if (
    points.length < 2 ||
    points.some((p) => !Number.isFinite(p.price) || !Number.isFinite(p.at))
  )
    throw new Error("Not enough valid chart data");

  const pixels = new Uint8Array(W * H * 3);
  // Deep obsidian background (#070c1a)
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = 7;
    pixels[i + 1] = 12;
    pixels[i + 2] = 26;
  }

  function blend(x, y, color, alpha = 1) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const idx = (y * W + x) * 3;
    if (alpha >= 1) {
      pixels[idx] = color[0];
      pixels[idx + 1] = color[1];
      pixels[idx + 2] = color[2];
    } else {
      pixels[idx] = Math.round(pixels[idx] * (1 - alpha) + color[0] * alpha);
      pixels[idx + 1] = Math.round(
        pixels[idx + 1] * (1 - alpha) + color[1] * alpha,
      );
      pixels[idx + 2] = Math.round(
        pixels[idx + 2] * (1 - alpha) + color[2] * alpha,
      );
    }
  }

  function fillRect(x0, y0, x1, y1, color, alpha = 1) {
    const startX = Math.max(0, Math.round(x0)),
      endX = Math.min(W - 1, Math.round(x1));
    const startY = Math.max(0, Math.round(y0)),
      endY = Math.min(H - 1, Math.round(y1));
    for (let py = startY; py <= endY; py++) {
      for (let px = startX; px <= endX; px++) {
        blend(px, py, color, alpha);
      }
    }
  }

  function line(x0, y0, x1, y1, color, thick = 1, alpha = 1) {
    const steps =
      Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))) || 1;
    const half = Math.floor(thick / 2);
    for (let i = 0; i <= steps; i++) {
      const px = x0 + ((x1 - x0) * i) / steps;
      const py = y0 + ((y1 - y0) * i) / steps;
      for (let dy = -half; dy <= thick - 1 - half; dy++) {
        for (let dx = -half; dx <= thick - 1 - half; dx++) {
          blend(px + dx, py + dy, color, alpha);
        }
      }
    }
  }

  function dashedLine(x0, y0, x1, y1, color, dash = 4, gap = 4, alpha = 0.65) {
    const steps =
      Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))) || 1;
    const cycle = dash + gap;
    for (let i = 0; i <= steps; i++) {
      if (i % cycle < dash) {
        blend(
          x0 + ((x1 - x0) * i) / steps,
          y0 + ((y1 - y0) * i) / steps,
          color,
          alpha,
        );
      }
    }
  }

  function circle(cx, cy, r, color, fill = true) {
    const r2 = r * r;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const d2 = dx * dx + dy * dy;
        if (fill ? d2 <= r2 : Math.abs(Math.sqrt(d2) - r) <= 1.1) {
          blend(cx + dx, cy + dy, color, 1);
        }
      }
    }
  }

  function label(text, x, y, color = [203, 213, 225], scale = 2) {
    const str = String(text).toUpperCase();
    for (const c of str) {
      const glyph = FONT[c];
      if (glyph) {
        for (let r = 0; r < 5; r++) {
          for (let col = 0; col < 3; col++) {
            if (glyph[r][col] === "1") {
              for (let a = 0; a < scale; a++) {
                for (let b = 0; b < scale; b++) {
                  blend(x + col * scale + a, y + r * scale + b, color, 1);
                }
              }
            }
          }
        }
      }
      x += c === "," || c === "." || c === ":" ? scale * 3 : scale * 4;
    }
  }

  // Top Header Bar
  fillRect(0, 0, W - 1, 38, [13, 22, 45], 1);
  line(0, 39, W - 1, 39, [38, 52, 84], 1, 1);

  const isOunce = asset === "ons";
  const divisor = unit === "toman" && !isOunce ? 10 : 1;
  const values = points.map((p) => p.price / divisor);
  const highs = points.map((p) => (p.high ?? p.price) / divisor);
  const lows = points.map((p) => (p.low ?? p.price) / divisor);

  const low = Math.min(...lows);
  const high = Math.max(...highs);
  const avg = values.reduce((acc, v) => acc + v, 0) / values.length;
  const firstVal = values[0];
  const lastVal = values[values.length - 1];
  const changePct =
    firstVal > 0 ? ((lastVal - firstVal) / firstVal) * 100 : 0;
  const isUp = lastVal >= firstVal;

  const mainColor = isUp ? [52, 211, 153] : [251, 113, 133];
  const goldColor = [251, 191, 36];

  const unitCode = isOunce ? "USD" : unit === "rial" ? "RIAL" : "TOMAN";
  label(`${String(asset).toUpperCase()}/${unitCode}`, 14, 14, goldColor, 2);
  label(`LAST:${formatNumber(lastVal, isOunce)}`, 150, 14, [248, 250, 252], 2);

  const pctSign = changePct > 0 ? "+" : "";
  label(
    `${pctSign}${changePct.toFixed(2)}%`,
    340,
    14,
    mainColor,
    2,
  );
  label(
    `HI:${formatNumber(high, isOunce)} LO:${formatNumber(low, isOunce)}`,
    450,
    14,
    [148, 163, 184],
    2,
  );

  // Plot geometry
  const plotLeft = 118,
    plotRight = 696,
    plotTop = 54,
    plotBottom = 294;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  // Subtle plot background card
  fillRect(plotLeft, plotTop, plotRight, plotBottom, [11, 18, 37], 0.85);

  const padding = (high - low) * 0.12 || Math.max(low * 0.005, 1);
  const min = low - padding,
    max = high + padding;

  const firstAt = points[0].at,
    lastAt = points[points.length - 1].at;
  const x = (at) =>
    plotLeft + ((at - firstAt) / (lastAt - firstAt || 1)) * plotW;
  const y = (value) =>
    plotBottom - ((value - min) / (max - min || 1)) * plotH;

  // Horizontal grid lines + formatted price axis labels
  for (let i = 0; i <= 4; i++) {
    const gy = plotTop + (i * plotH) / 4;
    const gVal = max - ((max - min) * i) / 4;
    dashedLine(plotLeft, gy, plotRight, gy, [38, 52, 84], 5, 4, 0.85);
    label(formatNumber(gVal, isOunce), 10, gy - 4, [148, 163, 184], 2);
  }

  // Vertical time grid lines & timestamps
  const timeFmt = (at) =>
    new Date(at + 210 * 60000)
      .toISOString()
      .slice(5, 16)
      .replace("T", " ");
  for (let i = 0; i <= 3; i++) {
    const gx = plotLeft + (i * plotW) / 3;
    const tAt = firstAt + ((lastAt - firstAt) * i) / 3;
    dashedLine(gx, plotTop, gx, plotBottom, [30, 41, 68], 4, 5, 0.75);
    const tx = i === 3 ? gx - 82 : i === 0 ? gx : gx - 40;
    label(timeFmt(tAt), tx, 312, [148, 163, 184], 2);
  }

  // Dashed average line
  const avgY = y(avg);
  if (avgY >= plotTop && avgY <= plotBottom) {
    dashedLine(plotLeft, avgY, plotRight, avgY, goldColor, 3, 5, 0.55);
    label("AVG", plotRight - 28, Math.max(plotTop + 4, avgY - 12), goldColor, 2);
  }

  // Area gradient fill under curve
  for (let i = 1; i < points.length; i++) {
    const x0 = Math.round(x(points[i - 1].at)),
      y0 = y(values[i - 1]);
    const x1 = Math.round(x(points[i].at)),
      y1 = y(values[i]);
    const span = Math.max(1, x1 - x0);
    for (let px = x0; px <= x1; px++) {
      const t = (px - x0) / span;
      const topY = Math.round(y0 + (y1 - y0) * t);
      for (let py = topY; py <= plotBottom; py++) {
        const ratio = 1 - (py - plotTop) / plotH;
        const alpha = Math.max(0.02, ratio * 0.24);
        blend(px, py, mainColor, alpha);
      }
    }
  }

  // Optional OHLC high/low wicks if points have distinct high/low
  for (let i = 0; i < points.length; i++) {
    if (highs[i] > lows[i]) {
      const px = x(points[i].at);
      line(px, y(highs[i]), px, y(lows[i]), mainColor, 1, 0.45);
    }
  }

  // Main price curve
  for (let i = 1; i < points.length; i++) {
    line(
      x(points[i - 1].at),
      y(values[i - 1]),
      x(points[i].at),
      y(values[i]),
      mainColor,
      3,
      1,
    );
  }

  // Highlighted High, Low, and Last markers
  let maxIdx = 0,
    minIdx = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] >= values[maxIdx]) maxIdx = i;
    if (values[i] <= values[minIdx]) minIdx = i;
  }

  if (high > low) {
    const hx = x(points[maxIdx].at),
      hy = y(values[maxIdx]);
    circle(hx, hy, 4, [52, 211, 153], true);
    const lx = x(points[minIdx].at),
      ly = y(values[minIdx]);
    circle(lx, ly, 4, [251, 113, 133], true);
  }

  const lastX = x(lastAt),
    lastY = y(lastVal);
  circle(lastX, lastY, 6, goldColor, false);
  circle(lastX, lastY, 3, goldColor, true);

  // Outer plot frame border
  line(plotLeft, plotTop, plotRight, plotTop, [45, 62, 98], 1, 1);
  line(plotLeft, plotBottom, plotRight, plotBottom, [45, 62, 98], 1, 1);
  line(plotLeft, plotTop, plotLeft, plotBottom, [45, 62, 98], 1, 1);
  line(plotRight, plotTop, plotRight, plotBottom, [45, 62, 98], 1, 1);

  // Footer info
  label(
    `SAMPLES:${points.length}  AVG:${formatNumber(avg, isOunce)}`,
    plotLeft,
    336,
    [100, 116, 139],
    2,
  );
  label("ZARPAYESH TERMINAL", plotRight - 148, 336, goldColor, 2);

  const raw = new Uint8Array((W * 3 + 1) * H);
  for (let row = 0; row < H; row++)
    raw.set(
      pixels.subarray(row * W * 3, (row + 1) * W * 3),
      row * (W * 3 + 1) + 1,
    );
  return join([
    Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10),
    chunk("IHDR", Uint8Array.from([...u32(W), ...u32(H), 8, 2, 0, 0, 0])),
    chunk("IDAT", deflate(raw)),
    chunk("IEND", new Uint8Array()),
  ]);
}
