// Small dependency-free RGB PNG encoder for the Telegram V8 runtime.
// Uses uncompressed DEFLATE; no Node APIs or external chart service.
const W = 720, H = 360;
const FONT = {
 '0':['111','101','101','101','111'],'1':['010','110','010','010','111'],
 '2':['111','001','111','100','111'],'3':['111','001','111','001','111'],
 '4':['101','101','111','001','001'],'5':['111','100','111','001','111'],
 '6':['111','100','111','101','111'],'7':['111','001','010','010','010'],
 '8':['111','101','111','101','111'],'9':['111','101','111','001','111'],
 '.':['000','000','000','000','010'],':':['000','010','000','010','000'],
 '-':['000','000','111','000','000'],
};
function u32(n) { return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]; }
function crc(bytes) {
 let value = 0xffffffff;
 for (const byte of bytes) { value ^= byte; for (let k = 0; k < 8; k++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0); }
 return (value ^ 0xffffffff) >>> 0;
}
function join(parts) {
 const result = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let offset = 0;
 for (const part of parts) { result.set(part, offset); offset += part.length; } return result;
}
function chunk(type, data) {
 const body = join([Uint8Array.from(type, c => c.charCodeAt(0)), data]);
 return join([u32(data.length), body, u32(crc(body))]);
}
function deflate(bytes) {
 const parts = [Uint8Array.of(0x78, 0x01)];
 for (let i = 0; i < bytes.length; i += 65535) {
  const part = bytes.subarray(i, i + 65535), n = part.length;
  parts.push(Uint8Array.of(i + n === bytes.length ? 1 : 0, n & 255, n >>> 8, (~n) & 255, ((~n) >>> 8) & 255), part);
 }
 let a = 1, b = 0;
 for (const v of bytes) { a = (a + v) % 65521; b = (b + a) % 65521; }
 parts.push(u32(((b << 16) | a) >>> 0)); return join(parts);
}
export function chartPng(points, unit = 'toman', asset = 'usd') {
 if (points.length < 2 || points.some(p => !Number.isFinite(p.price) || !Number.isFinite(p.at))) throw new Error('Not enough valid chart data');
 const pixels = new Uint8Array(W * H * 3);
 for (let i = 0; i < pixels.length; i += 3) pixels.set([15, 23, 42], i);
 function dot(x, y, color) { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) pixels.set(color, (y * W + x) * 3); }
 function line(x0, y0, x1, y1, color, thick = 1) {
  const steps = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))) || 1;
  for (let i = 0; i <= steps; i++) for (let j = 0; j < thick; j++) dot(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps + j, color);
 }
 function label(text, x, y) {
  for (const c of String(text)) { const glyph = FONT[c]; if (glyph) for (let r = 0; r < 5; r++) for (let col = 0; col < 3; col++) if (glyph[r][col] === '1') for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) dot(x + col * 2 + a, y + r * 2 + b, [203, 213, 225]); x += 8; }
 }
 const divisor = unit === 'toman' && asset !== 'ons' ? 10 : 1;
 const values = points.map(p => p.price / divisor), low = Math.min(...values), high = Math.max(...values);
 const padding = (high - low) * .1 || Math.max(low * .005, 1), min = low - padding, max = high + padding;
 for (let i = 0; i <= 4; i++) {
  const y = 30 + i * 66; line(108, y, 690, y, [40, 53, 75]);
  label(Math.round(max - (max - min) * i / 4), 8, y - 4);
 }
 const first = points[0].at, last = points[points.length - 1].at;
 const x = at => 108 + (at - first) / (last - first || 1) * 582;
 const y = value => 294 - (value - min) / (max - min) * 264;
 const color = values[values.length - 1] >= values[0] ? [52, 211, 153] : [251, 113, 133];
 for (let i = 1; i < points.length; i++) line(x(points[i - 1].at), y(values[i - 1]), x(points[i].at), y(values[i]), color, 3);
 const time = at => new Date(at + 210 * 60000).toISOString().slice(5, 16).replace('T', ' ');
 label(time(first), 108, 322); label(time(last), 554, 322);
 const raw = new Uint8Array((W * 3 + 1) * H);
 for (let row = 0; row < H; row++) raw.set(pixels.subarray(row * W * 3, (row + 1) * W * 3), row * (W * 3 + 1) + 1);
 return join([Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10), chunk('IHDR', Uint8Array.from([...u32(W), ...u32(H), 8, 2, 0, 0, 0])), chunk('IDAT', deflate(raw)), chunk('IEND', new Uint8Array())]);
}
