export function formatCurrency(value, currencyCode = 'JPY') {
  const normalizedCurrency = /^[A-Z]{3}$/.test(currencyCode) ? currencyCode : 'JPY';
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: normalizedCurrency,
    maximumFractionDigits: normalizedCurrency === 'JPY' ? 0 : 2,
  }).format(amount);
}

export function formatYen(value) {
  return formatCurrency(value, 'JPY');
}
