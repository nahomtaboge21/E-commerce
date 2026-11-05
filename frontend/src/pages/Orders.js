import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { downloadReceipt, getRecentOrders } from '../utils/recentOrders';
import { formatYen } from '../utils/currency';

const STATUS = {
  processing: ['ご注文確認中', 'badge-info'],
  confirmed: ['注文確定', 'badge-info'],
  shipped: ['発送済み', 'badge-warning'],
  delivered: ['配達完了', 'badge-success'],
  cancelled: ['キャンセル', 'badge-danger'],
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setOrders(getRecentOrders());
      setLoading(false);
      return;
    }
    ordersAPI.getAll().then(response => setOrders(response.data)).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="page" style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>ご注文</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>{orders.length} 件のご注文</p>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
          : orders.length === 0 ? <div style={{ textAlign: 'center', padding: '80px 20px' }}><p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 20 }}>ご注文履歴はありません。</p><Link to="/shop" className="btn btn-primary">商品を見る</Link></div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orders.map(order => {
                const [statusLabel, statusStyle] = STATUS[order.status] || STATUS.processing;
                return <article key={order.id} className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div><p style={{ fontWeight: 700, fontSize: 16 }}>注文番号：{order.id}</p><p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{new Date(order.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><span className={'badge ' + statusStyle}>{statusLabel}</span><span style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>{formatYen(order.total)}</span></div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    {order.items.map(item => <div key={item.productId} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <img src={Array.isArray(item.image) ? (item.image[0] || '') : item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                      <div><p style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</p><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>数量 {item.quantity} · {formatYen(item.price)}</p></div>
                    </div>)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}><Link to="/track-order" className="btn btn-ghost btn-sm">配送状況を確認</Link><button type="button" className="btn btn-outline btn-sm" onClick={() => downloadReceipt(order)}>領収書をダウンロード</button></div>
                </article>;
              })}
            </div>}
      </div>
    </div>
  );
}
