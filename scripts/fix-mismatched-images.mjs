// Re-fetches a small hand-picked list of product images whose initial
// Wikimedia Commons match was a cooked dish/recipe photo instead of the
// raw ingredient, using more precise search terms. Merges results into
// the existing productImages.generated.json.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '../src/data/productImages.generated.json');

const fixes = {
  'banana-stem-veg': 'Banana pseudostem vegetable market',
  'baby-squid-squid': 'Squid market fresh seafood',
  'bamboo-basket-bamboo': 'Bamboo basket close up',
  'nendran-banana': 'Nendran banana bunch',
  'medium-prawn-prawn': 'Raw prawns close up market',
  'carpet-textile': 'Persian carpet textile pattern',
};

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
    if (attempt < 4) {
      await sleep(3000 * (attempt + 1));
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
  const result = JSON.parse(readFileSync(OUT_PATH, 'utf-8'));

  for (const [id, term] of Object.entries(fixes)) {
    const url = await fetchOne(term);
    if (url) {
      console.log(`${id}: ${result[id]} -> ${url}`);
      result[id] = url;
    } else {
      console.log(`${id}: no replacement found for "${term}", keeping existing`);
    }
    await sleep(1300);
  }

  writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
