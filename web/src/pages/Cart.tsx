import { Link } from "react-router-dom";
import { useCart } from "../store/cart";
import { formatMoney } from "../lib/money";
import { useToast } from "../components/Toast";

export default function Cart() {
  const { items, update, remove, totalCents } = useCart();
  const { toast } = useToast();

  const clampQty = (v: number) => Math.max(1, Math.floor(v || 1));
  const disabledCx = (disabled: boolean) =>
    disabled ? "opacity-50 cursor-not-allowed" : "";

  if (items.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="mb-3 text-gray-700">Your cart is empty.</p>
        <Link to="/" className="btn btn-primary">Go shopping</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card p-0 lg:col-span-2">
        <ul className="divide-y">
          {items.map((it) => (
            <li
              key={it.productId}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                {it.imageUrl && (
                  <img
                    src={it.imageUrl}
                    className="h-16 w-16 rounded object-cover"
                    alt={it.name}
                  />
                )}
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-gray-500">
                    Unit: {formatMoney(it.priceCents)}
                  </div>
                </div>
              </div>

              <div className="flex w-full items-center justify-between gap-4 sm:w-auto">
                {/* Controles de cantidad */}
                <div className="flex items-center gap-2">
                  {/* – */}
                  <button
                    className={`rounded-lg border px-2 py-1 text-sm ${disabledCx(
                      it.qty <= 1
                    )}`}
                    disabled={it.qty <= 1}
                    aria-disabled={it.qty <= 1}
                    aria-label={`Decrease ${it.name} quantity`}
                    onClick={() => {
                      if (it.qty <= 1) return;
                      const next = it.qty - 1;
                      update(it.productId, next);
                      toast(`Updated ${it.name} qty`, "info");
                    }}
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min={1}
                    value={it.qty}
                    onChange={(e) => {
                      const next = clampQty(Number(e.target.value));
                      update(it.productId, next);
                      toast(`Updated ${it.name} qty`, "info");
                    }}
                    className="w-16 rounded-lg border px-2 py-1 text-center text-sm"
                    aria-label={`Quantity for ${it.name}`}
                  />

                  {/* + */}
                  <button
                    className="rounded-lg border px-2 py-1 text-sm"
                    aria-label={`Increase ${it.name} quantity`}
                    onClick={() => {
                      const next = it.qty + 1;
                      update(it.productId, next);
                      toast(`Updated ${it.name} qty`, "info");
                    }}
                  >
                    +
                  </button>
                </div>

                {/* total línea */}
                <div className="whitespace-nowrap font-semibold">
                  {formatMoney(it.priceCents * it.qty)}
                </div>

                {/* Remove con cantidad eliminada */}
                <button
                  onClick={() => {
                    const removedQty = it.qty; // capturamos cuántas unidades tenía
                    remove(it.productId);
                    toast(`Removed ${it.name} (${removedQty})`, "error");
                  }}
                  className="btn-danger"
                  aria-label={`Remove ${it.name} from cart`}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="card h-fit p-5">
        <div className="flex items-center justify-between">
          <div className="text-lg">Total</div>
          <div className="text-2xl font-extrabold">{formatMoney(totalCents)}</div>
        </div>
        <Link to="/checkout" className="btn btn-primary mt-4 w-full">
          Go to checkout
        </Link>
        <Link to="/" className="btn btn-outline mt-2 w-full">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
