import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { api } from "./lib/api";
import { CartProvider, useCart } from "./store/cart";
// import CartButton from "./components/CartButton";
import MiniCart from "./components/MiniCart";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import { ToastProvider } from "./components/Toast";
import ProductPage from "./pages/Product";
import ThankYou from "./pages/ThankYou";
import { formatMoney } from "./lib/money";
import { useToast } from "./components/Toast"; 

type Product = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  priceCents: number;
};

function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {/* banda superior de color */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500" />
      <div className="container-pro flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-brand-700">Pet Shop</Link>
          <nav className="hidden sm:flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-600 hover:text-brand-700">Home</Link>
            <Link to="/orders" className="text-sm text-gray-600 hover:text-brand-700">Orders</Link>
          </nav>
        </div>
        {/* Reemplazamos el botón por el MiniCart */}
        <MiniCart />
      </div>
    </header>
  );
}

function ProductCard({ p, onAdd }: { p: Product; onAdd: (qty: number) => void }) {
  const [qty, setQty] = useState(1);
  const { toast } = useToast(); // 👈 usar el hook

  const clampMin = (v: number) => Math.max(1, Math.floor(v || 1));
  const handleChange = (v: string) => setQty(clampMin(Number(v)));

  const handleAdd = (e?: React.MouseEvent) => {
    e?.stopPropagation();        // no navegar al PDP
    onAdd(qty);
    setQty(1);
    toast(`🛒 ${p.name} agregado (${qty})`, "success"); // 👈 toast
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      handleAdd();
    }
  };

  return (
    <article className="card overflow-hidden hover:border-brand-200 relative">
      {/* Link cubre toda la card */}
      <Link to={`/product/${p.id}`} className="block h-full">
        {p.imageUrl && (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="h-44 w-full object-cover"
          />
        )}
        <div className="p-4">
          <h3 className="font-semibold">{p.name}</h3>
          {p.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {p.description}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold">{formatMoney(p.priceCents)}</span>
          </div>
        </div>
      </Link>

      {/* Controles fuera del Link */}
      <div className="absolute bottom-4 right-4">
        <div className="flex items-center gap-2 bg-white/80 rounded-lg p-1 shadow">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-14 rounded-lg border px-2 py-1 text-sm"
            aria-label="Quantity"
          />
          <button
            className="btn btn-primary rounded-xl"
            onClick={handleAdd}
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}


function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { add } = useCart();

  useEffect(() => {
    api.listProducts()
      .then((r: any) => setProducts(r.data))
      .catch((e: any) => setErr(e?.message ?? "Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container-pro grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-64 animate-pulse bg-gray-100" />
        ))}
      </div>
    );
  }
  if (err) return <div className="container-pro p-6 text-red-600">{err}</div>;

  return (
    <div className="container-pro py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Catalog</h2>
        <span className="badge badge-brand">{products.length} products</span>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            p={p}
            onAdd={(qty) =>
              add({ productId: p.id, name: p.name, priceCents: p.priceCents, imageUrl: p.imageUrl }, qty)
            }
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <ToastProvider>
        <BrowserRouter>
          <Header />
          <main className="pb-16">
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/product/:id" element={<div className="container-pro py-6"><ProductPage /></div>} />
              <Route path="/cart" element={<div className="container-pro py-6"><Cart /></div>} />
              <Route path="/checkout" element={<div className="container-pro py-6"><Checkout /></div>} />
              <Route path="/orders" element={<div className="container-pro py-6"><Orders /></div>} />
              <Route path="/orders/:id" element={<div className="container-pro py-6"><OrderDetail /></div>} />
              <Route path="/orders/:id/thank-you" element={<div className="container-pro py-6"><ThankYou /></div>} />
            </Routes>
          </main>
        </BrowserRouter>
      </ToastProvider>
    </CartProvider>
  );
}
