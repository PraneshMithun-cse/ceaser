// Mock marketplace data — 5 category verticals replacing the earlier
// food-only (kidulan) catalog. Product photos are seeded placeholders
// (picsum.photos, deterministic per seed — no real product photography
// exists for these categories yet) until real vendor imagery is sourced.
//
// Vegetables & Fruits is generated from the user-supplied English/Tamil
// naming tables (vegFruitCatalog.ts) rather than hand-authored per item —
// ~175 entries across 7 subgroups. Prices are a deterministic mock (hashed
// per name into a plausible per-group ₹ range), since there is no real
// pricing source; swap in real vendor pricing when available.

import {
  bananaVarieties,
  citrusVarieties,
  generalFruits,
  grapeVarieties,
  greensAndHerbs,
  mangoVarieties,
  rootsAndVegetables,
  type CatalogEntry,
} from './vegFruitCatalog';
import { flowerVarieties, jasmineVarieties } from './flowerCatalog';
import { crabVarieties, prawnVarieties, seafoodVarieties, squidVarieties } from './seafoodCatalog';
import { bambooCaneJute, homeTextiles, poojaAndDiya } from './decorCatalog';
import realProductImages from './productImages.generated.json';

export type Product = {
  id: string;
  name: string;
  nameTamil?: string;
  nameThanglish?: string;
  description: string;
  categoryId: string;
  group: string;
  imageUri: string;
  unit: string;
  price: number;
  mrp: number;
};

export type Category = {
  id: string;
  label: string;
  shortLabel: string;
  tint: string;
  icon: ReturnType<typeof require>;
};

export const categories: Category[] = [
  {
    id: 'veg-fruits',
    label: 'Vegetables & Fruits',
    shortLabel: 'Veg & Fruits',
    tint: '#facb48',
    icon: require('../../assets/categories/veg-fruits.png'),
  },
  {
    id: 'seafood',
    label: 'Seafood',
    shortLabel: 'Seafood',
    tint: '#e7654f',
    icon: require('../../assets/categories/seafood.png'),
  },
  {
    id: 'flowers',
    label: 'Flowers',
    shortLabel: 'Flowers',
    tint: '#f1a23b',
    icon: require('../../assets/categories/flowers.png'),
  },
  {
    id: 'scrap',
    label: 'Scrap Dealers',
    shortLabel: 'Scrap Dealers',
    tint: '#a8573f',
    icon: require('../../assets/categories/scrap.png'),
  },
  {
    id: 'decor',
    label: 'Accessories & Home Decor',
    shortLabel: 'Home Decor',
    tint: '#0d2f28',
    icon: require('../../assets/categories/home-decor.png'),
  },
];

function seedImage(seed: string) {
  return `https://picsum.photos/seed/${seed}/400/400`;
}

const imageMap: Record<string, string> = realProductImages;

