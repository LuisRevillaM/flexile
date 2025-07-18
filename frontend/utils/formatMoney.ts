import { Decimal } from "decimal.js";

export const formatMoney = (
  price: number | bigint | string | Decimal,
  options?: { precise: boolean },
  currency = "USD",
) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    trailingZeroDisplay: "stripIfInteger",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: options?.precise ? 10 : undefined,
  }).format(price instanceof Decimal ? price.toString() : price);

export const formatMoneyFromCents = (cents: number | bigint | string | Decimal, options?: { precise: boolean }) =>
  formatMoney(Number(cents) / 100, options);

export const formatCompactMoney = (cents: number): string => {
  const amount = Math.abs(cents) / 100;
  const sign = cents < 0 ? '-' : '';
  
  if (amount >= 1_000_000_000) {
    return `${sign}$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${sign}$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 10_000) {
    return `${sign}$${Math.round(amount / 1_000)}K`;
  }
  if (amount >= 1_000) {
    return `${sign}$${(amount / 1_000).toFixed(1)}K`;
  }
  return `${sign}$${amount.toFixed(0)}`;
};
