import { useEffect, useMemo, useState } from "react";
import { useCart } from "../store/cart";
import { api } from "../lib/api";
import PaypalButton from "../components/PaypalButton";
import { Link, useNavigate } from "react-router-dom";
import { formatMoney } from "../lib/money";
import { useToast } from "../components/Toast";

export default function Checkout() {
  const { items, totalCents, clear } = useCart();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Desglose con IVA 19% incluido en precios
  const subTotal = useMemo(() => totalCents, [totalCents]);
  const shipping = 0;
  const ivaCents = Math.round(subTotal - subTotal / 1.19);
  const netoCents = subTotal - ivaCents;
  const grandTotal = subTotal + shipping; // taxes incluidos en subtotal

  // Crear orden al entrar si hay items
  useEffect(() => {
    async function create() {
      const payload = items.map((it) => ({ productId: it.productId, quantity: it.qty }));
      const r: any = await api.createOrder(payload);
      setOrderId(r.data.id);
    }
    if (items.length) create();
  }, [items]);

  if (!items.length) {
    return (
      <div className="card p-6 text-center">
        <p className="mb-3 text-gray-700">Your cart is empty.</p>
        <Link to="/" className="btn btn-primary">Go shopping</Link>
      </div>
    );
  }

  if (!orderId) return <div className="card p-6">Creating order…</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Resumen (más amplio) */}
      <section className="lg:col-span-7">
        <div className="card p-5">
          <h1 className="mb-4 text-2xl font-bold">Order summary</h1>

          <ul className="divide-y">
            {items.map((it) => (
              <li key={it.productId} className="flex items-center gap-4 py-4">
                {it.imageUrl ? (
                  <img src={it.imageUrl} className="h-16 w-16 flex-shrink-0 rounded object-cover ring-1 ring-gray-200" />
                ) : (
                  <div className="h-16 w-16 flex-shrink-0 rounded bg-gray-100" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate font-medium">{it.name}</div>
                    <div className="whitespace-nowrap font-semibold">
                      {formatMoney(it.priceCents * it.qty)}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">Qty: {it.qty}</div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t pt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal (sin IVA)</span>
              <span className="font-medium">{formatMoney(netoCents)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">IVA (19%) incluido</span>
              <span className="font-medium">{formatMoney(ivaCents)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">{formatMoney(shipping)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-base font-semibold">Total</span>
              <span className="text-xl font-extrabold">{formatMoney(grandTotal)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pago */}
      <aside className="lg:col-span-5">
        <div className="card p-5">
          <h2 className="mb-3 text-xl font-semibold">Checkout</h2>
          <p className="mb-4 text-gray-600">
            Pay securely with PayPal or credit/debit card.
          </p>

          <div className="rounded-xl border p-4">
            <PaypalButton
              orderId={orderId}
              onSuccess={(capId) => {
                setStatus(`Payment captured: ${capId}`);
                toast("✅ Payment successful", "success");
                clear();
                navigate(`/orders/${orderId}/thank-you`);
              }}
              onError={(msg) => toast(`❌ ${msg}`, "error")}
            />
          </div>

          {status && (
            <p className="mt-4 rounded-lg bg-green-50 p-3 text-green-700">
              {status}
            </p>
          )}

          <Link to="/" className="btn btn-outline mt-4 w-full">Continue shopping</Link>
        </div>
      </aside>
    </div>
  );
}
