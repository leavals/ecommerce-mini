import { Router } from "express";
import paypal from "@paypal/checkout-server-sdk";
import paypalClient from "./paypal-client.js";
import { prisma } from "../../prisma.js";

const r = Router();

r.post("/create", async (req, res, next) => {
  try {
    const { orderId } = req.body as { orderId: number };
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: (order.totalCents / 100).toFixed(2) } }],
    });

    const response = await paypalClient.execute(request);
    res.json({ success: true, data: { paypalOrderId: response.result.id } });
  } catch (e) { next(e); }
});

r.post("/capture", async (req, res, next) => {
  try {
    const { orderId, paypalOrderId } = req.body as { orderId: number; paypalOrderId: string };
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});
    const capture = await paypalClient.execute(request);

    await prisma.order.update({ where: { id: orderId }, data: { status: "PAID", paypalId: capture.result.id } });

    res.json({ success: true, data: { captureId: capture.result.id } });
  } catch (e) { next(e); }
});

export default r;
