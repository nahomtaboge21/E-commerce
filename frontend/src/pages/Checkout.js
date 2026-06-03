import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api';
import { saveRecentOrder } from '../utils/recentOrders';
import './Checkout.css';

function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(val) {
  const d = val.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
}

function Steps({ current }) {
  const steps = ['Shipping', 'Payment', 'Review'];
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

function SummaryPanel({ items, total, shipping, tax, orderTotal }) {
  return (
    <aside className="ck-summary">
      <h3 className="ck-summary-title">Order Summary</h3>
      <div className="ck-summary-items">
        {items.map(item => (
          <div key={item.id} className="ck-summary-item">
            <div className="ck-summary-img-wrap">
              <img src={Array.isArray(item.image) ? item.image[0] : item.image} alt={item.name} />
              <span className="ck-summary-qty">{item.quantity}</span>
            </div>
            <p className="ck-summary-name">{item.name}</p>
            <span className="ck-summary-price">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="ck-summary-totals">
        <div className="ck-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
        <div className="ck-row">
          <span>Shipping</span>
          <span className={shipping === 0 ? 'ck-free' : ''}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="ck-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
        <div className="ck-row ck-row-total"><span>Total</span><span>${orderTotal.toFixed(2)}</span></div>
      </div>
      {shipping > 0 && <p className="ck-free-ship-note">Add ${(50 - total).toFixed(2)} more for free shipping</p>}
    </aside>
  );
}

function StepShipping({ form, set, errors }) {
  return (
    <div className="ck-section">
      <h2 className="ck-section-title">Shipping Information</h2>
      <div className="ck-grid-2">
        <Field label="First Name" error={errors.firstName}>
          <input className={`ck-input${errors.firstName ? ' ck-input-err' : ''}`} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="John" />
        </Field>
        <Field label="Last Name" error={errors.lastName}>
          <input className={`ck-input${errors.lastName ? ' ck-input-err' : ''}`} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Doe" />
        </Field>
      </div>
      <Field label="Email Address" error={errors.email}>
        <input className={`ck-input${errors.email ? ' ck-input-err' : ''}`} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" />
      </Field>
      <Field label="Street Address" error={errors.street}>
        <input className={`ck-input${errors.street ? ' ck-input-err' : ''}`} value={form.street} onChange={e => set('street', e.target.value)} placeholder="123 Main Street" />
      </Field>
      <div className="ck-grid-2">
        <Field label="City" error={errors.city}>
          <input className={`ck-input${errors.city ? ' ck-input-err' : ''}`} value={form.city} onChange={e => set('city', e.target.value)} placeholder="New York" />
        </Field>
        <Field label="State" error={errors.state}>
          <input className={`ck-input${errors.state ? ' ck-input-err' : ''}`} value={form.state} onChange={e => set('state', e.target.value)} placeholder="NY" />
        </Field>
      </div>
      <div className="ck-grid-2">
        <Field label="ZIP Code" error={errors.zip}>
          <input className={`ck-input${errors.zip ? ' ck-input-err' : ''}`} value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="10001" />
        </Field>
        <Field label="Country">
          <select className="ck-input" value={form.country} onChange={e => set('country', e.target.value)}>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="ET">Ethiopia</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'applepay', label: 'Apple Pay' },
  { id: 'cod', label: 'Cash on Delivery' },
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

function PayPalIcon() {
  return (
    <svg width="80" height="26" viewBox="0 0 80 26">
      <text x="2" y="20" fontFamily="Arial" fontWeight="900" fontSize="18" fill="#003087">Pay</text>
      <text x="30" y="20" fontFamily="Arial" fontWeight="900" fontSize="18" fill="#009CDE">Pal</text>
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

function CodIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8">
      <rect x="2" y="6" width="20" height="14" rx="2"/>
      <path d="M2 10h20"/><circle cx="12" cy="15" r="2"/>
    </svg>
  );
}

const PM_ICONS = { card: null, paypal: <PayPalIcon/>, applepay: <ApplePayIcon/>, cod: <CodIcon/> };

function StepPayment({ form, set, errors }) {
  const method = form.paymentMethod || 'card';
  return (
    <div className="ck-section">
      <h2 className="ck-section-title">Payment Method</h2>
      <div className="ck-secure-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Secure, encrypted checkout
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
          <Field label="Cardholder Name" error={errors.cardName}>
            <input className={`ck-input${errors.cardName ? ' ck-input-err' : ''}`} value={form.cardName} onChange={e => set('cardName', e.target.value)} placeholder="John Doe" autoComplete="cc-name" />
          </Field>
          <Field label="Card Number" error={errors.cardNumber}>
            <input className={`ck-input${errors.cardNumber ? ' ck-input-err' : ''}`} value={form.cardNumber} onChange={e => set('cardNumber', formatCard(e.target.value))} placeholder="4242 4242 4242 4242" inputMode="numeric" autoComplete="cc-number" />
          </Field>
          <div className="ck-grid-2">
            <Field label="Expiry" error={errors.cardExpiry}>
              <input className={`ck-input${errors.cardExpiry ? ' ck-input-err' : ''}`} value={form.cardExpiry} onChange={e => set('cardExpiry', formatExpiry(e.target.value))} placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" />
            </Field>
            <Field label="CVV" error={errors.cardCvv}>
              <input className={`ck-input${errors.cardCvv ? ' ck-input-err' : ''}`} value={form.cardCvv} onChange={e => set('cardCvv', e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="***" inputMode="numeric" type="password" autoComplete="cc-csc" />
            </Field>
          </div>
          <p className="ck-demo-hint">Demo mode - no real payment is processed.</p>
        </div>
      )}

      {method === 'paypal' && <div className="ck-alt-method-msg"><PayPalIcon/><p>You'll be redirected to PayPal to complete your payment securely.</p></div>}
      {method === 'applepay' && <div className="ck-alt-method-msg"><ApplePayIcon/><p>Confirm payment using Face ID or Touch ID on your Apple device.</p></div>}
      {method === 'cod' && <div className="ck-alt-method-msg ck-cod-msg"><CodIcon/><p>Pay in cash when your order is delivered. No online payment needed.</p></div>}
    </div>
  );
}

function StepReview({ form, items, error, setStep }) {
  const method = form.paymentMethod || 'card';
  const methodLabel = PAYMENT_METHODS.find(p => p.id === method)?.label || 'Card';
  return (
    <div className="ck-section">
      <h2 className="ck-section-title">Review Your Order</h2>
      <div className="ck-review-block">
        <div className="ck-review-header">
          <span>Shipping to</span>
          <button className="ck-review-edit" type="button" onClick={() => setStep(1)}>Edit</button>
        </div>
        <p className="ck-review-val">{form.firstName} {form.lastName}</p>
        <p className="ck-review-val ck-muted">{form.street}, {form.city}, {form.state} {form.zip}</p>
        <p className="ck-review-val ck-muted">{form.email}</p>
      </div>
      <div className="ck-review-block">
        <div className="ck-review-header">
          <span>Payment</span>
          <button className="ck-review-edit" type="button" onClick={() => setStep(2)}>Edit</button>
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
              <span className="ck-muted">Qty {item.quantity}</span>
            </div>
            <span className="ck-review-item-price">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      {error && <div className="ck-error-box"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
    </div>
  );
}

export default function Checkout() {
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
    street: '', city: '', state: '', zip: '', country: 'US',
    paymentMethod: 'card',
    cardNumber: '', cardExpiry: '', cardCvv: '', cardName: '',
  });

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const shipping = total >= 50 ? 0 : 9.99;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax;

  if (!items.length) return (
    <div className="ck-empty page">
      <div className="container">
        <div className="ck-empty-icon">Cart</div>
        <h2>Your cart is empty</h2>
        <p>Add some items before checking out.</p>
        <Link to="/shop" className="btn btn-primary">Browse Shop</Link>
      </div>
    </div>
  );

  function validateStep(s) {
    const nextErrors = {};
    if (s === 1) {
      if (!form.firstName.trim()) nextErrors.firstName = 'Required';
      if (!form.lastName.trim()) nextErrors.lastName = 'Required';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'Valid email required';
      if (!form.street.trim()) nextErrors.street = 'Required';
      if (!form.city.trim()) nextErrors.city = 'Required';
      if (!form.state.trim()) nextErrors.state = 'Required';
      if (!form.zip.trim()) nextErrors.zip = 'Required';
    }
    if (s === 2 && form.paymentMethod === 'card') {
      if (form.cardNumber.replace(/\s/g, '').length < 16) nextErrors.cardNumber = 'Enter a valid 16-digit card number';
      if (!form.cardName.trim()) nextErrors.cardName = 'Required';
      if (form.cardExpiry.length < 5) nextErrors.cardExpiry = 'Enter MM/YY';
      if (form.cardCvv.length < 3) nextErrors.cardCvv = 'Enter CVV';
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
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
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
            {step > 1 && <button type="button" className="btn btn-outline" onClick={back}>Back</button>}
            {step < 3 && <button type="button" className="btn btn-primary ck-btn-continue" onClick={next}>Continue</button>}
            {step === 3 && (
              <button type="button" className="btn btn-primary ck-btn-continue" onClick={placeOrder} disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16 }}/> Processing...</> : `Place Order - $${orderTotal.toFixed(2)}`}
              </button>
            )}
          </div>
        </div>
        <SummaryPanel items={items} total={total} shipping={shipping} tax={tax} orderTotal={orderTotal} />
      </div>
    </div>
  );
}
