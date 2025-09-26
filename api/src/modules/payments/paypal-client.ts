import paypal from "@paypal/checkout-server-sdk";
import { env } from "../../env.js";

const Environment = env.PAYPAL_MODE === "live"
  ? paypal.core.LiveEnvironment
  : paypal.core.SandboxEnvironment;

const paypalClient = new paypal.core.PayPalHttpClient(new Environment(env.PAYPAL_CLIENT_ID, env.PAYPAL_CLIENT_SECRET));
export default paypalClient;
