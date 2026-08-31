/** Merchant media contexts are intentionally limited so storage paths remain predictable and UI-safe. */
export function sanitizeMediaContext(value: unknown) {
  const normalized = typeof value === "string" ? value.toLowerCase().replace(/[^a-z0-9-]/g, "") : "";
  return ["product", "shop-logo", "shop-banner"].includes(normalized) ? normalized : "product";
}
