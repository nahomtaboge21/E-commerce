import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartSidebar from './components/common/CartSidebar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import { Login, Register } from './pages/Auth';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import './styles/globals.css';

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
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/shop" element={<Layout><Shop /></Layout>} />
            <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
            <Route path="/order-confirmation/:id" element={<Layout><OrderConfirmation /></Layout>} />
            <Route path="/orders" element={<Layout><Orders /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="/login" element={<Layout noFooter><Login /></Layout>} />
            <Route path="/register" element={<Layout noFooter><Register /></Layout>} />
            <Route path="/admin" element={<Layout noFooter><Admin /></Layout>} />
            <Route path="*" element={<Layout><div style={{textAlign:'center',padding:'100px 20px'}}><h1 style={{fontFamily:'var(--font-display)',fontSize:80,fontWeight:800,color:'var(--surface-3)'}}>404</h1><p style={{fontSize:18,color:'var(--text-secondary)',marginBottom:24}}>Page not found</p><a href="/" className="btn btn-primary">Go Home</a></div></Layout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
