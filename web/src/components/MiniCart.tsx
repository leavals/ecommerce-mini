import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useCart } from "../store/cart";
import { formatMoney } from "../lib/money";

export default function MiniCart() {
  const { items, totalCents } = useCart();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const count = items.reduce((s, it) => s + it.qty, 0);

  // Cerrar al hacer click fuera o presionar ESC
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const panel = document.getElementById("mini-cart-panel");
      if (panel && !panel.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Posición del panel anclada al botón
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 80, right: 16 });
  useEffect(() => {
    if (!open) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      const top = Math.round(rect.bottom + 8);
      const right = Math.round(window.innerWidth - rect.right);
      setPos({ top, right });
    }
  }, [open]);

  return (
    <>
      {/* Botón */}
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="btn btn-outline gap-2 rounded-full px-3 py-1 text-sm"
        title="Cart"
        aria-expanded={open}
        aria-controls="mini-cart-panel"
      >
        <span role="img" aria-label="cart">🛒</span>
        <span className="badge badge-brand">{count}</span>
        <span className="font-semibold">{formatMoney(totalCents)}</span>
      </button>

      {/* Panel en portal para ganarle a iframes (PayPal) */}
      {open &&
        createPortal(
          <div
            id="mini-cart-panel"
            className="fixed z-[100000] w-80 rounded-2xl border border-gray-200 bg-white p-3 shadow-soft"
            style={{ top: pos.top, right: pos.right }}
            role="dialog"
            aria-label="Mini cart"
          >
            <h3 className="px-2 pb-2 text-sm font-semibold text-gray-700">Your cart</h3>

            <div className="max-h-72 overflow-auto">
              {items.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">Your cart is empty.</div>
              )}
              <ul className="divide-y">
                {items.map((it) => (
                  <li key={it.productId} className="flex items-center gap-3 py-3">
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        className="h-12 w-12 rounded object-cover ring-1 ring-gray-200"
                        alt={it.name}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-gray-100" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{it.name}</div>
                      <div className="text-xs text-gray-500">Qty: {it.qty}</div>
                    </div>
                    <div className="whitespace-nowrap text-sm font-semibold">
                      {formatMoney(it.priceCents * it.qty)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-bold">{formatMoney(totalCents)}</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  className="btn btn-outline w-full"
                  onClick={() => {
                    setOpen(false);
                    navigate("/");
                  }}
                >
                  Continue shopping
                </button>
                <Link
                  to="/checkout"
                  className="btn btn-primary w-full text-center"
                  onClick={() => setOpen(false)}
                >
                  Checkout
                </Link>
              </div>
              <div className="mt-4">
                <Link
                  to="/cart"
                  className="btn btn-outline w-full"
                  onClick={() => setOpen(false)}
                >
                  View full cart
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
