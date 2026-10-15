import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const files = [];
function visit(dir) { for (const item of readdirSync(dir, { withFileTypes: true })) { const p = join(dir, item.name); if (item.isDirectory()) visit(p); else if (p.endsWith('.js')) files.push(p); } }
visit('tgcloud');
for (const path of files) {
 const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
 if (result.status) { process.stderr.write(result.stderr); process.exit(1); }
 const source = readFileSync(path, 'utf8');
 for (const [, dependency] of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
  if (dependency === 'sdk' || dependency.startsWith('sdk/')) continue;
  if (!dependency.startsWith('.') || !dependency.endsWith('.js') || !resolve(path, '..', dependency).startsWith(resolve('tgcloud') + '/')) throw new Error(`Invalid runtime dependency: ${path}: ${dependency}`);
  readFileSync(resolve(path, '..', dependency));
 }
}
console.log(`Checked ${files.length} runtime modules`);
