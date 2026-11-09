import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { isShopifyConfigured } from '../shopify/storefront';
import { formatCurrency } from '../utils/currency';
import { useSeo } from '../utils/seo';
import './Checkout.css';

function OrderSummary({ items, total }) {
  const currencyCode = items[0]?.currencyCode || 'JPY';

  return (
    <aside className="ck-summary">
      <h2 className="ck-summary-title">ご注文内容</h2>
      <div className="ck-summary-items">
        {items.map((item) => (
          <div className="ck-summary-item" key={item.id}>
            <div className="ck-summary-item-img-wrap">
              <img src={item.image || item.images?.[0] || ''} alt={item.name} />
              <span className="ck-qty-badge">{item.quantity}</span>
            </div>
            <div className="ck-summary-item-info">
              <p className="ck-summary-item-name">{item.name}</p>
              {item.variantTitle && item.variantTitle !== 'Default Title' && (
                <span className="ck-muted">{item.variantTitle}</span>
              )}
            </div>
            <span className="ck-summary-price">
              {formatCurrency(item.price * item.quantity, item.currencyCode)}
            </span>
          </div>
        ))}
      </div>
      <div className="ck-row ck-row-total">
        <span>商品小計</span>
        <span>{formatCurrency(total, currencyCode)}</span>
      </div>
      <p className="ck-muted">送料・税金はShopifyチェックアウトで確定します。</p>
    </aside>
  );
}

export default function Checkout() {
  useSeo({
    title: 'ご注文手続き | Luniva',
    description: 'Shopifyの安全なチェックアウトで配送先とお支払いを完了できます。',
    canonicalPath: '/checkout',
    noIndex: true,
  });

  const { items, total, checkoutUrl, cartError, isReady, isSyncing } = useCart();

  if (!isShopifyConfigured) {
    return (
      <div className="ck-empty page">
        <div className="container">
          <h1>チェックアウトを準備中です</h1>
          <p>Shopify接続が設定されるまで、ご注文手続きはご利用いただけません。</p>
          <Link to="/shop" className="btn btn-primary">商品一覧へ戻る</Link>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return <div className="ck-empty page"><p>カートを読み込んでいます…</p></div>;
  }

  if (!items.length) {
    return (
      <div className="ck-empty page">
        <div className="container">
          <h1>カートは空です</h1>
          <p>購入する商品を選んでください。</p>
          <Link to="/shop" className="btn btn-primary">商品一覧を見る</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ck-page page">
      <div className="container ck-container">
        <main className="ck-main">
          <h1 className="ck-section-title">ご注文内容の確認</h1>
          <p>商品と数量をご確認ください。配送先、送料、税金、お支払いはShopifyの安全なチェックアウトで入力します。</p>
          {cartError && <div className="ck-error-box" role="alert">{cartError}</div>}
          <button
            className="btn btn-primary ck-btn-continue"
            type="button"
            disabled={!checkoutUrl || isSyncing}
            onClick={() => checkoutUrl && window.location.assign(checkoutUrl)}
          >
            {isSyncing ? 'カートを更新中…' : 'Shopifyの安全なチェックアウトへ進む'}
          </button>
        </main>
        <OrderSummary items={items} total={total} />
      </div>
    </div>
  );
}
