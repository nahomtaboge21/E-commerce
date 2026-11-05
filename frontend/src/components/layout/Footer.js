import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            Kioluna<span className="footer-dot">.</span>
          </Link>
          <p>Considered essentials for a more thoughtful everyday. Discover finds chosen for quality, comfort, and lasting use.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Discover Kioluna</h4>
            <Link to="/">Our story</Link>
            <Link to="/shop">Shop all</Link>
            <Link to="/profile">My account</Link>
          </div>

          <div className="footer-col">
            <h4>Useful links</h4>
            <Link to="/orders">Order tracking</Link>
            <Link to="/checkout">Shipping &amp; checkout</Link>
            <Link to="/orders">Returns &amp; support</Link>
            <Link to="/shop">FAQs</Link>
          </div>

          <div className="footer-col">
            <h4>Shop by category</h4>
            <Link to="/shop?category=Beauty">Beauty</Link>
            <Link to="/shop?category=Home%20%26%20Garden">Home &amp; living</Link>
            <Link to="/shop?category=Fashion">Style</Link>
            <Link to="/shop?category=Sports">Wellness</Link>
          </div>

          <div className="footer-col footer-subscribe">
            <h4>Subscribe</h4>
            <p>Get E-mail updates about our latest shop and special offers.</p>
            <form onSubmit={(e) => e.preventDefault()} className="subscribe-form">
              <input className="subscribe-input" placeholder="Enter your email here..." type="email" />
              <button className="subscribe-btn" type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Kioluna. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
