import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ordersAPI } from '../api';
import { downloadReceipt, findRecentOrder } from '../utils/recentOrders';
import { formatYen } from '../utils/currency';
import './OrderConfirmation.css';

const STATUS_META = {
  processing:  { label: 'ご注文確認中', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  confirmed:   { label: '注文確定', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  shipped:     { label: '発送済み', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  delivered:   { label: '配達完了', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  cancelled:   { label: 'キャンセル', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
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
      <p style={{ color: 'var(--text-muted)' }}>ご注文が見つかりませんでした。</p>
      <Link to="/orders" className="btn btn-primary" style={{ marginTop: 16 }}>ご注文履歴</Link>
    </div>
  );

  const meta = STATUS_META[order.status] || STATUS_META.processing;
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = order.total - subtotal > 1 ? order.total - subtotal : 0;
  const deliveryWindow = order.status === 'delivered'
    ? '配達が完了しました'
    : order.status === 'shipped'
      ? '1〜2営業日以内にお届け予定です'
      : order.status === 'confirmed'
        ? '発送準備中です'
        : '発送後5〜8日程度でお届け予定です';
  const destination = [order.shippingAddress?.street, `${order.shippingAddress?.state || ''} ${order.shippingAddress?.city || ''} ${order.shippingAddress?.zip || ''}`.trim(), order.shippingAddress?.country === 'JP' ? '日本' : order.shippingAddress?.country].filter(Boolean);

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
          <h1 className="oc-title">ご注文ありがとうございます</h1>
          <p className="oc-sub">ご注文を承りました。発送状況を<strong>{order.customerEmail || order.shippingAddress?.city || 'ご登録の連絡先'}</strong>へお知らせします。</p>
          <div className="oc-id">ご注文番号 <span>{order.id}</span></div>
        </div>

        <div className="oc-body">

          {/* ── Status ── */}
          <div className="oc-card">
            <p className="oc-card-label">配送状況</p>
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
            <p className="oc-card-label">ご注文商品</p>
            <div className="oc-items">
              {order.items.map(item => (
                <div key={item.productId} className="oc-item">
                  <img
                    src={Array.isArray(item.image) ? item.image[0] : item.image}
                    alt={item.name}
                  />
                  <div className="oc-item-info">
                    <p className="oc-item-name">{item.name}</p>
                    <span className="oc-item-qty">数量 {item.quantity}</span>
                  </div>
                  <span className="oc-item-price">{formatYen(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="oc-totals">
              <div className="oc-total-row"><span>小計</span><span>{formatYen(subtotal)}</span></div>
              <div className="oc-total-row"><span>送料</span><span style={{ color: 'var(--primary)', fontWeight: 600 }}>無料（全国）</span></div>
              <div className="oc-total-row oc-grand-total">
                <span>合計（税込）</span>
                <span>{formatYen(order.total)}</span>
              </div>
            </div>
          </div>

          {/* ── Shipping address ── */}
          {order.shippingAddress && (
            <div className="oc-card oc-delivery-card">
              <div className="oc-delivery-head">
                <div>
                  <p className="oc-card-label">お届け先</p>
                  <h3 className="oc-delivery-title">{deliveryWindow}</h3>
                </div>
                <div className="oc-delivery-pill">{shipping === 0 ? '送料無料' : formatYen(shipping) + ' 送料'}</div>
              </div>
              <div className="oc-delivery-grid">
                <div className="oc-delivery-block">
                  <span className="oc-delivery-label">お名前</span>
                  <p className="oc-addr">{order.customerName || order.userName || 'お客様'}</p>
                  <p className="oc-addr oc-muted">{order.customerEmail || ''}</p>
                </div>
                <div className="oc-delivery-block">
                  <span className="oc-delivery-label">お届け先住所</span>
                  {destination.map(line => <p key={line} className="oc-addr">{line}</p>)}
                </div>
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="oc-actions">
            <button type="button" className="btn btn-outline" onClick={() => downloadReceipt(order)}>領収書をダウンロード</button>
            <Link to="/shop" className="btn btn-primary">お買い物を続ける</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
