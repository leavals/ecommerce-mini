import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { api } from "../lib/api";

export default function PaypalButton({
  orderId,
  onSuccess,
  onError,
}: {
  orderId: number;
  onSuccess: (captureId: string) => void;
  onError?: (message?: string) => void;
}) {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string;
  const currency = (import.meta.env.VITE_PAYPAL_CURRENCY as string) || "USD";

  return (
    <PayPalScriptProvider options={{ clientId, currency }}>
      <PayPalButtons
        style={{ layout: "vertical", height: 45 }}
        createOrder={async () => {
          try {
            const r: any = await api.createPaypal(orderId);
            return r.data.paypalOrderId;
          } catch (e: any) {
            onError?.(e?.message ?? "Failed to create PayPal order");
            throw e;
          }
        }}
        onApprove={async (_data, actions) => {
          try {
            const details: any = await actions?.order?.get?.();
            const paypalOrderId = details?.id as string;
            const r: any = await api.capturePaypal(orderId, paypalOrderId);
            onSuccess(r.data.captureId);
            return undefined;
          } catch (e: any) {
            onError?.(e?.message ?? "Failed to capture payment");
            throw e;
          }
        }}
        onError={(err) => {
          onError?.(typeof err === "string" ? err : "PayPal error");
        }}
      />
    </PayPalScriptProvider>
  );
}