// Real photo fetched from Wikimedia Commons for this product id, if the
// image-fetch script found a match; otherwise a stable placeholder.
function imageFor(id: string) {
  return imageMap[id] ?? seedImage(`buylo-${id}`);
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Deterministic 0..1 pseudo-random from a string, so prices are stable
// across renders/reloads without needing a persisted random seed.
function hashUnit(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return (h % 1000) / 1000;
}

function priceIn(name: string, min: number, max: number) {
  return Math.round(min + hashUnit(name) * (max - min));
}

function withMarkup(price: number, pct = 0.15) {
  return Math.round(price * (1 + pct));
}

function buildGroup(
  entries: CatalogEntry[],
  opts: {
    categoryId: string;
    group: string;
    idSuffix: string;
    unit: string;
    priceMin: number;
    priceMax: number;
    descTemplate: (e: CatalogEntry) => string;
  },
): Product[] {
  const seen = new Map<string, number>();
  return entries.map((e) => {
    let baseId = `${slugify(e.en)}-${opts.idSuffix}`;
    const count = seen.get(baseId) ?? 0;
    seen.set(baseId, count + 1);
    if (count > 0) baseId = `${baseId}-${count + 1}`;

    const price = priceIn(e.en + opts.idSuffix, opts.priceMin, opts.priceMax);
    return {
      id: baseId,
      name: e.en,
      nameTamil: e.ta || undefined,
      nameThanglish: e.thanglish,
      description: opts.descTemplate(e),
      categoryId: opts.categoryId,
      group: opts.group,
      imageUri: imageFor(baseId),
      unit: opts.unit,
      price,
      mrp: withMarkup(price),
    };
  });
}

const vegetableProducts = buildGroup(rootsAndVegetables, {
  categoryId: 'veg-fruits',
  group: 'Vegetables',
  idSuffix: 'veg',
  unit: '1 kg',
  priceMin: 18,
  priceMax: 90,
  descTemplate: (e) => `${e.thanglish}${e.ta ? ` (${e.ta})` : ''} — fresh, farm-sourced ${e.en.toLowerCase()}.`,
});

const greensProducts = buildGroup(greensAndHerbs, {
  categoryId: 'veg-fruits',
  group: 'Greens & Herbs',
  idSuffix: 'green',
  unit: '1 bunch',
  priceMin: 10,
  priceMax: 35,
  descTemplate: (e) => `${e.thanglish}${e.ta ? ` (${e.ta})` : ''} — fresh-cut leafy greens, sold by the bunch.`,
});

const bananaProducts = buildGroup(bananaVarieties, {
  categoryId: 'veg-fruits',
  group: 'Bananas',
  idSuffix: 'banana',
  unit: '1 dozen',
  priceMin: 40,
  priceMax: 110,
  descTemplate: (e) => `${e.thanglish} banana — a regional variety, sold by the dozen.`,
});

const mangoProducts = buildGroup(mangoVarieties, {
  categoryId: 'veg-fruits',
  group: 'Mangoes',
  idSuffix: 'mango',
  unit: '1 kg',
  priceMin: 90,
  priceMax: 320,
  descTemplate: (e) => `${e.thanglish} mango — seasonal variety, sold by the kilogram.`,
});

const fruitProducts = buildGroup(generalFruits, {
  categoryId: 'veg-fruits',
  group: 'Fruits',
  idSuffix: 'fruit',
  unit: '1 kg',
  priceMin: 40,
  priceMax: 350,
  descTemplate: (e) => `${e.thanglish}${e.ta ? ` (${e.ta})` : ''} — fresh ${e.en.toLowerCase()}, sold by the kilogram.`,
});

const grapeProducts = buildGroup(grapeVarieties, {
  categoryId: 'veg-fruits',
  group: 'Grapes',
  idSuffix: 'grape',
  unit: '1 kg',
  priceMin: 70,
  priceMax: 180,
  descTemplate: (e) => `${e.thanglish} grapes — sold by the kilogram.`,
});

const citrusProducts = buildGroup(citrusVarieties, {
  categoryId: 'veg-fruits',
  group: 'Citrus',
  idSuffix: 'citrus',
  unit: '1 kg',
  priceMin: 30,
  priceMax: 100,
  descTemplate: (e) => `${e.thanglish}${e.ta ? ` (${e.ta})` : ''} — fresh citrus, sold by the kilogram.`,
});

const vegFruitsProducts: Product[] = [
  ...vegetableProducts,
  ...greensProducts,
  ...bananaProducts,
  ...mangoProducts,
  ...fruitProducts,
  ...grapeProducts,
  ...citrusProducts,
];

const flowerProducts = buildGroup(flowerVarieties, {
  categoryId: 'flowers',
  group: 'Flowers',
  idSuffix: 'flower',
  unit: '1 bunch',
  priceMin: 15,
  priceMax: 120,
  descTemplate: (e) => `${e.thanglish}${e.ta ? ` (${e.ta})` : ''} — fresh-cut, sold by the bunch.`,
});

const jasmineProducts = buildGroup(jasmineVarieties, {
  categoryId: 'flowers',
  group: 'Jasmine Varieties',
  idSuffix: 'jasmine',
  unit: '100 g',
  priceMin: 30,
  priceMax: 90,
  descTemplate: (e) => `${e.thanglish}${e.ta ? ` (${e.ta})` : ''} — fresh jasmine, sold by weight.`,
});

const seafoodProducts = buildGroup(seafoodVarieties, {
  categoryId: 'seafood',
  group: 'Seafood',
  idSuffix: 'seafood',
  unit: '1 kg',
  priceMin: 150,
  priceMax: 900,
  descTemplate: (e) => `${e.thanglish}${e.ta ? ` (${e.ta})` : ''} — today's catch, sold by the kilogram.`,
});

const prawnProducts = buildGroup(prawnVarieties, {
  categoryId: 'seafood',
  group: 'Prawns & Shrimp',
  idSuffix: 'prawn',
  unit: '500 g',
  priceMin: 200,
  priceMax: 700,
  descTemplate: (e) => `${e.thanglish}${e.ta ? ` (${e.ta})` : ''} — fresh, sold by the 500g pack.`,
});

const crabProducts = buildGroup(crabVarieties, {
  categoryId: 'seafood',
  group: 'Crab',
  idSuffix: 'crab',
  unit: '1 kg',
  priceMin: 250,
  priceMax: 800,
  descTemplate: (e) => `${e.thanglish}${e.ta ? ` (${e.ta})` : ''} — live/fresh catch, sold by the kilogram.`,
});

const squidProducts = buildGroup(squidVarieties, {
  categoryId: 'seafood',
  group: 'Squid',
  idSuffix: 'squid',
  unit: '500 g',
  priceMin: 180,
  priceMax: 450,
  descTemplate: (e) => `${e.thanglish}${e.ta ? ` (${e.ta})` : ''} — fresh, sold by the 500g pack.`,
});

const flowerAndSeafoodProducts: Product[] = [
  ...flowerProducts,
  ...jasmineProducts,
  ...seafoodProducts,
  ...prawnProducts,
  ...crabProducts,
  ...squidProducts,
];

const poojaProducts = buildGroup(poojaAndDiya, {
  categoryId: 'decor',
  group: 'Pooja & Diya',
  idSuffix: 'pooja',
  unit: '1 piece',
  priceMin: 49,
  priceMax: 799,
  descTemplate: (e) => `${e.en}${e.ta ? ` (${e.ta})` : ''} — for pooja and festive decor.`,
});

const bambooCaneProducts = buildGroup(bambooCaneJute, {
  categoryId: 'decor',
  group: 'Bamboo, Cane & Jute',
  idSuffix: 'bamboo',
  unit: '1 piece',
  priceMin: 199,
  priceMax: 1299,
  descTemplate: (e) => `${e.en}${e.ta ? ` (${e.ta})` : ''} — handcrafted natural-fibre home decor.`,
});

const homeTextileProducts = buildGroup(homeTextiles, {
  categoryId: 'decor',
  group: 'Home Textiles',
  idSuffix: 'textile',
  unit: '1 piece',
  priceMin: 149,
  priceMax: 1999,
  descTemplate: (e) => `${e.en}${e.ta ? ` (${e.ta})` : ''} — home textile for everyday living.`,
});

const decorProducts: Product[] = [...poojaProducts, ...bambooCaneProducts, ...homeTextileProducts];

const otherProducts: Product[] = [
  {
    id: 'scrap-metal-pickup',
    name: 'Scrap Metal Pickup',
    description: 'Doorstep pickup for iron, copper & aluminium scrap — instant payout.',
    categoryId: 'scrap',
    group: 'Scrap',
    imageUri: imageFor('scrap-metal-pickup'),
    unit: 'per kg',
    price: 38,
    mrp: 38,
  },
  {
    id: 'newspaper-bundle',
    name: 'Old Newspaper & Cardboard',
    description: 'Doorstep pickup for old newspapers, cardboard and paper waste.',
    categoryId: 'scrap',
    group: 'Scrap',
    imageUri: imageFor('newspaper-bundle'),
    unit: '5 kg bundle',
    price: 65,
    mrp: 65,
  },
];

export const products: Product[] = [
  ...vegFruitsProducts,
  ...flowerAndSeafoodProducts,
  ...decorProducts,
  ...otherProducts,
];

export function productsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

export function productsByGroup(group: string): Product[] {
  return products.filter((p) => p.group === group);
}

// Ordered list of Vegetables & Fruits subgroups, for rendering one
// horizontal row per subgroup instead of one 175-item row.
export const vegFruitGroups = [
  { group: 'Vegetables', title: 'Vegetables', subtitle: 'Fresh from the local mandi' },
  { group: 'Greens & Herbs', title: 'Greens & Herbs', subtitle: 'Keerai varieties, cut fresh' },
  { group: 'Bananas', title: 'Banana Varieties', subtitle: 'Regional cultivars' },
  { group: 'Mangoes', title: 'Mango Varieties', subtitle: 'Seasonal picks' },
  { group: 'Fruits', title: 'Fruits', subtitle: 'Everyday & exotic fruits' },
  { group: 'Grapes', title: 'Grape Varieties', subtitle: '' },
  { group: 'Citrus', title: 'Citrus', subtitle: '' },
] as const;

// Ordered list of Flowers subgroups, rendered the same way.
export const flowerGroups = [
  { group: 'Flowers', title: 'Flowers', subtitle: 'Fresh from the flower market' },
  { group: 'Jasmine Varieties', title: 'Jasmine Varieties', subtitle: 'Sold by weight' },
] as const;

// Ordered list of Seafood subgroups.
export const seafoodGroups = [
  { group: 'Seafood', title: 'Fish', subtitle: "Today's catch" },
  { group: 'Prawns & Shrimp', title: 'Prawns & Shrimp', subtitle: '' },
  { group: 'Crab', title: 'Crab', subtitle: '' },
  { group: 'Squid', title: 'Squid', subtitle: '' },
] as const;

// Ordered list of Accessories & Home Decor subgroups.
export const decorGroups = [
  { group: 'Pooja & Diya', title: 'Pooja & Diya', subtitle: '' },
  { group: 'Bamboo, Cane & Jute', title: 'Bamboo, Cane & Jute', subtitle: '' },
  { group: 'Home Textiles', title: 'Home Textiles', subtitle: '' },
] as const;
