import 'dotenv/config';
import { z } from "zod";

const Env = z.object({
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(8),
  DATABASE_URL: z.string(),
  PAYPAL_CLIENT_ID: z.string(),
  PAYPAL_CLIENT_SECRET: z.string(),
  PAYPAL_MODE: z.enum(["sandbox", "live"]).default("sandbox"),
  BASE_URL: z.string().url().default("http://localhost:4000"),
});

export const env = Env.parse(process.env);
