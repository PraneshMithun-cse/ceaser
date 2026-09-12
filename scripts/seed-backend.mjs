// Seeds the local Ktor backend's Postgres database from the mobile app's
// own product catalog (src/data/products.ts), so /products on the backend
// serves the same 355 items the app currently ships as static mock data.
//
// Run: node scripts/seed-backend.mjs   (with the backend already running
// on localhost:8080 — see backend/README or just `./gradlew run`)

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_URL = process.env.API_URL || 'http://localhost:8080';
const BATCH_SIZE = 50;

// products.ts (via the Category type) require()'s local PNG icons — fine
// under Metro, but plain Node/tsx tries to parse them as JS. Stub image
// extensions to return the filename instead, since we only need the
// product data here, not the icons.
const script = [
  "const Module = require('module');",
  "for (const ext of ['.png', '.jpg', '.jpeg', '.otf', '.ttf']) {",
  "  Module._extensions[ext] = (mod, filename) => { mod.exports = filename; };",
  '}',
  "import('./src/data/products.ts').then(({ products }) => console.log(JSON.stringify(products)));",
].join('\n');

const productsJson = execSync(`npx tsx -e "${script.replace(/"/g, '\\"')}"`, {
  cwd: join(__dirname, '..'),
  encoding: 'utf-8',
  maxBuffer: 1024 * 1024 * 50,
});
const products = JSON.parse(productsJson.trim().split('\n').pop());

const dtos = products.map((p) => ({
  id: p.id,
  name: p.name,
  nameTamil: p.nameTamil ?? null,
  nameThanglish: p.nameThanglish ?? null,
  description: p.description ?? '',
  categoryId: p.categoryId,
  group: p.group,
  imageUri: p.imageUri,
  unit: p.unit,
  price: p.price,
  mrp: p.mrp,
}));

async function main() {
  console.log(`Seeding ${dtos.length} products to ${API_URL} in batches of ${BATCH_SIZE}...`);
  for (let i = 0; i < dtos.length; i += BATCH_SIZE) {
    const batch = dtos.slice(i, i + BATCH_SIZE);
    const res = await fetch(`${API_URL}/admin/products/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Batch ${i}-${i + batch.length} failed: ${res.status} ${text}`);
    }
    console.log(`  ${Math.min(i + BATCH_SIZE, dtos.length)}/${dtos.length}`);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
