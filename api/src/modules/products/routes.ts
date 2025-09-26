import { Router } from "express";
import { listProducts } from "./service.js";

const r = Router();
r.get("/", async (_req, res, next) => {
  try {
    const data = await listProducts();
    res.json({ success: true, data });
  } catch (e) { next(e); }
});
export default r;
