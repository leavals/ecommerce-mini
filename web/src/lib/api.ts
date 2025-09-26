const API = import.meta.env.VITE_API_URL || "";

async function http(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  // Products
  listProducts: () => http("/api/products"),
  getProduct: (id: number) => http(`/api/products/${id}`),

  // Orders
  listOrders: () => http("/api/orders"),
  getOrder: (id: number) => http(`/api/orders/${id}`),
  createOrder: (items: { productId: number; quantity: number }[]) =>
    http("/api/orders", { method: "POST", body: JSON.stringify({ items }) }),

  // Payments (usa SIEMPRE POST con body JSON)
  createPaypal: (orderId: number) =>
    http("/api/payments/create", { method: "POST", body: JSON.stringify({ orderId }) }),
  capturePaypal: (orderId: number, paypalOrderId: string) =>
    http("/api/payments/capture", { method: "POST", body: JSON.stringify({ orderId, paypalOrderId }) }),
};
