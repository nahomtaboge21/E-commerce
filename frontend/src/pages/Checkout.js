import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSeo } from '../utils/seo';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api';
import { saveRecentOrder } from '../utils/recentOrders';
import { formatYen } from '../utils/currency';
import { createShopifyCheckout, isShopifyConfigured } from '../shopify/storefront';
import './Checkout.css';

function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(val) {
  const d = val.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
}

function Steps({ current }) {
  const steps = ['お届け先', 'お支払い', 'ご注文確認'];
  return (
    <div className="ck-steps">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={label} className="ck-step-wrap">
            <div className={`ck-step-dot${active ? ' active' : ''}${done ? ' done' : ''}`}>
              {done
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                : idx}
            </div>
            <span className={`ck-step-label${active ? ' active' : ''}`}>{label}</span>
            {i < steps.length - 1 && <div className={`ck-step-line${done ? ' done' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="ck-field">
      <label className="ck-label">{label}</label>
      {children}
      {error && <span className="ck-field-error">{error}</span>}
    </div>
  );
}

const formatPrice = formatYen;

function SummaryPanel({ items, total, orderTotal }) {
  return (
    <aside className="ck-summary">
      <h3 className="ck-summary-title">ご注文内容</h3>
      <div className="ck-summary-items">
        {items.map(item => (
          <div key={item.id} className="ck-summary-item">
            <div className="ck-summary-img-wrap">
              <img src={Array.isArray(item.image) ? item.image[0] : (Array.isArray(item.images) ? item.images[0] : item.image)} alt={item.name} />
              <span className="ck-summary-qty">{item.quantity}</span>
            </div>
            <p className="ck-summary-name">{item.name}</p>
            <span className="ck-summary-price">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="ck-summary-totals">
        <div className="ck-row"><span>小計</span><span>{formatPrice(total)}</span></div>
        <div className="ck-row">
          <span>送料</span>
          <span className="ck-free">無料（日本全国）</span>
        </div>
        <div className="ck-row"><span>表示価格は税込です</span></div>
        <div className="ck-row ck-row-total"><span>合計（税込）</span><span>{formatPrice(orderTotal)}</span></div>
      </div>
      <div className="ck-guarantee-pill">
        <span>🛡️ 60日間安心返金保証対象</span>
      </div>
    </aside>
  );
}

function StepShipping({ form, set, errors }) {
  return (
    <div className="ck-section">
      <h2 className="ck-section-title">お届け先情報</h2>
      <div className="ck-grid-2">
        <Field label="姓" error={errors.firstName}>
          <input className={`ck-input${errors.firstName ? ' ck-input-err' : ''}`} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="山田" />
        </Field>
        <Field label="名" error={errors.lastName}>
          <input className={`ck-input${errors.lastName ? ' ck-input-err' : ''}`} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="花子" />
        </Field>
      </div>
      <Field label="メールアドレス" error={errors.email}>
        <input className={`ck-input${errors.email ? ' ck-input-err' : ''}`} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@example.com" />
      </Field>
      <Field label="住所" error={errors.street}>
        <input className={`ck-input${errors.street ? ' ck-input-err' : ''}`} value={form.street} onChange={e => set('street', e.target.value)} placeholder="番地・建物名" />
      </Field>
      <div className="ck-grid-2">
        <Field label="市区町村" error={errors.city}>
          <input className={`ck-input${errors.city ? ' ck-input-err' : ''}`} value={form.city} onChange={e => set('city', e.target.value)} placeholder="渋谷区" />
        </Field>
        <Field label="都道府県" error={errors.state}>
          <input className={`ck-input${errors.state ? ' ck-input-err' : ''}`} value={form.state} onChange={e => set('state', e.target.value)} placeholder="東京都" />
        </Field>
      </div>
      <div className="ck-grid-2">
        <Field label="郵便番号" error={errors.zip}>
          <input className={`ck-input${errors.zip ? ' ck-input-err' : ''}`} value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="150-0001" autoComplete="postal-code" />
        </Field>
        <Field label="国・地域">
          <select className="ck-input" value={form.country} onChange={e => set('country', e.target.value)}>
            <option value="JP">日本</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

const PAYMENT_METHODS = [
  { id: 'card', label: 'クレジットカード' },
  { id: 'shoppay', label: 'Shop Pay' },
  { id: 'googlepay', label: 'Google Pay' },
  { id: 'applepay', label: 'Apple Pay' },
];

function VisaIcon() {
  return (
    <svg width="40" height="26" viewBox="0 0 40 26" fill="none">
      <rect width="40" height="26" rx="4" fill="#1A1F71"/>
      <path d="M15 19L17 7H20L18 19H15Z" fill="white"/>
      <path d="M27 7.3C26.3 7.1 25.2 6.9 23.9 6.9C21 6.9 19 8.4 19 10.5C19 12 20.4 12.8 21.4 13.4C22.5 14 22.8 14.3 22.8 14.8C22.8 15.5 22 15.9 21.1 15.9C19.9 15.9 19.3 15.7 18.3 15.3L17.9 15.1L17.5 17.7C18.3 18.1 19.8 18.4 21.3 18.4C24.4 18.4 26.3 16.9 26.3 14.7C26.3 13.5 25.6 12.6 24.1 11.9C23.1 11.3 22.6 11 22.6 10.5C22.6 10 23.1 9.5 24.2 9.5C25.1 9.5 25.7 9.7 26.3 9.9L26.5 10L27 7.3Z" fill="white"/>
      <path d="M30.5 7H28.2C27.5 7 27 7.2 26.7 7.9L22.8 19H25.9L26.5 17.3H30.2L30.5 19H33.3L30.5 7ZM27.4 15.1L28.7 11.3C28.7 11.3 29 10.5 29.2 10L29.4 10.9C29.4 10.9 30.1 14 30.2 15.1H27.4Z" fill="white"/>
      <path d="M13 7L10.2 14.9L9.9 13.3C9.3 11.3 7.5 9.1 5.5 8.1L8.1 19H11.2L16 7H13Z" fill="white"/>
      <path d="M7.5 7H2.7L2.6 7.2C6.3 8.2 8.8 10.5 9.9 13.3L8.6 8C8.4 7.2 7.9 7 7.5 7Z" fill="#F9A533"/>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg width="40" height="26" viewBox="0 0 40 26" fill="none">
      <rect width="40" height="26" rx="4" fill="#252525"/>
      <circle cx="15" cy="13" r="7" fill="#EB001B"/>
      <circle cx="25" cy="13" r="7" fill="#F79E1B"/>
      <path d="M20 7.5A7 7 0 0 1 23 13 7 7 0 0 1 20 18.5 7 7 0 0 1 17 13 7 7 0 0 1 20 7.5Z" fill="#FF5F00"/>
    </svg>
  );
}

function ApplePayIcon() {
  return (
    <svg width="56" height="26" viewBox="0 0 56 26" fill="none">
      <rect width="56" height="26" rx="5" fill="#000"/>
      <text x="10" y="18" fill="white" fontSize="12" fontFamily="-apple-system,Arial" fontWeight="600"> Pay</text>
    </svg>
  );
}

const PM_ICONS = { card: null, shoppay: <span>Shop Pay</span>, googlepay: <span>G Pay</span>, applepay: <ApplePayIcon/> };

function StepPayment({ form, set, errors }) {
  const method = form.paymentMethod || 'card';
  return (
    <div className="ck-section">
      <h2 className="ck-section-title">お支払い方法</h2>
      <div className="ck-secure-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        安心・安全な暗号化決済
      </div>

      <div className="ck-methods">
        {PAYMENT_METHODS.map(pm => (
          <button key={pm.id} type="button" className={`ck-method-btn${method === pm.id ? ' selected' : ''}`} onClick={() => set('paymentMethod', pm.id)}>
            <span className={`ck-method-radio${method === pm.id ? ' checked' : ''}`}/>
            <span className="ck-method-label">{pm.label}</span>
            {pm.id === 'card' && <span className="ck-method-cards"><VisaIcon/><MastercardIcon/></span>}
            {PM_ICONS[pm.id] && <span className="ck-method-icon-right">{PM_ICONS[pm.id]}</span>}
          </button>
        ))}
      </div>

      {method === 'card' && (
        <div className="ck-card-fields">
          <Field label="カード名義" error={errors.cardName}>
            <input className={`ck-input${errors.cardName ? ' ck-input-err' : ''}`} value={form.cardName} onChange={e => set('cardName', e.target.value)} placeholder="HANAKO YAMADA" autoComplete="cc-name" />
          </Field>
          <Field label="カード番号" error={errors.cardNumber}>
            <input className={`ck-input${errors.cardNumber ? ' ck-input-err' : ''}`} value={form.cardNumber} onChange={e => set('cardNumber', formatCard(e.target.value))} placeholder="4242 4242 4242 4242" inputMode="numeric" autoComplete="cc-number" />
          </Field>
          <div className="ck-grid-2">
            <Field label="有効期限" error={errors.cardExpiry}>
              <input className={`ck-input${errors.cardExpiry ? ' ck-input-err' : ''}`} value={form.cardExpiry} onChange={e => set('cardExpiry', formatExpiry(e.target.value))} placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" />
            </Field>
            <Field label="セキュリティコード" error={errors.cardCvv}>
              <input className={`ck-input${errors.cardCvv ? ' ck-input-err' : ''}`} value={form.cardCvv} onChange={e => set('cardCvv', e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="***" inputMode="numeric" type="password" autoComplete="cc-csc" />
            </Field>
          </div>
          <p className="ck-demo-hint">デモ画面のため、実際の決済は行われません。</p>
        </div>
      )}

      {method !== 'card' && <div className="ck-alt-method-msg"><p>{method === 'applepay' ? 'Apple Pay' : method === 'googlepay' ? 'Google Pay' : 'Shop Pay'} を選択しました。デモ画面のため、実際の決済は行われません。</p></div>}
    </div>
  );
}

function StepReview({ form, items, error, setStep }) {
  const method = form.paymentMethod || 'card';
  const methodLabel = PAYMENT_METHODS.find(p => p.id === method)?.label || 'クレジットカード';
  return (
    <div className="ck-section">
      <h2 className="ck-section-title">ご注文内容の確認</h2>
      <div className="ck-review-block">
        <div className="ck-review-header">
          <span>お届け先</span>
          <button className="ck-review-edit" type="button" onClick={() => setStep(1)}>変更</button>
        </div>
        <p className="ck-review-val">{form.firstName} {form.lastName}</p>
        <p className="ck-review-val ck-muted">{form.street}, {form.city}, {form.state} {form.zip}</p>
        <p className="ck-review-val ck-muted">{form.email}</p>
      </div>
      <div className="ck-review-block">
        <div className="ck-review-header">
          <span>お支払い方法</span>
          <button className="ck-review-edit" type="button" onClick={() => setStep(2)}>変更</button>
        </div>
        <p className="ck-review-val">
          {methodLabel}
          {method === 'card' && form.cardNumber && <> &nbsp;·&nbsp; **** {form.cardNumber.replace(/\s/g,'').slice(-4)}</>}
        </p>
      </div>
      <div className="ck-review-items">
        {items.map(item => (
          <div key={item.id} className="ck-review-item">
            <img src={Array.isArray(item.image) ? item.image[0] : item.image} alt={item.name} />
            <div className="ck-review-item-info">
              <p>{item.name}</p>
              <span className="ck-muted">数量 {item.quantity}</span>
            </div>
            <span className="ck-review-item-price">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      {error && <div className="ck-error-box"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
    </div>
  );
}

export default function Checkout() {
  return isShopifyConfigured ? <ShopifyCheckout /> : <LegacyCheckout />;
}

function ShopifyCheckout() {
  useSeo({ title: 'ご注文手続き | Luniva', description: 'Shopifyの安全なチェックアウトでお届け先とお支払い方法を入力します。', canonicalPath: '/checkout', noIndex: true });
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const goToShopifyCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const checkoutUrl = await createShopifyCheckout(items);
      window.location.assign(checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError.message || 'チェックアウトを開始できませんでした。もう一度お試しください。');
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="ck-empty page">
        <div className="container">
          <h2>カートは空です</h2>
          <Link to="/shop" className="btn btn-primary">商品一覧を見る</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ck-page page">
      <div className="container ck-container">
        <div className="ck-main">
          <h1 className="ck-section-title">ご注文内容の確認</h1>
          <p>お届け先、配送方法、お支払いはShopifyの安全なチェックアウトで入力できます。</p>
          <p>商品と数量を確認して、Shopifyへ進んでください。</p>
          {error && <div className="ck-error-box" role="alert">{error}</div>}
          <button className="btn btn-primary ck-btn-continue" type="button" onClick={goToShopifyCheckout} disabled={loading}>
            {loading ? 'Shopifyへ接続中…' : '安全なチェックアウトへ進む'}
          </button>
        </div>
        <SummaryPanel items={items} total={total} orderTotal={total} />
      </div>
    </div>
  );
}

function LegacyCheckout() {
  useSeo({ title: 'ご注文手続き | Luniva', description: 'Lunivaでご注文内容とお届け先を確認して、お支払い手続きに進みます。', canonicalPath: '/checkout', noIndex: true });
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    street: '', city: '', state: '', zip: '', country: 'JP',
    paymentMethod: 'card',
    cardNumber: '', cardExpiry: '', cardCvv: '', cardName: '',
  });

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const orderTotal = total;

  if (!items.length) return (
    <div className="ck-empty page">
      <div className="container">
        <div className="ck-empty-icon">Cart</div>
        <h2>カートは空です</h2>
        <p>購入する商品を選んでください。</p>
        <Link to="/shop" className="btn btn-primary">商品一覧を見る</Link>
      </div>
    </div>
  );

  function validateStep(s) {
    const nextErrors = {};
    if (s === 1) {
      if (!form.firstName.trim()) nextErrors.firstName = '入力してください';
      if (!form.lastName.trim()) nextErrors.lastName = '入力してください';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = '有効なメールアドレスを入力してください';
      if (!form.street.trim()) nextErrors.street = '入力してください';
      if (!form.city.trim()) nextErrors.city = '入力してください';
      if (!form.state.trim()) nextErrors.state = '入力してください';
      if (!form.zip.trim()) nextErrors.zip = '入力してください';
    }
    if (s === 2 && form.paymentMethod === 'card') {
      if (form.cardNumber.replace(/\s/g, '').length < 16) nextErrors.cardNumber = '有効なカード番号を入力してください';
      if (!form.cardName.trim()) nextErrors.cardName = '入力してください';
      if (form.cardExpiry.length < 5) nextErrors.cardExpiry = '月/年の形式で入力してください';
      if (form.cardCvv.length < 3) nextErrors.cardCvv = 'セキュリティコードを入力してください';
    }
    return nextErrors;
  }

  function next() {
    const nextErrors = validateStep(step);
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function back() {
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function placeOrder() {
    setLoading(true);
    setError('');
    try {
      const res = await ordersAPI.create({
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
        shippingAddress: { street: form.street, city: form.city, state: form.state, zip: form.zip, country: form.country },
        paymentMethod: form.paymentMethod,
        customerName: `${form.firstName} ${form.lastName}`.trim(),
        customerEmail: form.email,
      });
      saveRecentOrder(res.data);
      clearCart();
      navigate(`/order-confirmation/${res.data.id}?token=${encodeURIComponent(res.data.publicToken || '')}`);
    } catch (err) {
      setError(err.response?.data?.error || 'エラーが発生しました。もう一度お試しください。');
      setLoading(false);
    }
  }

  return (
    <div className="ck-page page">
      <div className="container ck-container">
        <div className="ck-main">
          <Steps current={step} />
          {step === 1 && <StepShipping form={form} set={set} errors={errors} />}
          {step === 2 && <StepPayment form={form} set={set} errors={errors} />}
          {step === 3 && <StepReview form={form} items={items} error={error} setStep={setStep} />}
          <div className="ck-nav">
            {step > 1 && <button type="button" className="btn btn-outline" onClick={back}>前へ戻る</button>}
            {step < 3 && <button type="button" className="btn btn-primary ck-btn-continue" onClick={next}>次へ進む</button>}
            {step === 3 && (
              <button type="button" className="btn btn-primary ck-btn-continue" onClick={placeOrder} disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16 }}/> 処理中...</> : `注文を確定する - ${formatPrice(orderTotal)}`}
              </button>
            )}
          </div>
        </div>
        <SummaryPanel items={items} total={total} orderTotal={orderTotal} />
      </div>
    </div>
  );
}
