import { prisma } from "../../prisma.js";

export async function listProducts() {
  return prisma.product.findMany({ where: { active: true }, orderBy: { id: "asc" } });
}
