import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            ShopVine<span className="footer-dot">.</span>
          </Link>
          <p>Simple shopping, fast shipping, easy returns.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>About us</h4>
            <Link to="/">About us</Link>
            <a href="#">Store location</a>
            <a href="#">Contact</a>
          </div>

          <div className="footer-col">
            <h4>Useful links</h4>
            <a href="#">Returns</a>
            <a href="#">Support Policy</a>
            <a href="#">Size guide</a>
            <a href="#">FAQs</a>
          </div>

          <div className="footer-col">
            <h4>Follow us</h4>
            <a href="#">Facebook</a>
            <a href="#">Twitter</a>
            <a href="#">Instagram</a>
            <a href="#">YouTube</a>
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
          <p>© {new Date().getFullYear()} ShopVine. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
