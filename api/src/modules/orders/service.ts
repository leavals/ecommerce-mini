import { prisma } from "../../prisma.js";
import { z } from "zod";

export const CreateOrderSchema = z.object({
  items: z.array(z.object({ productId: z.number().int(), quantity: z.number().int().positive() }))
});

export async function createOrder(input: unknown) {
  const { items } = CreateOrderSchema.parse(input);
  const products = await prisma.product.findMany({ where: { id: { in: items.map(i => i.productId) } } });
  const lineMap = new Map(products.map(p => [p.id, p]));
  let total = 0;
  for (const it of items) {
    const p = lineMap.get(it.productId);
    if (!p || !p.active || p.stock < it.quantity) throw new Error("Invalid stock");
    total += p.priceCents * it.quantity;
  }
  const order = await prisma.order.create({ data: { totalCents: total, items: { create: items.map(it => ({ productId: it.productId, quantity: it.quantity, unitCents: lineMap.get(it.productId)!.priceCents })) } } });
  return order;
}

export async function listOrders() {
  return prisma.order.findMany({
    orderBy: { id: "desc" },
    include: {
      items: { include: { product: true } },
      user: { select: { id: true, email: true, name: true } },
    },
  });
}

export async function getOrderById(orderId: number) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      user: { select: { id: true, email: true, name: true } },
    },
  });
}