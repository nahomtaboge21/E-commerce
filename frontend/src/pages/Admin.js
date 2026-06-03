import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI, ordersAPI, productsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';
import './Admin.css';

const STATUS_COLORS = { processing: 'badge-info', confirmed: 'badge-info', shipped: 'badge-warning', delivered: 'badge-success', cancelled: 'badge-danger' };

const TAB_ICONS = {
  dashboard: 'dashboard',
  products: 'products',
  orders: 'orders',
  users: 'users',
};

function normalizeStatsResponse(payload, users = []) {
  if (!payload) return null;
  if (payload.overview && payload.ordersByStatus && payload.lowStockProducts) return payload;

  return {
    overview: {
      totalProducts: payload.totalProducts || 0,
      totalUsers: users.filter(u => u.role === 'user').length,
      totalOrders: payload.totalOrders || 0,
      totalRevenue: payload.totalRevenue || 0,
      deliveredRevenue: payload.deliveredRevenue || 0,
    },
    ordersByStatus: payload.statusCounts || {},
    productsByCategory: payload.categoryCounts || {},
    lowStockProducts: payload.lowStock || [],
    recentOrders: payload.recentOrders || [],
  };
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({ name: '', category: '', price: '', originalPrice: '', stock: '', description: '', imageUrl: '', images: [], tags: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login?redirect=/admin'); return; }
    if (!isAdmin) { navigate('/login?redirect=/admin'); return; }
    loadAll();
  }, [user, isAdmin, navigate]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, p, o] = await Promise.all([adminAPI.getStats(), adminAPI.getUsers(), productsAPI.getAll({ limit: 100 }), ordersAPI.getAll()]);
      setUsers(u.data || []);
      setStats(normalizeStatsResponse(s.data, u.data || []));
      setProducts(p.data.products || []);
      setOrders(o.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await adminAPI.deleteUser(id); setUsers(u => u.filter(x => x.id !== id)); setMsg('User deleted'); } catch (e) { setMsg('Error: ' + e.response?.data?.error); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await productsAPI.delete(id); setProducts(p => p.filter(x => x.id !== id)); setMsg('Product deleted'); } catch (e) { setMsg('Error: ' + e.response?.data?.error); }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    const existingImages = Array.isArray(product.images)
      ? product.images
      : product.image
        ? [product.image]
        : [];
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      description: product.description,
      imageUrl: existingImages[0] || '',
      images: existingImages,
      tags: product.tags?.join(', ') || ''
    });
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setProductForm({ name: '', category: '', price: '', originalPrice: '', stock: '', description: '', imageUrl: '', images: [], tags: '' });
    setFormOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const data = { ...productForm, price: parseFloat(productForm.price), originalPrice: parseFloat(productForm.originalPrice || productForm.price), stock: parseInt(productForm.stock), tags: productForm.tags.split(',').map(t => t.trim()).filter(Boolean) };
    const images = productForm.images.length
      ? productForm.images
      : productForm.imageUrl.trim()
        ? [productForm.imageUrl.trim()]
        : [];
    data.images = images;
    delete data.imageUrl;
    try {
      if (editingProduct) {
        const res = await productsAPI.update(editingProduct.id, data);
        setProducts(p => p.map(x => x.id === editingProduct.id ? res.data : x));
        setMsg('Product updated');
      } else {
        const res = await productsAPI.create(data);
        setProducts(p => [...p, res.data]);
        setMsg('Product created');
      }
      setFormOpen(false);
    } catch (err) { setMsg('Error: ' + err.response?.data?.error); }
  };

  const handleImageFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const readerPromises = files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    }));
    const newImages = (await Promise.all(readerPromises)).filter(Boolean);
    setProductForm(f => ({ ...f, images: [...f.images, ...newImages] }));
    e.target.value = null;
  };

  const addImageUrl = () => {
    const url = productForm.imageUrl.trim();
    if (!url) return;
    setProductForm(f => ({ ...f, images: [...f.images, url], imageUrl: '' }));
  };

  const removeImage = (index) => {
    setProductForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== index) }));
  };

  const handleStatusChange = async (orderId, status) => {
    try { await ordersAPI.updateStatus(orderId, status); setOrders(o => o.map(x => x.id === orderId ? { ...x, status } : x)); } catch (e) { setMsg('Error updating status'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner" /></div>;

  const TABS = ['dashboard', 'products', 'orders', 'users'];

  return (
    <div className="admin page">
      <div className="admin-sidebar">
          <div className="admin-brand">Admin Panel</div>
          {TABS.map(t => (
            <button key={t} className={`admin-nav-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              <span className={`nav-icon nav-icon-${TAB_ICONS[t]}`} aria-hidden="true" />
              <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
            </button>
          ))}
          <Link to="/" className="admin-nav-btn admin-back-btn" style={{ marginTop: 'auto' }}>Back to Store</Link>
        </div>
      <div className="admin-content">
        <div className="admin-mobile-tabs" role="tablist" aria-label="Admin sections">
          {TABS.map(t => (
            <button
              key={t}
              className={`admin-mobile-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
              type="button"
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        {msg && <div className="admin-msg" onClick={() => setMsg('')}>{msg} <span className="admin-msg-close">×</span></div>}

        {/* DASHBOARD */}
        {tab === 'dashboard' && stats && (
          <div>
            <div className="admin-hero">
              <div>
                <p className="admin-eyebrow">Operations</p>
                <h1 className="admin-title" style={{ marginBottom: 10 }}>Dashboard</h1>
                <p className="admin-subtitle">Monitor revenue, fulfillment, inventory pressure, and customer activity in one place.</p>
              </div>
              <div className="admin-hero-metrics">
                <div className="admin-hero-chip">
                  <span className="admin-hero-chip-label">Live orders</span>
                  <strong>{stats.ordersByStatus.processing || 0}</strong>
                </div>
                <div className="admin-hero-chip">
                  <span className="admin-hero-chip-label">Low stock</span>
                  <strong>{stats.lowStockProducts.length}</strong>
                </div>
              </div>
            </div>
            <div className="stats-grid">
              {[
                { label: 'Total Revenue', value: `$${stats.overview.totalRevenue.toLocaleString()}`, type: 'revenue', sub: `$${stats.overview.deliveredRevenue.toLocaleString()} delivered` },
                { label: 'Total Orders', value: stats.overview.totalOrders, type: 'orders', sub: `${stats.ordersByStatus.processing || 0} processing` },
                { label: 'Products', value: stats.overview.totalProducts, type: 'products', sub: `${stats.lowStockProducts.length} low stock` },
                { label: 'Customers', value: stats.overview.totalUsers, type: 'customers', sub: 'registered users' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <span className={`stat-icon stat-icon-${s.type}`} aria-hidden="true" />
                  <div><p className="stat-value">{s.value}</p><p className="stat-label">{s.label}</p><p className="stat-sub">{s.sub}</p></div>
                </div>
              ))}
            </div>

            <div className="admin-two-col">
              <div className="card admin-panel-card" style={{ padding: 24 }}>
                <h3 className="admin-section-title">Recent Orders</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {stats.recentOrders.map(o => (
                    <div key={o.id} className="admin-order-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                      <div><p style={{ fontWeight: 600, fontSize: 14 }}>{o.id}</p><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</p></div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                        <span style={{ fontWeight: 700 }}>${o.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card admin-panel-card" style={{ padding: 24 }}>
                <h3 className="admin-section-title">Orders by Status</h3>
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="admin-status-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className={`badge ${STATUS_COLORS[status]}`}>{status}</span>
                    <div style={{ flex: 1, margin: '0 12px', height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${(count / stats.overview.totalOrders) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{count}</span>
                  </div>
                ))}

                <h3 className="admin-section-title" style={{ marginTop: 24 }}>Low Stock Alert</h3>
                {stats.lowStockProducts.length === 0 ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>All products well stocked</p> :
                  stats.lowStockProducts.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                      <span className="badge badge-warning">{p.stock} left</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div className="admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 className="admin-title" style={{ margin: 0 }}>Products ({products.length})</h1>
              <button className="btn btn-accent" onClick={openCreate}>+ Add Product</button>
            </div>

            {formOpen && (
              <div className="card admin-editor-card" style={{ padding: 28, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                <form onSubmit={handleSaveProduct}>
                  <div className="form-row-3">
                    <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} required /></div>
                    <div className="form-group"><label className="form-label">Category *</label><input className="form-input" value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} required /></div>
                    <div className="form-group"><label className="form-label">Stock</label><input className="form-input" type="number" value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} /></div>
                  </div>
                  <div className="form-row-3">
                    <div className="form-group"><label className="form-label">Price *</label><input className="form-input" type="number" step="0.01" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} required /></div>
                    <div className="form-group"><label className="form-label">Original Price</label><input className="form-input" type="number" step="0.01" value={productForm.originalPrice} onChange={e => setProductForm(f => ({ ...f, originalPrice: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-input" value={productForm.tags} onChange={e => setProductForm(f => ({ ...f, tags: e.target.value }))} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Product Images</label>
                    <input className="form-input" type="file" accept="image/*" multiple onChange={handleImageFiles} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                      <input className="form-input" value={productForm.imageUrl} onChange={e => setProductForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="Image URL (optional)" style={{ flex: 1 }} />
                      <button type="button" className="btn btn-outline" style={{ flexShrink: 0 }} onClick={addImageUrl}>Add</button>
                    </div>
                  </div>
                  {productForm.images.length > 0 && (
                    <div className="form-group image-preview-row" style={{ gap: 10, marginBottom: 14 }}>
                      {productForm.images.map((src, idx) => (
                        <div key={idx} style={{ position: 'relative', width: 80, height: 80, borderRadius: 14, overflow: 'hidden', background: '#f8fafc', border: '1px solid var(--border)' }}>
                          <img src={src} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'rgba(15,23,42,0.8)', color: '#fff', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows="3" value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn-primary">{editingProduct ? 'Update' : 'Create'}</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setFormOpen(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><img src={Array.isArray(p.images) ? (p.images[0] || p.image) : p.image} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0 }} /><span style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</span></div></td>
                      <td><span className="badge badge-muted">{p.category}</span></td>
                      <td><strong>${p.price.toFixed(2)}</strong></td>
                      <td><span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock < 20 ? 'badge-warning' : 'badge-success'}`}>{p.stock}</span></td>
                      <td><span className="rating-pill">{p.rating}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                          <button className="btn btn-sm" style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }} onClick={() => handleDeleteProduct(p.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <div className="admin-header-row">
              <h1 className="admin-title">Orders ({orders.length})</h1>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Order ID</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><span style={{ fontWeight: 700 }}>{o.id}</span></td>
                      <td><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{o.items.map(i => <img key={i.productId} src={Array.isArray(i.image) ? (i.image[0] || '') : i.image} alt={i.name} title={i.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />)}</div></td>
                      <td><strong>${o.total.toFixed(2)}</strong></td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select className="form-input" style={{ padding: '5px 8px', fontSize: 12, width: 'auto' }} value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}>
                          {['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <div className="admin-header-row">
              <h1 className="admin-title">Users ({users.length})</h1>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Orders</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 36, height: 36, background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{u.avatar}</div><span style={{ fontWeight: 500 }}>{u.name}</span></div></td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-muted'}`}>{u.role}</span></td>
                      <td style={{ fontWeight: 600 }}>{u.orderCount}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>{u.role !== 'admin' && <button className="btn btn-sm" style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }} onClick={() => handleDeleteUser(u.id)}>Delete</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
