import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./env.js";
import productsRouter from "./modules/products/routes.js";
import ordersRouter from "./modules/orders/routes.js";
import paymentsRouter from "./modules/payments/routes.js";

const app = express();
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);

export default app;
