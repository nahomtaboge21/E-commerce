import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import lunivaLogo from '../../assets/luniva-logo.png';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count, setIsOpen } = useCart();

  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isPhone, setIsPhone] = useState(() => window.innerWidth <= 840);

  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
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
      const nextIsPhone = window.innerWidth <= 840;
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
    setSearchOpen(false);
  };

  return (
    <header className="site-header">
      {/* Top Announcement Bar */}
      <div className="nav-topbar">
        <div className="container topbar-inner">
          <div className="topbar-marquee-wrap" aria-label="Lunivaのお知らせ">
            <div className="topbar-marquee">
              <span className="topbar-marquee-item">100,000人以上のお客様にご愛用いただいています</span>
              <span className="topbar-dot" aria-hidden="true">|</span>
              <span className="topbar-marquee-item">送料無料 | 60日間返金保証</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="nav-main-sticky">
        <div className="container nav-inner">
          <Link to="/" className="nav-logo" aria-label="Luniva ホーム">
            <img
              src={lunivaLogo}
              alt="Luniva"
              className="nav-logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'inline-block';
              }}
            />
            <span className="nav-brand-fallback" style={{ display: 'none' }}>
              Luniva
            </span>
          </Link>

          <div className="nav-primary-links" aria-label="メインナビゲーション">
            <Link to="/">ホーム</Link>
            <Link to="/shop">全商品</Link>
            <Link to="/faq">よくある質問</Link>
            <Link to="/contact">お問い合わせ</Link>
          </div>

          <div className="nav-actions">
            {searchOpen ? (
              <form className="nav-search open" onSubmit={handleSearch} role="search" aria-label="商品を検索">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="商品を検索..." aria-label="検索キーワード" />
                <button type="button" className="search-close" onClick={() => { setSearchOpen(false); setSearch(''); }} aria-label="検索を閉じる">×</button>
              </form>
            ) : (
              <button type="button" className="btn btn-icon btn-ghost nav-search-toggle" onClick={() => setSearchOpen(true)} aria-label="商品を検索">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            )}

            <button
              className="btn btn-icon btn-ghost cart-btn"
              onClick={() => setIsOpen(true)}
              aria-label="買い物かご"
              type="button"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {count > 0 && <span className="cart-badge">{count > 99 ? '99+' : count}</span>}
            </button>

            {user ? (
              <div className="user-menu-wrap" ref={userMenuRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setUserMenuOpen(v => !v)}
                  type="button"
                  aria-label="アカウントメニュー"
                >
                  <span className="avatar">{user.avatar || user.name?.[0] || 'K'}</span>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <span className="avatar">{user.avatar || user.name?.[0] || 'K'}</span>
                      <div>
                        <p className="dropdown-name">{user.name}</p>
                        <p className="dropdown-email">{user.email}</p>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>マイアカウント</Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>注文履歴・追跡</Link>
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item dropdown-admin" onClick={() => setUserMenuOpen(false)}>
                        管理者ダッシュボード
                      </Link>
                    )}
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
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-ghost btn-sm login-link" aria-label="ログイン">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}

            {isPhone && (
              <button
                className="btn btn-icon btn-ghost mobile-menu-btn"
                type="button"
                aria-label="メニュー"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(v => !v)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {menuOpen ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isPhone && menuOpen && (
          <div className="nav-mobile">
            <form className="mobile-search" onSubmit={handleSearch}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="商品を検索..."
              />
              <button className="btn btn-primary btn-sm" type="submit">検索</button>
            </form>
            <div className="mobile-nav-links">
              <Link to="/" onClick={() => setMenuOpen(false)}>ホーム</Link>
              <Link to="/shop" onClick={() => setMenuOpen(false)}>全商品を見る</Link>
              <Link to="/faq" onClick={() => setMenuOpen(false)}>よくある質問</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)}>お問い合わせ</Link>
              <Link to="/track-order" onClick={() => setMenuOpen(false)}>ご注文の追跡</Link>
            </div>
            <div className="mobile-nav-footer">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>マイアカウント ({user.name})</Link>
                  <button type="button" onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}>ログアウト</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn btn-outline btn-sm">ログイン / 会員登録</Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
