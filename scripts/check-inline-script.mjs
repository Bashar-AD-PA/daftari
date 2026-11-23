import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const html = readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);

if (!scripts.length) throw new Error('No inline JavaScript found in index.html');

for (let index = 0; index < scripts.length; index += 1) {
  const file = join(tmpdir(), \`daftari-inline-\${index}.js\`);
  writeFileSync(file, scripts[index], 'utf8');
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(\`Syntax OK: checked \${scripts.length} inline script(s).\`);
