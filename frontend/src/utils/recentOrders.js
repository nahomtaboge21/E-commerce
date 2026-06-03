const STORAGE_KEY = 'shopvine_recent_orders';

export function getRecentOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveRecentOrder(order) {
  const next = [order, ...getRecentOrders().filter(item => item.id !== order.id)].slice(0, 8);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function findRecentOrder(id) {
  return getRecentOrders().find(order => order.id === id) || null;
}

export function downloadReceipt(order) {
  const lines = [
    'ShopVine Receipt',
    `Order: ${order.id}`,
    `Date: ${new Date(order.createdAt).toLocaleString()}`,
    `Customer: ${order.customerName || order.userName || 'Guest'}`,
    `Email: ${order.customerEmail || '-'}`,
    '',
    'Items:'
  ];

  order.items.forEach(item => {
    lines.push(`- ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`);
  });

  lines.push('', `Total: $${order.total.toFixed(2)}`);

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${order.id}-receipt.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
