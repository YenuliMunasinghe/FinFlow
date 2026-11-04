export const toCents = (amount: number) => Math.round(amount * 100);

export function formatMoney(amount: number) {
  const value = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}Rs. ${value}`;
}

/** Formats the API's calendar date (YYYY-MM-DD) without shifting it across time zones. */
export function formatEventDate(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  });
}
