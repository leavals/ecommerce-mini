import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useCart } from "../store/cart";
import { formatMoney } from "../lib/money";
import { useToast } from "../components/Toast";

type Product = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  priceCents: number;
};

export default function ProductPage() {
  const { id } = useParams();
  const { add } = useCart();
  const { toast } = useToast();

  const [p, setP] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      try {
        // Busca directo por id; si falla, busca en el listado
        const byId: any = await api.getProduct(Number(id)).catch(() => null);
        if (byId?.data) {
          setP(byId.data);
          return;
        }
        const all: any = await api.listProducts();
        const found = all.data.find((x: Product) => x.id === Number(id));
        if (!found) throw new Error("Product not found");
        setP(found);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="card p-6">Loading…</div>;
  if (err) return <div className="card p-6 text-red-600">{err}</div>;
  if (!p) return <div className="card p-6">Not found</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-6 card overflow-hidden">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name} className="w-full object-cover" />
        ) : (
          <div className="h-64 bg-gray-100" />
        )}
      </div>

      <div className="lg:col-span-6 card p-6">
        <h1 className="text-2xl font-bold">{p.name}</h1>
        {p.description && <p className="mt-2 text-gray-600">{p.description}</p>}
        <div className="mt-4 text-3xl font-extrabold">
          {formatMoney(p.priceCents)}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <label className="text-sm text-gray-600">Quantity</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))
            }
            className="w-24 rounded-lg border px-3 py-2"
          />
        </div>

        <button
          className="btn btn-primary mt-5"
          onClick={() => {
            add(
              {
                productId: p.id,
                name: p.name,
                priceCents: p.priceCents,
                imageUrl: p.imageUrl,
              },
              qty
            );
            setQty(1);
            toast("Added to cart", "success");
          }}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
