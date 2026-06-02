import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/common/ProductCard';
import './ProductDetail.css';

const Stars = ({ rating, count }) => (
  <div className="stars-row">
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
    </div>
    <span>{rating} ({count?.toLocaleString()} reviews)</span>
  </div>
);

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    productsAPI.getById(id)
      .then(res => { setProduct(res.data); setRelated(res.data.related || []); setQty(1); })
      .catch(console.error)
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', padding:'100px'}}><div className="spinner" /></div>;
  if (!product) return <div className="container" style={{padding:'80px 0', textAlign:'center'}}><p>Product not found</p><Link to="/shop" className="btn btn-primary" style={{marginTop:16}}>Back to Shop</Link></div>;

  const discount = product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div className="product-detail page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> / <span>{product.name}</span>
        </nav>

        <div className="detail-grid">
          <div className="detail-image-wrap">
            <img src={Array.isArray(product.images) ? (product.images[0] || product.image) : product.image} alt={product.name} />
            {discount > 0 && <span className="detail-discount-badge">−{discount}% OFF</span>}
          </div>

          <div className="detail-info">
            <span className="detail-category">{product.category}</span>
            <h1 className="detail-name">{product.name}</h1>
            <Stars rating={product.rating} count={product.reviews} />

            <div className="detail-pricing">
              <span className="detail-price">${product.price.toFixed(2)}</span>
              {discount > 0 && <>
                <span className="detail-original">${product.originalPrice.toFixed(2)}</span>
                <span className="badge badge-danger">Save ${(product.originalPrice - product.price).toFixed(2)}</span>
              </>}
            </div>

            <p className="detail-description">{product.description}</p>

            <div className="detail-stock">
              {product.stock > 10 ? <span className="badge badge-success">✓ In Stock</span>
              : product.stock > 0 ? <span className="badge badge-warning">Only {product.stock} left!</span>
              : <span className="badge badge-danger">Out of Stock</span>}
            </div>

            {product.stock > 0 && (
              <div className="detail-add">
                <div className="qty-control">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                </div>
                <button className={`btn btn-accent btn-lg add-btn ${added ? 'added' : ''}`} onClick={handleAddToCart}>
                  {added ? '✓ Added to Cart!' : 'Add to Cart'}
                </button>
              </div>
            )}

            <div className="detail-tags">
              {product.tags?.map(tag => <span key={tag} className="badge badge-muted">#{tag}</span>)}
            </div>

            <div className="detail-features">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7h12" />
                      <path d="M5 7v10" />
                      <path d="M21 7h-4l-3 5h-8" />
                      <circle cx="7.5" cy="18.5" r="2.5" />
                      <circle cx="18" cy="18.5" r="2.5" />
                    </svg>
                  ),
                  text: 'Free shipping on orders over $200',
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4v6h6" />
                      <path d="M20 20v-6h-6" />
                      <path d="M20 10a8 8 0 0 0-8-8" />
                      <path d="M4 14a8 8 0 0 0 8 8" />
                    </svg>
                  ),
                  text: '30-day returns',
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l7 4v6c0 5-3.8 9.8-7 11-3.2-1.2-7-6-7-11V6l7-4z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  ),
                  text: 'Secure checkout',
                },
              ].map(feature => (
                <div key={feature.text} className="detail-feature">
                  <span>{feature.icon}</span>
                  <p>{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="related-section">
            <h2 className="section-title">Related Products</h2>
            <div className="related-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
