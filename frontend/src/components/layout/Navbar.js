import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import logo from '../../assets/logo.png';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count, setIsOpen } = useCart();

  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [lang, setLang] = useState('English');
  const [currency, setCurrency] = useState('USD');
  const [isPhone, setIsPhone] = useState(() => window.innerWidth <= 640);

  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const nextIsPhone = window.innerWidth <= 640;
      setIsPhone(nextIsPhone);
      if (!nextIsPhone) setMenuOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate(`/shop?search=${encodeURIComponent(q)}`);
    setSearch('');
  };

  return (
    <>
      <div className="nav-topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">
            <div className="topbar-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +1 (396) 541-0000
            </div>
            <div className="topbar-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              support@shopvine.com
            </div>
          </div>

          <div className="topbar-marquee-wrap" aria-label="Promotions">
            <div className="topbar-marquee">
              <span className="topbar-marquee-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                Free delivery on orders over $50
              </span>
              <span className="topbar-dot" aria-hidden="true">·</span>
              <span className="topbar-marquee-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                New arrivals every week
              </span>
              <span className="topbar-dot" aria-hidden="true">·</span>
              <span className="topbar-marquee-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Secure &amp; encrypted checkout
              </span>
              <span className="topbar-dot" aria-hidden="true">·</span>
              <span className="topbar-marquee-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
                30-day easy returns
              </span>
              <span className="topbar-dot" aria-hidden="true">·</span>
              <span className="topbar-marquee-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                Free delivery on orders over $50
              </span>
              <span className="topbar-dot" aria-hidden="true">·</span>
              <span className="topbar-marquee-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                New arrivals every week
              </span>
              <span className="topbar-dot" aria-hidden="true">·</span>
              <span className="topbar-marquee-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Secure &amp; encrypted checkout
              </span>
              <span className="topbar-dot" aria-hidden="true">·</span>
              <span className="topbar-marquee-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
                30-day easy returns
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <label className="topbar-select-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language">
                <option>English</option>
                <option>Swahili</option>
              </select>
            </label>
            <label className="topbar-select-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Currency">
                <option>USD</option>
                <option>KES</option>
                <option>EUR</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <nav className="nav-main-sticky">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo" aria-label="ShopVine home">
          <img src={logo} alt="ShopVine" className="nav-logo-img" />
        </Link>

        <div className="nav-actions">
          <form className="nav-search" onSubmit={handleSearch} role="search" aria-label="Search products">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" />
          </form>

          <Link to="/shop" className="btn btn-primary btn-sm shop-now-btn">Shop Now</Link>

          <button className="btn btn-icon btn-ghost cart-btn" onClick={() => setIsOpen(true)} aria-label="Cart" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && <span className="cart-badge">{count > 99 ? '99+' : count}</span>}
          </button>

          {isPhone && (
            <button
              className="btn btn-icon btn-ghost mobile-menu-btn"
              type="button"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(v => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? (
                  <>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </>
                ) : (
                  <>
                    <path d="M3 6h18" />
                    <path d="M3 12h18" />
                    <path d="M3 18h18" />
                  </>
                )}
              </svg>
            </button>
          )}

          {user ? (
            <div className="user-menu-wrap" ref={userMenuRef}>
              <button className="user-avatar-btn" onClick={() => setUserMenuOpen(v => !v)} type="button" aria-label="Account menu">
                <span className="avatar">{user.avatar || user.name?.[0] || 'U'}</span>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <span className="avatar">{user.avatar || user.name?.[0] || 'U'}</span>
                    <div>
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                  <Link to="/orders" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>Recent Orders</Link>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item dropdown-logout"
                    type="button"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                      navigate('/');
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
      {isPhone && menuOpen && (
        <div className="nav-mobile">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" />
            <button className="btn btn-primary btn-sm" type="submit">Go</button>
          </form>
          <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>Recent Orders</Link>
              <button type="button" onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>Recent Orders</Link>
            </>
          )}
        </div>
      )}
      </nav>
    </>
  );
}
