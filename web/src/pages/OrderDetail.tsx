import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .getOrder(Number(id))
      .then((r: any) => setOrder(r.data))
      .catch((e: any) => setErr(e?.message ?? "Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="card p-6">Loading…</div>;
  if (err)
    return <div className="card p-6 text-red-600">{err}</div>;
  if (!order) return <div className="card p-6">Not found</div>;

  const badgeClass =
    order.status === "PAID"
      ? "badge-paid"
      : order.status === "FAILED"
      ? "bg-red-100 text-red-700"
      : "badge-pending";

  // Chile: IVA 19% incluido en el total
  const ivaCents = Math.round(order.totalCents - order.totalCents / 1.19);
  const netoCents = order.totalCents - ivaCents;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        <div className="flex items-center gap-2">
          {order.status === "PAID" && (
            <Link to={`/orders/${order.id}/thank-you`} className="btn btn-primary">
              Receipt
            </Link>
          )}
          <Link to="/orders" className="btn btn-outline">Back</Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <div className="text-xs text-gray-500">Status</div>
          <div className="mt-1">
            <span className={`badge ${badgeClass}`}>{order.status}</span>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Created</div>
          <div className="mt-1 font-semibold">
            {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Total</div>
          <div className="mt-1 text-lg font-extrabold">{formatMoney(order.totalCents)}</div>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Subtotal (sin IVA)</span>
              <span className="font-medium">{formatMoney(netoCents)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>IVA (19%) incluido</span>
              <span className="font-medium">{formatMoney(ivaCents)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-0">
        <h2 className="px-5 pt-4 text-lg font-semibold">Items</h2>
        <ul className="divide-y">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{it.product.name}</div>
                <div className="text-sm text-gray-500">Qty: {it.quantity}</div>
              </div>
              <div className="font-semibold">
                {formatMoney(it.unitCents * it.quantity)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {order.paypalId && (
        <div className="card p-4 text-sm text-gray-600">
          <div className="text-xs text-gray-500 mb-1">PayPal ID</div>
          <div className="font-mono">{order.paypalId}</div>
        </div>
      )}
    </div>
  );
}
