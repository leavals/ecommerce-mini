import { Link } from "react-router-dom";
import { useCart } from "../store/cart";
import { formatMoney } from "../lib/money";

export default function CartButton() {
  const { items, totalCents } = useCart();
  const count = items.reduce((s, it) => s + it.qty, 0);

  return (
    <Link
      to="/cart"
      className="btn btn-outline gap-2 rounded-full px-3 py-1 text-sm"
      title="Cart"
    >
      <span role="img" aria-label="cart">🛒</span>
      <span className="badge">{count}</span>
      <span className="font-semibold">{formatMoney(totalCents)}</span>
    </Link>
  );
}

