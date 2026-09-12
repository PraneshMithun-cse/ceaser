import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { products as localProducts, type Product } from '../data/products';
import { fetchProductsFromApi } from '../lib/api';

type ProductsContextValue = {
  products: Product[];
  source: 'local' | 'remote';
  productsByCategory: (categoryId: string) => Product[];
  productsByGroup: (group: string) => Product[];
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [source, setSource] = useState<'local' | 'remote'>('local');

  useEffect(() => {
    let cancelled = false;
    fetchProductsFromApi().then((remote) => {
      if (cancelled || !remote || remote.length === 0) return;
      setProducts(remote);
      setSource('remote');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<ProductsContextValue>(
    () => ({
      products,
      source,
      productsByCategory: (categoryId) => products.filter((p) => p.categoryId === categoryId),
      productsByGroup: (group) => products.filter((p) => p.group === group),
    }),
    [products, source],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider');
  return ctx;
}
