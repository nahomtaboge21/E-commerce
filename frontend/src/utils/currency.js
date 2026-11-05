export function formatYen(value) {
  return `¥${Math.round(Number(value) || 0).toLocaleString('ja-JP')}`;
}
