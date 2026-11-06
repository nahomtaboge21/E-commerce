import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product, qty = 1) => {
    const cartId = product.variantId || product.id;
    const cartProduct = { ...product, id: cartId, productId: product.productId || product.id };
    setItems(prev => {
      const existing = prev.find(i => i.id === cartId);
      if (existing) return prev.map(i => i.id === cartId ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) } : i);
      return [...prev, { ...cartProduct, quantity: qty }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id) => setItems(prev => prev.filter(i => i.id !== id)), []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, count, isOpen, setIsOpen, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
