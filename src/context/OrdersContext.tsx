import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MapVendor } from '../components/map/BuyloMap';

export type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  vendor: MapVendor;
  items: OrderItem[];
  totalCount: number;
  totalPrice: number;
  location: string;
  serviceTime: string;
  userLatitude: number;
  userLongitude: number;
  placedAt: number;
  etaMs: number;
  status: 'ongoing' | 'completed';
};

type CreateOrderInput = Omit<Order, 'id' | 'placedAt' | 'status'>;

type OrdersContextValue = {
  orders: Order[];
  ongoing: Order[];
  history: Order[];
  activeTrackingId: string | null;
  createOrder: (input: CreateOrderInput) => string;
  markCompleted: (id: string) => void;
  openTracking: (id: string) => void;
  closeTracking: () => void;
  getOrder: (id: string | null) => Order | null;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);

  const createOrder = (input: CreateOrderInput) => {
    const id = `order-${Date.now()}`;
    const order: Order = { ...input, id, placedAt: Date.now(), status: 'ongoing' };
    setOrders((prev) => [order, ...prev]);
    return id;
  };

  const markCompleted = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'completed' } : o)));
  };

  const openTracking = (id: string) => setActiveTrackingId(id);
  const closeTracking = () => setActiveTrackingId(null);

  const getOrder = (id: string | null) => (id ? orders.find((o) => o.id === id) ?? null : null);

  const ongoing = orders.filter((o) => o.status === 'ongoing');
  const history = orders.filter((o) => o.status === 'completed');

  return (
    <OrdersContext.Provider
      value={{ orders, ongoing, history, activeTrackingId, createOrder, markCompleted, openTracking, closeTracking, getOrder }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within an OrdersProvider');
  return ctx;
}
