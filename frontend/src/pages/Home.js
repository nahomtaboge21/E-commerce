import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api';
import ProductCard from '../components/common/ProductCard';
import fallbackProducts from '../data/products.json';
import './Home.css';
import kiolunaHero from '../assets/kioluna-hero.png';

const PERKS = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: '日本全国送料無料',
    desc: 'ご購入金額に関わらず、全国どこでも送料無料でお届けします。',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: '60日間返金保証',
    desc: '万が一ご満足いただけない場合も全額返金対応。安心してお試しいただけます。',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
      </svg>
    ),
    title: '確かな品質と実感',
    desc: '肌・髪・暮らしを支えるため、厳選された素材と処方のみを採用しています。',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    title: '安心のサポート体制',
    desc: '月曜〜土曜 9:00〜19:00、専門スタッフが丁寧にお問い合わせに対応します。',
  },
];

const REVIEWS = [
  {
    name: '美咲 さん',
    age: '34歳・東京都',
    product: '一晩リセット マイクロニードル アイパッチ',
    rating: 5,
    title: '期待以上でした！朝の目元がふっくら',
    comment:
      '仕事でPC画面を一日中見ているため目元の乾燥やクマが気になっていました。寝る前に貼るだけでチクチク心地よく、翌朝剥がした瞬間のふっくら感に驚きました。リピート決定です！',
  },
  {
    name: '由香 さん',
    age: '42歳・大阪府',
    product: '360°シェイプショーツ',
    rating: 5,
    title: '苦しくないのにしっかり細見え',
    comment:
      '今まで色んな補正下着を試しては締め付けで諦めていましたが、このショーツは一日中履いていても苦しくなく、お腹周りがすっきり引き締まります。送料無料なのも助かります。',
  },
  {
    name: '恵 さん',
    age: '38歳・神奈川県',
    product: 'ローズマリー育毛シャンプー',
    rating: 5,
    title: '頭皮がすっきりして髪にコシが出ました',
    comment:
      'オーガニックな香りがとても心地よく、バスタイムが楽しみになりました。洗い上がりの頭皮が軽やかで、ブロー後の根元の立ち上がりが全然違います。母にもプレゼントしました。',
  },
  {
    name: '千秋 さん',
    age: '51歳・北海道',
    product: '磁気ケアリング ゴールド',
    rating: 5,
    title: '60日間返金保証のおかげで安心して購入できました',
    comment:
      'ネット通販での購入は少し不安でしたが、返金保証があったので注文。上品なゴールドで普段使いのリングとして身につけられ、手元の冷えやだるさが和らぎました。',
  },
];

