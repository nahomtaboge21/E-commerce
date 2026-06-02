import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import './CartSidebar.css';

export default function CartSidebar() {
  const { items, total, isOpen, setIsOpen, removeItem, updateQty } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsOpen(false)} />
      <aside className="cart-sidebar">
        <div className="cart-header">
          <h2>Cart ({items.length})</h2>
          <button className="btn btn-icon btn-ghost" onClick={() => setIsOpen(false)} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <p>Your cart is empty</p>
            <Link to="/shop" className="btn btn-primary" onClick={() => setIsOpen(false)}>Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={Array.isArray(item.image) ? (item.image[0] || '') : item.image} alt={item.name} />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">${item.price.toFixed(2)}</p>
                    <div className="cart-item-controls">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</button>
                      <button className="remove-btn" onClick={() => removeItem(item.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                  <p className="cart-item-subtotal">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <p className="cart-shipping-note">Shipping & taxes calculated at checkout</p>
              <Link to="/checkout" className="btn btn-accent btn-lg" style={{width:'100%', justifyContent:'center'}} onClick={() => setIsOpen(false)}>
                Checkout → 
              </Link>
              <button className="btn btn-ghost btn-sm" style={{width:'100%', justifyContent:'center', marginTop:8}} onClick={() => setIsOpen(false)}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
