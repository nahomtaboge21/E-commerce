import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <section className="footer-support">
          <h2>ご質問はありますか？</h2>
          <p>専門スタッフが月曜日〜土曜日の9:00〜19:00まで、商品に関するご相談やその他のお問い合わせにお答えします。</p>
          <a href="mailto:info@luniva.com">info@luniva.com</a>
        </section>

        <nav className="footer-links" aria-label="インフォメーション">
          <h2>インフォメーション</h2>
          <Link to="/faq">よくある質問</Link>
          <Link to="/contact">お問い合わせ</Link>
          <Link to="/track-order">ご注文の追跡</Link>
          <Link to="/shipping-policy">配送ポリシー</Link>
          <Link to="/refund-policy">返品・返金ポリシー</Link>
          <Link to="/terms-of-service">利用規約</Link>
          <Link to="/privacy-policy">プライバシーポリシー</Link>
          <Link to="/track-order" className="footer-track-link">注文を追跡する</Link>
        </nav>

        <section className="footer-community">
          <h2>コミュニティに参加する</h2>
          <p>新商品のお知らせ、おすすめの使い方、限定クーポンをメールでお届けします。</p>
          <form className="footer-newsletter" onSubmit={(event) => event.preventDefault()}>
            <label className="sr-only" htmlFor="luniva-newsletter-email">メール</label>
            <input id="luniva-newsletter-email" type="email" placeholder="メール" autoComplete="email" required />
            <button type="submit">登録する</button>
          </form>
        </section>
      </div>

      <div className="container footer-payment" aria-label="決済方法">
        <h2>決済方法</h2>
        <div className="payment-icons-row">
          <span className="payment-mark payment-amex" role="img" aria-label="American Express">AMERICAN<br />EXPRESS</span>
          <span className="payment-mark payment-apple" role="img" aria-label="Apple Pay">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 8.1c-1.2 0-2.2.8-3.4.8s-1.9-.8-3.3-.8C7 8.1 5 9.9 5 12.8c0 2.8 1.8 6.2 3.6 6.2.9 0 1.5-.5 2.6-.5 1 0 1.5.5 2.4.5 1.4 0 3.5-3.1 3.5-4.8-2.3-.8-2.6-4.3-.3-5.2-.4-.6-1-1-1.8-1zM14.6 6.5c.1-1.5 1.3-2.8 2.8-2.9.1 1.7-1.3 2.8-2.8 2.9z" /></svg>
            <span>Pay</span>
          </span>
          <span className="payment-mark payment-google" role="img" aria-label="Google Pay"><strong>G</strong><span>Pay</span></span>
          <span className="payment-mark payment-jcb" role="img" aria-label="JCB"><b>J</b><b>C</b><b>B</b></span>
          <span className="payment-mark payment-mastercard" role="img" aria-label="Mastercard">
            <svg viewBox="0 0 48 30" aria-hidden="true"><circle cx="18" cy="15" r="11" fill="#eb001b" /><circle cx="30" cy="15" r="11" fill="#f79e1b" fillOpacity=".95" /></svg>
          </span>
          <span className="payment-mark payment-shop" role="img" aria-label="Shop Pay">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8zM9 9V6a3 3 0 0 1 6 0v3" /><path d="M12 12v5m2-4.5c-.3-.6-.9-.9-1.7-.9-1.6 0-1.7 2.2-.1 2.4 1.6.2 1.5 2.5-.1 2.5-.8 0-1.4-.3-1.8-.9" /></svg>
            <span>Shop Pay</span>
          </span>
          <span className="payment-mark payment-visa" role="img" aria-label="Visa">VISA</span>
        </div>
      </div>
    </footer>
  );
}
