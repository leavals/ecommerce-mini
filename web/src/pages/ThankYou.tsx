import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { formatMoney } from "../lib/money";
import { useToast } from "../components/Toast";

type Order = {
  id: number;
  status: string;
  totalCents: number;
  createdAt: string;
  items: {
    id: number;
    quantity: number;
    unitCents: number;
    product: { name: string };
  }[];
};

export default function ThankYou() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    api
      .getOrder(Number(id))
      .then((r: any) => setOrder(r.data))
      .catch((e: any) => setErr(e?.message ?? "Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (order?.status === "PAID") {
      toast("🎉 Thanks for your purchase!", "success");
    }
  }, [order, toast]);

  const printReceipt = () => {
    if (!order) return;
    const win = window.open("", "_blank", "width=700,height=900");
    if (!win) return;

    const iva = Math.round(order.totalCents - order.totalCents / 1.19);
    const neto = order.totalCents - iva;

    const html = `
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt #${order.id}</title>
  <style>
    body { font-family: -apple-system, Segoe UI, Roboto, Arial; padding: 24px; }
    h1 { margin: 0 0 8px; }
    .muted { color: #6b7280; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; }
    .right { text-align: right; }
    .totals td { border: none; }
    .stamp { margin-top: 24px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <h1>Boleta / Receipt #${order.id}</h1>
  <div class="muted">Fecha: ${new Date(order.createdAt).toLocaleString()}</div>
  <table>
    <thead>
      <tr><th>Producto</th><th>Cantidad</th><th class="right">Total</th></tr>
    </thead>
    <tbody>
      ${order.items
        .map(
          (it) => `
        <tr>
          <td>${it.product.name}</td>
          <td>${it.quantity}</td>
          <td class="right">${formatMoney(it.unitCents * it.quantity)}</td>
        </tr>`
        )
        .join("")}
    </tbody>
    <tfoot>
      <tr class="totals"><td colspan="2" class="right">Subtotal (sin IVA)</td><td class="right">${formatMoney(
        neto
      )}</td></tr>
      <tr class="totals"><td colspan="2" class="right">IVA (19%) incluido</td><td class="right">${formatMoney(
        iva
      )}</td></tr>
      <tr class="totals"><td colspan="2" class="right"><strong>Total</strong></td><td class="right"><strong>${formatMoney(
        order.totalCents
      )}</strong></td></tr>
    </tfoot>
  </table>
  <div class="stamp">Demo only · Not a valid tax document.</div>
  <script>window.print();</script>
</body>
</html>`;
    win.document.write(html);
    win.document.close();
  };

  if (loading) return <div className="card p-6">Loading…</div>;
  if (err) return <div className="card p-6 text-red-600">{err}</div>;
  if (!order) return <div className="card p-6">Not found</div>;

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Thank you! 🎉</h1>
        <p className="text-gray-600">
          Your payment was captured and your order has been created.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span className="badge badge-paid">
            #{order.id} · {order.status}
          </span>
          <span className="text-xl font-extrabold">
            {formatMoney(order.totalCents)}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={printReceipt}>
            Download receipt (PDF)
          </button>
          <Link to="/orders" className="btn btn-outline">
            View orders
          </Link>
          <Link to="/" className="btn btn-outline">
            Continue shopping
          </Link>
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
    </div>
  );
}
