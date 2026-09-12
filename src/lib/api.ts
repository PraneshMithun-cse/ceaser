import type { Product } from '../data/products';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
const FETCH_TIMEOUT_MS = 4000;

type ProductApiDto = {
  id: string;
  name: string;
  nameTamil: string | null;
  nameThanglish: string | null;
  description: string;
  categoryId: string;
  group: string;
  imageUri: string;
  unit: string;
  price: number;
  mrp: number;
};

function dtoToProduct(dto: ProductApiDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    nameTamil: dto.nameTamil ?? undefined,
    nameThanglish: dto.nameThanglish ?? undefined,
    description: dto.description,
    categoryId: dto.categoryId,
    group: dto.group,
    imageUri: dto.imageUri,
    unit: dto.unit,
    price: dto.price,
    mrp: dto.mrp,
  };
}

// Fetches the live catalog from the Ktor backend (backend/, Neon Postgres).
// Returns null on any failure (backend not running, network error, timeout)
// so callers can fall back to the bundled mock catalog instead of breaking.
export async function fetchProductsFromApi(): Promise<Product[] | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}/products`, { signal: controller.signal });
    if (!res.ok) return null;
    const data: ProductApiDto[] = await res.json();
    return data.map(dtoToProduct);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
