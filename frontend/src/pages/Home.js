import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api';
import ProductCard from '../components/common/ProductCard';
import './Home.css';
import homeBanner from '../assets/home-banner-new.png';

function ValueIcon({ name }) {
  const commonProps = {
    width: 28,
    height: 28,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
    focusable: 'false',
  };

  switch (name) {
    case 'shipping':
      return (
        <svg {...commonProps}>
          <path d="M3 7h11v10H3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 10h4l3 3v4h-7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="7" cy="19" r="2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17" cy="19" r="2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case 'support':
      return (
        <svg {...commonProps}>
          <path d="M4 12a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 12v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M20 12v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case 'returns':
      return (
        <svg {...commonProps}>
          <path d="M7 7H3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 7l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 17a8 8 0 0 0-14-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M3 17a8 8 0 0 0 14 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI
      .getFeatured()
      .then(res => setFeatured(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const newArrivals = useMemo(() => featured.slice(0, 10), [featured]);

  return (
    <div className="home page">
      <section className="flone-hero">
        <div className="container flone-hero-inner">
          <div className="flone-hero-media" aria-hidden="true">
            <img
              className="flone-hero-img"
              src={homeBanner}
              alt=""
              loading="eager"
            />
          </div>
          <div className="flone-hero-content">
            <div className="flone-hero-kicker">
              <span className="kicker-line" />
              <span className="kicker-text">Featured</span>
              <span className="kicker-line" />
            </div>
            <h2 className="flone-hero-title">ShopVine</h2>
            <p className="flone-hero-sub">Everyday essentials, delivered fast.</p>
            <Link to="/shop" className="btn flone-hero-btn">Shop now</Link>
          </div>
        </div>
      </section>

      <section className="flone-perks">
        <div className="container perks-inner">
          {[
            { icon: 'shipping', title: 'Free Shipping', desc: 'On all orders over $200' },
            { icon: 'support', title: 'Support 24/7', desc: 'We are here to help' },
            { icon: 'returns', title: 'Money Return', desc: '30-day money back' },
          ].map(p => (
            <div key={p.title} className="perk">
              <div className="perk-icon"><ValueIcon name={p.icon} /></div>
              <h3 className="perk-title">{p.title}</h3>
              <p className="perk-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flone-section" id="collection">
        <div className="container">
          <div className="flone-section-title">
            <h2>New Arrival</h2>
            <p>Fresh picks from our latest collection.</p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="products-grid flone-products-grid">
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
