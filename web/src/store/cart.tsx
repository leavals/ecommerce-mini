import { createContext, useContext, useMemo, useState, useEffect } from "react";

type CartItem = {
  productId: number;
  name: string;
  priceCents: number;
  qty: number;
  imageUrl?: string | null;
};

type CartStore = {
  items: CartItem[];
  add: (p: Omit<CartItem, "qty">, qty?: number) => void;
  update: (productId: number, qty: number) => void; // 👈 nuevo
  remove: (productId: number) => void;
  clear: () => void;
  totalCents: number;
};

const Ctx = createContext<CartStore | null>(null);
export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("CartProvider missing");
  return ctx;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const add: CartStore["add"] = (p, qty = 1) => {
    qty = Math.max(1, Math.floor(qty));
    setItems((prev) => {
      const i = prev.findIndex((x) => x.productId === p.productId);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { ...p, qty }];
    });
  };

  const update: CartStore["update"] = (id, qty) => {
    qty = Math.max(1, Math.floor(qty));
    setItems((prev) => prev.map((x) => (x.productId === id ? { ...x, qty } : x)));
  };

  const remove = (id: number) => setItems((prev) => prev.filter((x) => x.productId !== id));
  const clear = () => setItems([]);

  const totalCents = useMemo(
    () => items.reduce((s, it) => s + it.qty * it.priceCents, 0),
    [items]
  );

  return (
    <Ctx.Provider value={{ items, add, update, remove, clear, totalCents }}>
      {children}
    </Ctx.Provider>
  );
}
