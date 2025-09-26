import { Router } from "express";
import { createOrder, getOrderById, listOrders } from "./service.js";

const r = Router();

r.get("/", async (_req, res, next) => {
  try {
    const orders = await listOrders();
    res.json({ success: true, data: orders });
  } catch (e) { next(e); }
});

r.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const order = await getOrderById(id);
    if (!order) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: order });
  } catch (e) { next(e); }
});

r.post("/", async (req, res, next) => {
  try {
    const order = await createOrder(req.body);
    res.json({ success: true, data: order });
  } catch (e) { next(e); }
});

export default r;
