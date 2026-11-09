import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartSidebar from './components/common/CartSidebar';
import { useSeo } from './utils/seo';
import { isShopifyConfigured, shopifyAccountUrl, shopifyAdminUrl } from './shopify/storefront';
import './styles/globals.css';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation').then((module) => ({ default: module.OrderConfirmation })));
const Orders = lazy(() => import('./pages/Orders'));
const Login = lazy(() => import('./pages/Auth').then((module) => ({ default: module.Login })));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const SupportPages = lazy(() => import('./pages/SupportPages'));

function ShopifyRedirect({ href, title }) {
  useSeo({ title: `${title} | Luniva`, description: 'このページはShopifyアカウントへ移動します。', noIndex: true });
  useEffect(() => {
    if (href) window.location.replace(href);
  }, [href]);
  return (
    <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
      <p>Shopifyへ移動しています…</p>
      {href && <a className="btn btn-primary" href={href}>続行</a>}
    </div>
  );
}

function NotFound() {
  useSeo({ title: 'ページが見つかりません | Luniva', description: 'お探しのページは見つかりませんでした。', noIndex: true });
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 80, fontWeight: 800, color: 'var(--surface-3)' }}>404</h1>
      <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 24 }}>ページが見つかりませんでした</p>
      <a href="/" className="btn btn-primary">ホームへ戻る</a>
    </div>
  );
}

function Layout({ children, noFooter }) {
  return (
    <>
      <Navbar />
      <CartSidebar />
      <main style={{ minHeight: 'calc(100dvh - var(--nav-h))' }}>{children}</main>
      {!noFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={<div role="status" style={{ minHeight: '50vh', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>読み込み中…</div>}>
            <Routes>
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/shop" element={<Layout><Shop /></Layout>} />
              <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
              <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
              <Route path="/order-confirmation/:id" element={<Layout><OrderConfirmation /></Layout>} />
              <Route path="/orders" element={<Layout>{isShopifyConfigured ? <ShopifyRedirect href={shopifyAccountUrl} title="ご注文履歴" /> : <Orders />}</Layout>} />
              <Route path="/profile" element={<Layout>{isShopifyConfigured ? <ShopifyRedirect href={shopifyAccountUrl} title="アカウント" /> : <Profile />}</Layout>} />
              <Route path="/login" element={<Layout noFooter>{isShopifyConfigured ? <ShopifyRedirect href={shopifyAccountUrl} title="ログイン" /> : <Login />}</Layout>} />
              <Route path="/admin" element={<Layout noFooter>{isShopifyConfigured ? <ShopifyRedirect href={shopifyAdminUrl} title="Shopify管理画面" /> : <Admin />}</Layout>} />
              <Route path="/faq" element={<Layout><SupportPages /></Layout>} />
              <Route path="/contact" element={<Layout><SupportPages /></Layout>} />
              <Route path="/track-order" element={<Layout>{isShopifyConfigured ? <ShopifyRedirect href={shopifyAccountUrl} title="ご注文の追跡" /> : <SupportPages />}</Layout>} />
              <Route path="/shipping-policy" element={<Layout><SupportPages /></Layout>} />
              <Route path="/refund-policy" element={<Layout><SupportPages /></Layout>} />
              <Route path="/terms-of-service" element={<Layout><SupportPages /></Layout>} />
              <Route path="/privacy-policy" element={<Layout><SupportPages /></Layout>} />
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
