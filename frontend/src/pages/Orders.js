import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { downloadReceipt, getRecentOrders } from '../utils/recentOrders';

const STATUS_STYLES = { processing: 'badge-info', confirmed: 'badge-info', shipped: 'badge-warning', delivered: 'badge-success', cancelled: 'badge-danger' };

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
    ordersAPI.getAll().then(r => setOrders(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="page" style={{padding:'40px 0 80px'}}>
      <div className="container" style={{maxWidth:860}}>
        <h1 style={{fontFamily:'var(--font-display)',fontSize:32,fontWeight:800,marginBottom:8}}>{user ? 'Orders' : 'Recent Orders'}</h1>
        <p style={{color:'var(--text-secondary)',marginBottom:32}}>{orders.length} orders</p>

        {loading ? <div style={{display:'flex',justifyContent:'center',padding:'60px'}}><div className="spinner"/></div>
        : orders.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px 20px'}}>
            <p style={{fontSize:16,color:'var(--text-muted)',marginBottom:20}}>No recent orders yet</p>
            <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {orders.map(order => (
              <div key={order.id} className="card" style={{padding:24}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,flexWrap:'wrap',gap:12}}>
                  <div>
                    <p style={{fontWeight:700,fontSize:16}}>{order.id}</p>
                    <p style={{fontSize:13,color:'var(--text-muted)',marginTop:3}}>{new Date(order.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>
                  </div>
                  <div style={{display:'flex',gap:12,alignItems:'center'}}>
                    <span className={`badge ${STATUS_STYLES[order.status] || 'badge-muted'}`}>{order.status}</span>
                    <span style={{fontWeight:800,fontSize:18,fontFamily:'var(--font-display)'}}>${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:10,flexWrap:'wrap',paddingTop:14,borderTop:'1px solid var(--border)'}}>
                  {order.items.map(item => (
                    <div key={item.productId} style={{display:'flex',gap:10,alignItems:'center'}}>
                      <img src={Array.isArray(item.image) ? (item.image[0] || '') : item.image} alt={item.name} style={{width:48,height:48,objectFit:'cover',borderRadius:8,border:'1px solid var(--border)'}}/>
                      <div><p style={{fontSize:13,fontWeight:500}}>{item.name}</p><p style={{fontSize:12,color:'var(--text-muted)'}}>×{item.quantity} · ${item.price.toFixed(2)} each</p></div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => downloadReceipt(order)}>Download Receipt</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
