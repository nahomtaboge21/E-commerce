import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  addShopifyCartLines,
  createShopifyCart,
  getShopifyCart,
  isShopifyConfigured,
  removeShopifyCartLines,
  updateShopifyCartLines,
} from '../shopify/storefront';

const CartContext = createContext(null);
const SHOPIFY_CART_ID_KEY = 'luniva_shopify_cart_id';
const LOCAL_CART_ITEMS_KEY = 'luniva_local_cart_items';

function readLocalItems() {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_CART_ITEMS_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function storeCartId(cartId) {
  try {
    if (cartId) localStorage.setItem(SHOPIFY_CART_ID_KEY, cartId);
    else localStorage.removeItem(SHOPIFY_CART_ID_KEY);
  } catch {
    // The in-memory cart remains usable when browser storage is unavailable.
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => (isShopifyConfigured ? [] : readLocalItems()));
  const [cartId, setCartId] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [cartError, setCartError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(!isShopifyConfigured);
  const [isSyncing, setIsSyncing] = useState(false);

  const cartRef = useRef({ id: '', items: [], checkoutUrl: '', total: 0 });
  const initializationRef = useRef(Promise.resolve());
  const operationQueueRef = useRef(Promise.resolve());
  const pendingOperationsRef = useRef(0);

  const applyShopifyCart = useCallback((cart) => {
    const next = cart || { id: '', items: [], checkoutUrl: '', total: 0 };
    cartRef.current = next;
    setCartId(next.id || '');
    setItems(next.items || []);
    setCheckoutUrl(next.checkoutUrl || '');
    storeCartId(next.id || '');
  }, []);

  useEffect(() => {
    if (!isShopifyConfigured) return undefined;

    let active = true;
    initializationRef.current = (async () => {
      let savedCartId = '';
      try {
        savedCartId = localStorage.getItem(SHOPIFY_CART_ID_KEY) || '';
      } catch {
        // Continue with a new cart if storage cannot be read.
      }

      try {
        if (savedCartId) {
          const cart = await getShopifyCart(savedCartId);
          if (active) {
            if (cart) applyShopifyCart(cart);
            else {
              storeCartId('');
              setCartError('Your saved cart has expired. Please add your items again.');
            }
          }
        }
      } catch (error) {
        if (active) setCartError(error.message || 'Could not restore your Shopify cart. Please retry.');
      } finally {
        if (active) setIsReady(true);
      }
    })();

    return () => { active = false; };
  }, [applyShopifyCart]);

  useEffect(() => {
    if (isShopifyConfigured) return;
    try {
      localStorage.setItem(LOCAL_CART_ITEMS_KEY, JSON.stringify(items));
    } catch {
      // Keep the local demo cart in memory if browser storage is unavailable.
    }
  }, [items]);

  const enqueueShopifyOperation = useCallback((operation) => {
    setCartError('');
    pendingOperationsRef.current += 1;
    setIsSyncing(true);

    const task = operationQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        await initializationRef.current;
        const nextCart = await operation(cartRef.current);
        if (nextCart) applyShopifyCart(nextCart);
        setCartError('');
        return nextCart;
      })
      .catch((error) => {
        setCartError(error.message || 'Could not update your Shopify cart. Please try again.');
        return null;
      })
      .finally(() => {
        pendingOperationsRef.current -= 1;
        if (pendingOperationsRef.current === 0) setIsSyncing(false);
      });

    operationQueueRef.current = task;
    return task;
  }, [applyShopifyCart]);

  const addItem = useCallback((product, qty = 1) => {
    const quantity = Math.max(1, Math.floor(Number(qty) || 1));

    if (isShopifyConfigured) {
      if (!product.variantId || product.availableForSale === false) {
        setCartError('This item is unavailable. Refresh the product page and choose an available variant.');
        setIsOpen(true);
        return Promise.resolve(null);
      }
      const line = { merchandiseId: product.variantId, quantity };
      const task = enqueueShopifyOperation((cart) => cart.id
        ? addShopifyCartLines(cart.id, [line])
        : createShopifyCart([line]));
      setIsOpen(true);
      return task;
    }

    const variantId = product.variantId || product.id;
    const cartProduct = { ...product, id: variantId, variantId, productId: product.productId || product.id };
    setItems((previous) => {
      const existing = previous.find((item) => item.variantId === variantId || item.id === variantId);
      if (existing) {
        return previous.map((item) => item.id === existing.id
          ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock || 99) }
          : item);
      }
      return [...previous, { ...cartProduct, quantity: Math.min(quantity, product.stock || 99) }];
    });
    setIsOpen(true);
    return Promise.resolve();
  }, [enqueueShopifyOperation]);

  const removeItem = useCallback((id) => {
    if (isShopifyConfigured) {
      return enqueueShopifyOperation((cart) => {
        const item = cart.items.find((line) => line.id === id);
        if (!cart.id || !item?.lineId) return cart;
        return removeShopifyCartLines(cart.id, [item.lineId]);
      });
    }
    setItems((previous) => previous.filter((item) => item.id !== id));
    return Promise.resolve();
  }, [enqueueShopifyOperation]);

  const updateQty = useCallback((id, qty) => {
    const quantity = Math.floor(Number(qty));
    if (!Number.isFinite(quantity)) return Promise.resolve(null);
    if (quantity < 1) return removeItem(id);

    if (isShopifyConfigured) {
      return enqueueShopifyOperation((cart) => {
        const item = cart.items.find((line) => line.id === id);
        if (!cart.id || !item?.lineId) return cart;
        return updateShopifyCartLines(cart.id, [{ id: item.lineId, quantity }]);
      });
    }
    setItems((previous) => previous.map((item) => item.id === id
      ? { ...item, quantity: Math.min(quantity, item.stock || 99) }
      : item));
    return Promise.resolve();
  }, [enqueueShopifyOperation, removeItem]);

  const clearCart = useCallback(() => {
    if (isShopifyConfigured) {
      return enqueueShopifyOperation((cart) => {
        if (!cart.id || !cart.items.length) {
          applyShopifyCart(null);
          return null;
        }
        return removeShopifyCartLines(cart.id, cart.items.map((item) => item.lineId));
      });
    }
    setItems([]);
    return Promise.resolve();
  }, [applyShopifyCart, enqueueShopifyOperation]);

  const total = isShopifyConfigured && cartId
    ? cartRef.current.total
    : items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      total,
      count,
      cartId,
      checkoutUrl,
      cartError,
      isOpen,
      isReady,
      isSyncing,
      setIsOpen,
      setCartError,
      addItem,
      removeItem,
      updateQty,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
