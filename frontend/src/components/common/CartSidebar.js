import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import './CartSidebar.css';

export default function CartSidebar() {
  const {
    items,
    total,
    checkoutUrl,
    cartError,
    isOpen,
    isReady,
    isSyncing,
    setIsOpen,
    removeItem,
    updateQty,
  } = useCart();

  if (!isOpen) return null;

  const currencyCode = items[0]?.currencyCode || 'JPY';
  const formatPrice = (val) => formatCurrency(val, currencyCode);

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsOpen(false)} />
      <aside className="cart-sidebar" aria-label="ショッピングカート">
        {cartError && <p className="cart-error-message" role="alert">{cartError}</p>}
        <div className="cart-header">
          <div className="cart-header-title">
            <h2>ショッピングカート</h2>
            <span className="cart-item-count">({items.length}点)</span>
          </div>
          <button
            className="btn btn-icon btn-ghost cart-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="閉じる"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free Shipping Progress Alert */}
        <div className="cart-shipping-banner">
          <span className="shipping-badge-icon">🌿</span>
          <span className="shipping-badge-text">日本全国どこでも完全送料無料！</span>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <p className="cart-empty-text">{!isReady || isSyncing ? 'カートを読み込んでいます…' : '現在カートは空です'}</p>
            <p className="cart-empty-sub">Lunivaの心地よいアイテムをチェックしてみましょう</p>
            <Link to="/shop" className="btn btn-primary" onClick={() => setIsOpen(false)}>
              商品を見る
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={Array.isArray(item.image) ? (item.image[0] || '') : (Array.isArray(item.images) ? (item.images[0] || '') : item.image)}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    {item.variantTitle && item.variantTitle !== 'Default Title' && <p className="cart-item-variant">{item.variantTitle}</p>}
                    <p className="cart-item-price">{formatPrice(item.price)}</p>
                    <div className="cart-item-controls">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={isSyncing || item.quantity <= 1}
                        type="button"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        disabled={isSyncing || item.quantity >= item.stock}
                        type="button"
                      >
                        +
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                        disabled={isSyncing}
                        type="button"
                        aria-label="削除"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="cart-item-subtotal">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total-row">
                <span className="cart-total-label">小計（税込）</span>
                <span className="cart-total-val">{formatPrice(total)}</span>
              </div>
              <div className="cart-guarantee-note">
                <span>🛡️ 全品60日間完全返金保証対象</span>
              </div>
              {checkoutUrl && isReady && !isSyncing ? (
                <a
                  href={checkoutUrl}
                  className="btn btn-primary btn-lg checkout-btn"
                  onClick={() => setIsOpen(false)}
                >
                  お会計へ進む（送料無料）
                </a>
              ) : (
                <button className="btn btn-primary btn-lg checkout-btn" type="button" disabled>
                  {!isReady || isSyncing ? 'カートを更新中…' : 'チェックアウトを準備できません'}
                </button>
              )}
              <button
                className="btn btn-ghost btn-sm continue-btn"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                買い物を続ける
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
