import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ordersAPI } from '../api';
import { downloadReceipt, findRecentOrder } from '../utils/recentOrders';
import './OrderConfirmation.css';

const STATUS_META = {
  processing:  { label: 'Processing',  color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  confirmed:   { label: 'Confirmed',   color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  shipped:     { label: 'Shipped',     color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  delivered:   { label: 'Delivered',   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  cancelled:   { label: 'Cancelled',   color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

export function OrderConfirmation() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    ordersAPI.getById(id, token)
      .then(r => setOrder(r.data))
      .catch(() => setOrder(findRecentOrder(id)))
      .finally(() => setLoading(false));
  }, [id, searchParams]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!order) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <p style={{ color: 'var(--text-muted)' }}>Order not found.</p>
      <Link to="/orders" className="btn btn-primary" style={{ marginTop: 16 }}>Recent Orders</Link>
    </div>
  );

  const meta = STATUS_META[order.status] || STATUS_META.processing;
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = order.total - subtotal > 1 ? order.total - subtotal : 0;
  const deliveryWindow = order.status === 'delivered'
    ? 'Delivered successfully'
    : order.status === 'shipped'
      ? 'Arriving in 1-2 business days'
      : order.status === 'confirmed'
        ? 'Packed and dispatching in 24 hours'
        : 'Estimated arrival in 2-4 business days';
  const destination = [order.shippingAddress?.street, `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zip || ''}`.trim(), order.shippingAddress?.country].filter(Boolean);

  return (
    <div className="oc-page page">
      <div className="container oc-container">

        {/* ── Success header ── */}
        <div className="oc-header">
          <div className="oc-check">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="oc-title">Order Confirmed!</h1>
          <p className="oc-sub">Thanks for your purchase. We'll send updates to <strong>{order.shippingAddress?.city || 'you'}</strong>.</p>
          <div className="oc-id">Order <span>{order.id}</span></div>
        </div>

        <div className="oc-body">

          {/* ── Status ── */}
          <div className="oc-card">
            <p className="oc-card-label">Status</p>
            <div className="oc-status-row">
              <span
                className="oc-status-badge"
                style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
              >
                {meta.label}
              </span>
              <p className="oc-status-copy">{deliveryWindow}</p>
            </div>
          </div>

          {/* ── Items ── */}
          <div className="oc-card oc-items-card">
            <p className="oc-card-label">Items Ordered</p>
            <div className="oc-items">
              {order.items.map(item => (
                <div key={item.productId} className="oc-item">
                  <img
                    src={Array.isArray(item.image) ? item.image[0] : item.image}
                    alt={item.name}
                  />
                  <div className="oc-item-info">
                    <p className="oc-item-name">{item.name}</p>
                    <span className="oc-item-qty">Qty {item.quantity}</span>
                  </div>
                  <span className="oc-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="oc-totals">
              <div className="oc-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {shipping > 0 && (
                <div className="oc-total-row"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
              )}
              {shipping === 0 && (
                <div className="oc-total-row"><span>Shipping</span><span style={{ color: '#16a34a', fontWeight: 600 }}>Free</span></div>
              )}
              <div className="oc-total-row oc-grand-total">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ── Shipping address ── */}
          {order.shippingAddress && (
            <div className="oc-card oc-delivery-card">
              <div className="oc-delivery-head">
                <div>
                  <p className="oc-card-label">Delivery Details</p>
                  <h3 className="oc-delivery-title">{deliveryWindow}</h3>
                </div>
                <div className="oc-delivery-pill">{shipping === 0 ? 'Free Shipping' : `$${shipping.toFixed(2)} shipping`}</div>
              </div>
              <div className="oc-delivery-grid">
                <div className="oc-delivery-block">
                  <span className="oc-delivery-label">Recipient</span>
                  <p className="oc-addr">{order.customerName || order.userName || 'Guest Customer'}</p>
                  <p className="oc-addr oc-muted">{order.customerEmail || 'Email unavailable'}</p>
                </div>
                <div className="oc-delivery-block">
                  <span className="oc-delivery-label">Destination</span>
                  {destination.map(line => <p key={line} className="oc-addr">{line}</p>)}
                </div>
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="oc-actions">
            <button type="button" className="btn btn-outline" onClick={() => downloadReceipt(order)}>Download Receipt</button>
            <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
