import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatYen } from '../../utils/currency';
import './ProductCard.css';

const Stars = ({ rating }) => (
  <div className="stars" aria-label={`${rating} stars`}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg
        key={i}
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
        stroke="#f59e0b"
        strokeWidth="2"
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ))}
  </div>
);

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-image-wrap">
        <img
          src={Array.isArray(product.images) ? (product.images[0] || product.image) : product.image}
          alt={product.name}
          loading="lazy"
        />
        <div className="product-card-badges">
          {discount > 0 && <span className="product-discount">−{discount}%</span>}
          <span className="product-badge-guarantee">送料無料</span>
        </div>
        {product.stock < 5 && product.stock > 0 && <span className="product-low-stock">残りわずか</span>}
        {product.stock === 0 && <span className="product-out-stock">在庫切れ</span>}
      </Link>
      <div className="product-card-body">
        <div className="product-card-meta">
          <span className="product-category">{product.category}</span>
          <span className="product-policy-pill">60日間返金保証</span>
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        {product.englishName && (
          <p className="product-english-name">{product.englishName}</p>
        )}
        {product.reviews > 0 && <div className="product-rating"><Stars rating={product.rating} /><span className="rating-score">{product.rating.toFixed(1)}</span><span className="rating-count">({product.reviews.toLocaleString()})</span></div>}
        <div className="product-pricing">
          <span className="product-price">{formatYen(product.price)}</span>
          {discount > 0 && (
            <span className="product-original">{formatYen(product.originalPrice)}</span>
          )}
          <span className="tax-inclusive">（税込）</span>
        </div>
        <button
          className="btn btn-primary btn-sm add-to-cart-btn"
          onClick={() => addItem(product)}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? '完売' : 'カートに追加'}
        </button>
      </div>
    </article>
  );
}
