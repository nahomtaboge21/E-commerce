import { jsPDF } from 'jspdf';

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

function addLine(doc, label, value, y, options = {}) {
  const { labelX = 20, valueX = 70, size = 11, color = 50 } = options;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size);
  doc.setTextColor(30, 41, 59);
  doc.text(label, labelX, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(color, color, color);
  doc.text(String(value), valueX, y);
}

export function downloadReceipt(order) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = Math.max(order.total - subtotal, 0);
  const tax = Math.max(order.total - subtotal - shipping, 0);
  const customer = order.customerName || order.userName || 'Guest';

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(12, 12, 186, 34, 8, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('ShopVine Receipt', 20, 27);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(226, 232, 240);
  doc.text('Premium order summary and delivery confirmation', 20, 35);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(order.id, 160, 27, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(order.createdAt).toLocaleString(), 160, 35, { align: 'right' });

  let y = 58;
  addLine(doc, 'Customer', customer, y);
  y += 7;
  addLine(doc, 'Email', order.customerEmail || '-', y);
  y += 7;
  addLine(doc, 'Status', order.status, y);
  y += 7;
  addLine(doc, 'Payment', order.paymentMethod || 'card', y);

  y += 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.text('Items', 20, y);
  y += 8;

  order.items.forEach(item => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, y - 5, 170, 14, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(item.name, 24, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Qty ${item.quantity} x $${item.price.toFixed(2)}`, 24, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 184, y + 4, { align: 'right' });
    y += 18;
  });

  y += 4;
  doc.line(120, y, 190, y);
  y += 8;
  addLine(doc, 'Subtotal', `$${subtotal.toFixed(2)}`, y, { labelX: 130, valueX: 184, size: 10 });
  y += 7;
  addLine(doc, 'Shipping', shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`, y, { labelX: 130, valueX: 184, size: 10 });
  y += 7;
  addLine(doc, 'Tax', `$${tax.toFixed(2)}`, y, { labelX: 130, valueX: 184, size: 10 });
  y += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Total', 130, y);
  doc.text(`$${order.total.toFixed(2)}`, 184, y, { align: 'right' });

  y += 16;
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(20, y, 170, 28, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(3, 105, 161);
  doc.text('Delivery Information', 25, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const address = [
    order.shippingAddress?.street || '',
    `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zip || ''}`.trim(),
    order.shippingAddress?.country || ''
  ].filter(Boolean).join(' | ');
  doc.text(address || 'No delivery address provided', 25, y + 16, { maxWidth: 155 });
  doc.text(`Estimated delivery: ${order.status === 'processing' ? '2-4 business days' : order.status === 'shipped' ? '1-2 business days' : order.status === 'delivered' ? 'Delivered' : 'Awaiting courier update'}`, 25, y + 23, { maxWidth: 155 });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Thank you for shopping with ShopVine.', 20, 285);

  doc.save(`${order.id}-receipt.pdf`);
}
