import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const Stars = ({ rating }) => (
  <div className="stars" aria-label={`${rating} stars`}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
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
        <img src={Array.isArray(product.images) ? (product.images[0] || product.image) : product.image} alt={product.name} loading="lazy" />
        {discount > 0 && <span className="product-discount">−{discount}%</span>}
        {product.stock < 5 && product.stock > 0 && <span className="product-low-stock">Only {product.stock} left</span>}
        {product.stock === 0 && <span className="product-out-stock">Out of stock</span>}
      </Link>
      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <Link to={`/product/${product.id}`}><h3 className="product-name">{product.name}</h3></Link>
        <div className="product-rating">
          <Stars rating={product.rating} />
          <span className="rating-count">({product.reviews.toLocaleString()})</span>
        </div>
        <div className="product-pricing">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {discount > 0 && <span className="product-original">${product.originalPrice.toFixed(2)}</span>}
        </div>
        <button
          className="btn btn-primary btn-sm add-to-cart-btn"
          onClick={() => addItem(product)}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
