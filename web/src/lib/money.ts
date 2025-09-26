// Formateo de dinero con default CLP.
// Puedes forzar con VITE_CURRENCY y VITE_LOCALE en el .env del web.
const DEFAULT_CURRENCY =
  (import.meta.env.VITE_CURRENCY as string | undefined)?.toUpperCase() || "CLP";
const DEFAULT_LOCALE =
  (import.meta.env.VITE_LOCALE as string | undefined) || "es-CL";

export function formatMoney(cents: number, currency?: string) {
  const cur = (currency || DEFAULT_CURRENCY).toUpperCase();
  const locale = DEFAULT_LOCALE;

  // Para CLP mostramos sin decimales; la base siguen siendo "cents"
  const amount = cents / 100;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: cur === "CLP" ? 0 : 2,
    }).format(cur === "CLP" ? Math.round(amount) : amount);
  } catch {
    // Fallback ultra simple
    const frac = cur === "CLP" ? 0 : 2;
    return `${cur} ${amount.toFixed(frac)}`;
  }
}
