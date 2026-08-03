import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

function readEnv() {
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) {
    console.error('Missing .env at project root. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    process.exit(1);
  }
  const vars = {};
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (match) vars[match[1]] = match[2].trim();
  }
  return vars;
}

const env = readEnv();
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('.env must contain EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const source = readFileSync(join(here, 'index.html'), 'utf8');
const out = source
  .replaceAll('__SUPABASE_URL__', url)
  .replaceAll('__SUPABASE_ANON_KEY__', anonKey);

const dist = join(here, 'dist');
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, 'index.html'), out);
console.log('Built web/auth-landing/dist/index.html');
