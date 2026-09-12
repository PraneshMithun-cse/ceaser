import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Product } from '../data/products';

type WishlistContextValue = {
  items: Product[];
  isWishlisted: (productId: string) => boolean;
  toggle: (product: Product) => void;
  remove: (productId: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  const isWishlisted = (productId: string) => items.some((p) => p.id === productId);

  const toggle = (product: Product) => {
    setItems((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product],
    );
  };

  const remove = (productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <WishlistContext.Provider value={{ items, isWishlisted, toggle, remove }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
