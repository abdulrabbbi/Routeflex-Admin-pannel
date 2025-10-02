export const currency = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
    : "—";
