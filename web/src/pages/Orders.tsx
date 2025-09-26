import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { formatMoney } from "../lib/money";

type Order = {
  id: number;
  status: "PENDING" | "PAID" | "FAILED" | string;
  totalCents: number;
  paypalId?: string | null;
  createdAt: string;
  items: {
    id: number;
    quantity: number;
    unitCents: number;
    product: { name: string };
  }[];
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .listOrders()
      .then((r: any) => setOrders(r.data))
      .catch((e: any) => setErr(e?.message ?? "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card p-6">Loading…</div>;

  if (err) {
    return (
      <div className="card p-6">
        <p className="mb-3 text-red-600">{err}</p>
        <Link to="/" className="btn btn-primary">Go shopping</Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="mb-3 text-gray-700">No orders yet.</p>
        <Link to="/" className="btn btn-primary">Go shopping</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const itemsCount = o.items.reduce((s, it) => s + it.quantity, 0);
        const preview = o.items.slice(0, 3).map((it) => it.product.name).join(", ");
        const extra = o.items.length > 3 ? "…" : "";
        const badge =
          o.status === "PAID" ? "badge-paid" :
          o.status === "FAILED" ? "bg-red-100 text-red-700" :
          "badge-pending";

        return (
          <div key={o.id} className="card p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Order</div>
                <div className="text-lg font-semibold">#{o.id}</div>
                <div className="text-xs text-gray-500">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`badge ${badge}`}>{o.status}</span>
                <div className="text-xl font-extrabold">
                  {formatMoney(o.totalCents)}
                </div>

                {/* Si está pagada, ofrece “Thank you / Receipt”; si no, ver detalle */}
                {o.status === "PAID" ? (
                  <div className="flex gap-2">
                    <Link to={`/orders/${o.id}/thank-you`} className="btn btn-primary">
                      Receipt
                    </Link>
                    <Link to={`/orders/${o.id}`} className="btn btn-outline">
                      View
                    </Link>
                  </div>
                ) : (
                  <Link to={`/orders/${o.id}`} className="btn btn-outline">
                    View
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              {itemsCount} item{o.items.length !== 1 ? "s" : ""} • {preview}{extra}
            </div>
          </div>
        );
      })}
    </div>
  );
}
