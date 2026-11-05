import { Link } from 'react-router-dom';
import kiolunaLogo from '../../assets/kioluna-logo.png';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="kioluna-footer">
      <div className="container footer-inner">
        <section className="footer-support">
          <h2>ご質問はありますか？</h2>
          <p>専門スタッフが月曜日〜土曜日の9:00〜19:00まで、商品に関するご相談やその他のお問い合わせにお答えします。</p>
          <a href="mailto:info@kioluna.com">info@kioluna.com</a>
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
            <label className="sr-only" htmlFor="kioluna-newsletter-email">メール</label>
            <input id="kioluna-newsletter-email" type="email" placeholder="メール" autoComplete="email" required />
            <button type="submit">登録する</button>
          </form>
        </section>
      </div>

      <div className="container footer-payment" aria-label="決済方法">
        <span>決済方法</span>
        <div className="payment-icons-row">
          <span className="pay-tag">American Express</span>
          <span className="pay-tag">Apple Pay</span>
          <span className="pay-tag">Google Pay</span>
          <span className="pay-tag">JCB</span>
          <span className="pay-tag">Mastercard</span>
          <span className="pay-tag">Shop Pay</span>
          <span className="pay-tag">Visa</span>
        </div>
      </div>

      <div className="footer-wordmark-wrap">
        <Link to="/" aria-label="Kioluna ホーム">
          <img className="footer-wordmark-img" src={kiolunaLogo} alt="Kioluna" />
        </Link>
      </div>
    </footer>
  );
}