function ReviewCard({ review }) {
  const [title, comment, author] = review;
  return (
    <article className="review-card">
      <div className="review-stars" aria-label="5つ星評価">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>★</span>
        ))}
      </div>
      <h3 className="review-title">{title}</h3>
      <p className="review-comment">{comment}</p>
      <div className="review-author">{author}</div>
    </article>
  );
}

  useEffect(() => {
    productsAPI
      .getAll({ limit: 12 })
      .then((res) => {
        setProducts(res.data.products || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const [products, setProducts] = useState(fallbackProducts);

  useEffect(() => {
    productsAPI
      .getAll({ limit: 8 })
      .then((res) => {
        if (res.data?.products?.length) {
          setProducts(res.data.products);
        }
      })
      .catch(() => {
        // Keeps fallbackProducts if backend isn't reachable
      });
  }, []);

  return (
    <div className="home page">
      {/* ── Kioluna Hero Section ─────────────────────────────────── */}
      {/* ── Hero Section ── */}
      <section className="kioluna-hero-section">
        <div className="kioluna-hero-copy">
          <div className="kioluna-hero-eyebrow">毎日の暮らしに、心地よさを</div>
          <h1>肌、髪、そして毎日の健やかさを支えるアイテム</h1>
          <p>
            シンプルで、品質が高く、実感できる結果。<br />
            毎日の暮らしをもっと快適にするために選び抜きました。
          </p>
          <div className="kioluna-hero-buttons">
            <Link to="/shop" className="btn btn-primary btn-lg">
              全商品を見る
            </Link>
            <Link to="/faq" className="btn btn-outline btn-lg">
              よくある質問
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4 Pillars of Kioluna (Trust Perks) ──────────────────────── */}
      <section className="kioluna-perks-section">
        <div className="container">
          <div className="kioluna-perks-grid">
            {PERKS.map((perk, i) => (
              <div key={i} className="kioluna-perk-card">
                <div className="kioluna-perk-icon">{perk.icon}</div>
                <h3 className="kioluna-perk-title">{perk.title}</h3>
                <p className="kioluna-perk-desc">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Perks / Trust Highlights ── */}
      <section className="kioluna-perks-section" aria-label="Kiolunaのお約束">
        <div className="kioluna-home-wrap kioluna-perks-grid">
          <div className="kioluna-perk-card">
            <span className="kioluna-perk-icon">🚚</span>
            <span>
              日本全国<br />送料無料
            </span>
          </div>
          <div className="kioluna-perk-card">
            <span className="kioluna-perk-icon">🛡️</span>
            <span>
              60日間<br />返金保証
            </span>
          </div>
          <div className="kioluna-perk-card">
            <span className="kioluna-perk-icon">🔒</span>
            <span>
              100%安全な<br />お支払い
            </span>
          </div>
          <div className="kioluna-perk-card">
            <span className="kioluna-perk-icon">⭐</span>
            <span>
              100,000人以上の<br />お客様
            </span>
          </div>
        </div>
      </section>

      {/* ── Featured Bestsellers Collection ── */}
      <section className="kioluna-featured-section">
        <div className="kioluna-home-wrap">
          <div className="kioluna-featured-heading">
            <span className="kioluna-why-eyebrow">POPULAR ITEMS</span>
            <h2>人気のおすすめアイテム</h2>
            <p>多くのお客様に選ばれている、Kiolunaのベストセラー</p>
          </div>
          <div className="kioluna-featured-grid">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="kioluna-featured-cta">
            <Link to="/shop" className="btn btn-primary btn-lg">
              すべての商品（{products.length}点）を見る
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Kioluna? ── */}
      {/* ── Bestseller Products Grid ────────────────────────────────── */}
      <section className="kioluna-products-section" id="bestsellers">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">BESTSELLERS</span>
            <h2 className="section-title">人気アイテムランキング</h2>
            <p className="section-subtitle">多くのお客様から愛されているKiolunaの実力派商品</p>
          </div>

          {loading ? (
            <div className="products-loading">
              <div className="spinner" />
            </div>
          ) : (
            <div className="products-grid">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="section-footer-cta">
            <Link to="/shop" className="btn btn-primary btn-lg">
              すべての商品（{products.length}点）を見る
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Kioluna? (選ばれる理由) ─────────────────────────────── */}
      <section className="kioluna-why-section">
        <div className="kioluna-home-wrap">
          <div className="kioluna-why-eyebrow">Kiolunaが選ばれる理由</div>
          <h2>品質と実感を、シンプルに。</h2>
          <p className="kioluna-why-lead">
            Kiolunaでは、信頼できて使いやすいアイテムだけを厳選。毎日のルーティンと健やかさを、少しずつ良くしていきます。
          </p>
          <div className="kioluna-why-grid">
            {REASONS.map(([icon, title, description]) => (
              <article className="kioluna-why-card" key={title}>
                <span className="kioluna-why-icon" aria-hidden="true">
                  {icon}
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Real Customer Reviews ── */}
      {/* ── Customer Reviews (お客様の声) ───────────────────────────── */}
      <section className="kioluna-reviews-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">REAL REVIEWS</span>
            <h2 className="section-title">ご愛用者様からのリアルな声</h2>
            <p className="section-subtitle">
              全国のお客様から届いた嬉しいお声をご紹介します
            </p>
          </div>

          <div className="reviews-grid">
            {REVIEWS.map((rev, i) => (
              <div key={i} className="review-card">
                <div className="review-stars">
                  {'★'.repeat(rev.rating)}
                </div>
                <h4 className="review-title">「{rev.title}」</h4>
                <p className="review-comment">{rev.comment}</p>
                <div className="review-footer">
                  <div className="review-author">
                    <strong>{rev.name}</strong>
                    <span>{rev.age}</span>
                  </div>
                  <span className="review-product-tag">{rev.product}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="kioluna-reviews-row" aria-label="お客様のレビュー">
          {REVIEWS.map((review) => (
            <ReviewCard key={review[0]} review={review} />
          ))}
        </div>
      </section>

      {/* ── Anti-Counterfeit Notice ── */}
      <section className="kioluna-notice-section">
        <div className="kioluna-home-wrap">
          <div className="kioluna-notice-card">
            <span className="kioluna-notice-badge">公式ストア限定</span>
            <h3>模倣品・類似品にご注意ください</h3>
            <p>
              Kioluna（キオルナ）の正規品は、当公式オンラインストア（<strong>kioluna.com</strong>）でのみ販売しております。
              Amazon、楽天市場、Yahoo!ショッピング、Qoo10、Temu等の他社ECモールでの並行輸入品・類似品・模倣品は、品質や安全性の保証、ならびに「60日間返金保証」の対象外となりますので十分ご注意ください。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}