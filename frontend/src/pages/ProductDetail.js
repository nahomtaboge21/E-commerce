import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/common/ProductCard';
import fallbackProducts from '../data/products.json';
import { formatYen } from '../utils/currency';
import { useSeo } from '../utils/seo';
import { isShopifyConfigured } from '../shopify/storefront';
import './ProductDetail.css';

const Stars = ({ rating, count }) => (
  <div className="stars-row">
    <div className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke="#f59e0b"
          strokeWidth="2"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
    <span className="stars-rating-text">
      <strong>{rating.toFixed(1)}</strong>（{count?.toLocaleString()}件のカスタマーレビュー）
    </span>
  </div>
);

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const { addItem } = useCart();

  const variants = product?.variants || [];
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId)
    || variants.find((variant) => variant.availableForSale)
    || variants[0];
  const displayProduct = product && selectedVariant
    ? {
      ...product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      originalPrice: selectedVariant.compareAtPrice,
      stock: selectedVariant.availableForSale ? Number.MAX_SAFE_INTEGER : 0,
    }
    : product;

  const productDescription = product?.description || 'Luniva公式オンラインストアの商品詳細をご覧ください。';
  const productImage = product?.image || product?.images?.[0] || '/luniva-logo.png';
  useSeo({
    title: product ? `${product.name} | Luniva` : '商品情報 | Luniva',
    description: productDescription,
    canonicalPath: `/product/${encodeURIComponent(id)}`,
    image: productImage,
    type: 'product',
    noIndex: !product,
    structuredData: product ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: productDescription,
      sku: String(product.id),
      image: product.images?.length ? product.images : [productImage],
      brand: { '@type': 'Brand', name: 'Luniva' },
      offers: {
        '@type': 'Offer',
        url: `__LUNIVA_SITE_URL__/product/${encodeURIComponent(product.id)}`,
        priceCurrency: 'JPY',
        price: Number(product.price),
        availability: Number(product.stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    } : null,
  });

  useEffect(() => {
    setLoading(true);
    productsAPI
      .getById(id)
      .then((res) => {
        const loadedProduct = res.data;
        setProduct(loadedProduct);
        setSelectedVariantId(loadedProduct.variantId || loadedProduct.variants?.find((variant) => variant.availableForSale)?.id || '');
        setRelated(loadedProduct.related || []);
        setQty(1);
        setActiveImgIndex(0);
      })
      .catch(() => {
        if (isShopifyConfigured) return;
        const item = fallbackProducts.find((p) => p.id === id);
        if (item) {
          setProduct(item);
          setRelated(fallbackProducts.filter((p) => p.category === item.category && p.id !== item.id));
        }
      })
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    addItem(displayProduct, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p>商品が見つかりませんでした。</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>
          全商品一覧へ戻る
        </Link>
      </div>
    );
  }

  const discount =
    displayProduct.originalPrice > displayProduct.price
      ? Math.round((1 - displayProduct.price / displayProduct.originalPrice) * 100)
      : 0;

  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : [product.image];

  return (
    <div className="product-detail page">
      <div className="container">
        <nav className="breadcrumb" aria-label="パンくずリスト">
          <Link to="/">ホーム</Link> / <Link to="/shop">全商品</Link> /{' '}
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>
            {product.category}
          </Link>{' '}
          / <span aria-current="page">{product.name}</span>
        </nav>

        <div className="detail-grid">
          {/* Product Gallery */}
          <div className="detail-gallery">
            <div className="detail-image-wrap">
              <img src={images[activeImgIndex] || images[0]} alt={product.name} />
              {discount > 0 && (
              <span className="detail-discount-badge">−{discount}%</span>
              )}
              <span className="detail-floating-perk">日本全国送料無料</span>
            </div>
            {images.length > 1 && (
              <div className="detail-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumb-btn ${activeImgIndex === i ? 'active' : ''}`}
                    onClick={() => setActiveImgIndex(i)}
                    type="button"
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="detail-info">
            <div className="detail-badge-row">
              <span className="detail-category">{product.category}</span>
              <span className="badge-authentic">🌿 Luniva 公式正規品</span>
            </div>

            <h1 className="detail-name">{product.name}</h1>
            {product.englishName && (
              <p className="detail-english-name">{product.englishName}</p>
            )}

            {product.reviews > 0 && <Stars rating={product.rating} count={product.reviews} />}

            <div className="detail-pricing">
              <span className="detail-price">{formatYen(displayProduct.price)}</span>
              {discount > 0 && (
                <>
                  <span className="detail-original">{formatYen(displayProduct.originalPrice)}</span>
                  <span className="badge badge-danger">
                    {formatYen(displayProduct.originalPrice - displayProduct.price)} お得
                  </span>
                </>
              )}
              <span className="detail-tax-label">（税込・全国送料無料）</span>
            </div>

            <p className="detail-description">{product.description}</p>

            {variants.length > 1 && (
              <label className="detail-variant-select-wrap">
                <span>バリエーション</span>
                <select value={selectedVariant?.id || ''} onChange={(event) => { setSelectedVariantId(event.target.value); setQty(1); }}>
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id} disabled={!variant.availableForSale}>
                      {variant.title}{variant.availableForSale ? '' : '（在庫切れ）'}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="detail-stock">
              {displayProduct.stock > 10 ? (
                  <span className="badge badge-success">✓ 在庫あり（1〜2営業日以内に発送）</span>
              ) : displayProduct.stock > 0 ? (
                <span className="badge badge-warning">残りわずか（残り {displayProduct.stock} 点）</span>
              ) : (
                <span className="badge badge-danger">現在在庫切れ</span>
              )}
            </div>

            {displayProduct.stock > 0 && (
              <div className="detail-add">
                <div className="qty-control" aria-label="数量">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} type="button">
                    −
                  </button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(displayProduct.stock, q + 1))} type="button">
                    +
                  </button>
                </div>
                <button
                  className={`btn btn-primary btn-lg add-btn ${added ? 'added' : ''}`}
                  onClick={handleAddToCart}
                  type="button"
                >
                  {added ? '✓ カートに追加しました！' : 'カートに追加する'}
                </button>
              </div>
            )}

            {/* Luniva Trust Highlights Box */}
            <div className="detail-guarantee-card">
              <div className="detail-guarantee-item">
                <span className="guarantee-icon">🛡️</span>
                <div>
                    <strong>60日間返金保証</strong>
                    <p>商品到着から60日以内であれば返品・返金を承ります。</p>
                </div>
              </div>
              <div className="detail-guarantee-item">
                <span className="guarantee-icon">📦</span>
                <div>
                  <strong>日本全国送料無料</strong>
                  <p>追加の送料は一切かかりません。丁寧に梱包して発送します。</p>
                </div>
              </div>
              <div className="detail-guarantee-item">
                <span className="guarantee-icon">🔒</span>
                <div>
                    <strong>安心・安全なお支払い</strong>
                    <p>安全な決済方法でお支払いいただけます。</p>
                </div>
              </div>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="detail-tags">
                {product.tags.map((tag) => (
                  <span key={tag} className="badge badge-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="related-section">
            <div className="related-header">
              <span className="section-eyebrow">おすすめ商品</span>
              <h2 className="section-title">あわせてチェックしたいアイテム</h2>
            </div>
            <div className="related-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
