// prisma/seed.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      { name: "Dog Kibble 2kg", description: "Chicken & rice", priceCents: 129900, stock: 50, imageUrl: "https://picsum.photos/seed/dog/400/300" },
      { name: "Cat Litter 10L", description: "Clumping",        priceCents:  89900, stock: 80, imageUrl: "https://picsum.photos/seed/cat/400/300" },
      { name: "Chew Toy",       description: "Durable rubber",   priceCents:  19900, stock: 150, imageUrl: "https://picsum.photos/seed/toy/400/300" }
    ]
  });
  console.log("Seed completed ✅");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
