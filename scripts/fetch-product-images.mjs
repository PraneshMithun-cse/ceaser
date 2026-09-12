// Fetches one relevant real photo per product from Wikimedia Commons'
// public search API (no key needed, openly-licensed media) and writes
// { [productId]: imageUrl } to src/data/productImages.generated.json.
// products.ts falls back to a placeholder for any id missing from that map.
//
// Anonymous requests to the Commons API are rate-limited fairly
// aggressively — this paces requests conservatively and backs off with
// retries when it hits the limit, saving progress incrementally so an
// interruption doesn't lose already-fetched images.
//
// Run: node scripts/fetch-product-images.mjs

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '../src/data/productImages.generated.json');
const REQUEST_DELAY_MS = 1200;
const MAX_RETRIES = 4;

const { execSync } = await import('node:child_process');
const productsJson = execSync(
  `npx tsx -e "import { products } from './src/data/products'; console.log(JSON.stringify(products.map(p => ({ id: p.id, name: p.name, group: p.group, categoryId: p.categoryId }))));"`,
  { cwd: join(__dirname, '..'), encoding: 'utf-8', maxBuffer: 1024 * 1024 * 20 },
);
const items = JSON.parse(productsJson.trim().split('\n').pop());

const existing = existsSync(OUT_PATH) ? JSON.parse(readFileSync(OUT_PATH, 'utf-8')) : {};

function searchTermFor(item) {
  const { name, group } = item;
  const hints = {
    Vegetables: 'vegetable',
    'Greens & Herbs': 'leafy vegetable',
    Bananas: 'banana',
    Mangoes: 'mango',
    Fruits: 'fruit',
    Grapes: 'grapes',
    Citrus: 'citrus fruit',
    Flowers: 'flower',
    'Jasmine Varieties': 'jasmine flower',
    Seafood: 'fish',
    'Prawns & Shrimp': 'prawn',
    Crab: 'crab',
    Squid: 'squid',
    'Pooja & Diya': 'india pooja',
    'Bamboo, Cane & Jute': 'handicraft',
    'Home Textiles': 'home textile',
    Scrap: '',
  };
  const hint = hints[group] ?? '';
  const cleanName = name.replace(/\s*\/\s*.*/, ''); // "Brinjal / Eggplant" -> "Brinjal"
  return hint && !cleanName.toLowerCase().includes(hint.split(' ').pop())
    ? `${cleanName} ${hint}`
    : cleanName;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchOne(term, attempt = 0) {
  const url =
    'https://commons.wikimedia.org/w/api.php?' +
    new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: term,
      gsrlimit: '1',
      gsrnamespace: '6',
      prop: 'imageinfo',
      iiprop: 'url|mime',
      iiurlwidth: '480',
      format: 'json',
      origin: '*',
    });
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'BuyloAppDevCatalog/1.0 (local dev, non-commercial demo app; contact: nierajfreestyle@gmail.com)',
    },
  });
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
    if (attempt < MAX_RETRIES) {
      const backoff = 3000 * (attempt + 1);
      await sleep(backoff);
      return fetchOne(term, attempt + 1);
    }
    return null;
  }
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const mime = info.mime || '';
  if (!mime.startsWith('image/') || mime === 'image/svg+xml') return null;
  return info.thumburl || info.url || null;
}

async function main() {
  const result = { ...existing };
  let done = 0;
  let fetchedThisRun = 0;
  const seenTerms = new Map();

  for (const item of items) {
    if (result[item.id]) {
      done++;
      continue; // already have an image for this id from a prior run
    }

    const term = searchTermFor(item);
    let url = seenTerms.get(term);
    if (url === undefined) {
      try {
        url = await fetchOne(term);
      } catch (err) {
        url = null;
      }
      seenTerms.set(term, url);
      await sleep(REQUEST_DELAY_MS);
    }
    if (url) {
      result[item.id] = url;
      fetchedThisRun++;
    }
    done++;

    if (done % 10 === 0) {
      writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));
      console.log(`${done}/${items.length} processed, ${Object.keys(result).length} total images (${fetchedThisRun} new this run)`);
    }
  }

  writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));
  console.log(`Done. ${Object.keys(result).length}/${items.length} products matched to a real image.`);
  console.log(`Written to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
