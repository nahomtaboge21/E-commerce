import heroImage from '../assets/kioluna-hero.png';
import { useSeo } from '../utils/seo';
import './Home.css';

const REVIEWS = [
  ['期待以上でした', '最近このショップを知って、すっかりリピーターになりました。試したものはどれも期待以上。大満足です。', '美咲さん（34歳・東京都）'],
  ['届くのが早かった', '注文してすぐに届き、梱包も丁寧でした。送料無料なのも嬉しいポイント。何も言うことがありません。', '由香さん（42歳・大阪府）'],
  ['やっと本当に効くものに出会えた', 'いろいろ試してもダメだったのに、ここで探していたものにやっと出会えました。違いがはっきり分かります。', '恵さん（38歳・神奈川県）'],
  ['日本の湿気でも大丈夫', '福岡の蒸し暑い夏でも品質はしっかり。本当におすすめです。', '沙織さん（46歳・福岡県）'],
  ['対応がとても丁寧', '質問したらすぐに返信があり、カスタマーサポートが本当に丁寧でした。商品も良くて、また買います。', '麻衣さん（29歳・愛知県）'],
  ['安心して買えました', 'ネットで買うのは不安でしたが、60日間の返金保証があったので思い切って購入。全く後悔していません。', '千秋さん（51歳・北海道）'],
];

const REASONS = [
  ['quality', '確かな品質', '丁寧に選び抜いた、長く使えて、約束どおりの働きをするアイテムだけを。'],
  ['results', '実感できる変化', '多くのお客様が、肌や髪、毎日の暮らしの違いを実感しています。'],
  ['guarantee', 'リスクなしでお試し', '60日間の返金保証。ご満足いただけなければ、全額返金いたします。'],
];

function BenefitIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === 'quality' && <>
        <path d="m12 3 2.3 1.4 2.7-.1 1.3 2.4 2.3 1.5-.5 2.7.5 2.7-2.3 1.5-1.3 2.4-2.7-.1L12 21l-2.3-1.4-2.7.1-1.3-2.4-2.3-1.5.5-2.7-.5-2.7 2.3-1.5 1.3-2.4 2.7.1z" />
        <path d="m9 12 2 2 4-4" />
      </>}
      {name === 'results' && <>
        <path d="M4 19h16" />
        <path d="m5 15 5-5 4 3 6-7" />
        <path d="M15 6h5v5" />
      </>}
      {name === 'guarantee' && <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </>}
    </svg>
  );
}

function ReviewCard({ review }) {
  const [title, comment, author] = review;
  return (
    <article className="review-card">
      <div className="review-stars" aria-label="5つ星評価">
        {[1, 2, 3, 4, 5].map((star) => <span key={star}>★</span>)}
      </div>
      <h3 className="review-title">{title}</h3>
      <p className="review-comment">{comment}</p>
      <div className="review-author">{author}</div>
    </article>
  );
}

export default function Home() {
  useSeo({
    title: 'Luniva公式オンラインストア | 美容・ウェルネス・毎日のケア',
    description: '美容、ウェルネス、毎日の暮らしに役立つアイテムをお届けするLunivaの公式オンラインストアです。',
    canonicalPath: '/',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Luniva公式オンラインストア',
      inLanguage: 'ja-JP',
      url: '__LUNIVA_SITE_URL__/',
    },
  });

  return (
    <div className="kioluna-home">
      <section className="kioluna-hero-section">
        <div className="kioluna-hero-copy">
          <div className="kioluna-hero-eyebrow">毎日の暮らしに、心地よさを</div>
          <h1>肌、髪、そして毎日の健やかさを支えるアイテム</h1>
          <p>シンプルで、品質が高く、実感できる結果。毎日の暮らしをもっと快適にするために選び抜きました。</p>
        </div>
        <div className="kioluna-hero-image">
          <img src={heroImage} alt="Lunivaのスキンケアと、毎日のセルフケア" />
        </div>
      </section>

      <section className="kioluna-perks-section" aria-label="Lunivaのお約束">
        <div className="kioluna-home-wrap kioluna-perks-grid">
          <div className="kioluna-perk-card">
            <span className="kioluna-perk-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
                <circle cx="7.5" cy="18" r="2" />
                <circle cx="18" cy="18" r="2" />
              </svg>
            </span>
            <span>日本全国<br />送料無料</span>
          </div>
          <div className="kioluna-perk-card">
            <span className="kioluna-perk-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <span>60日間<br />返金保証</span>
          </div>
          <div className="kioluna-perk-card">
            <span className="kioluna-perk-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="10" width="18" height="11" rx="2" />
                <path d="M7 10V7a5 5 0 0 1 10 0v3M12 14v3" />
              </svg>
            </span>
            <span>100%安全な<br />お支払い</span>
          </div>
          <div className="kioluna-perk-card">
            <span className="kioluna-perk-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />
              </svg>
            </span>
            <span>100,000人以上の<br />お客様</span>
          </div>
        </div>
      </section>

      <section className="kioluna-why-section">
        <div className="kioluna-home-wrap">
          <div className="kioluna-why-eyebrow">Lunivaが選ばれる理由</div>
          <h2>品質と実感を、シンプルに。</h2>
          <p className="kioluna-why-lead">Lunivaでは、信頼できて使いやすいアイテムだけを厳選。毎日のルーティンと健やかさを、少しずつ良くしていきます。</p>
          <div className="kioluna-why-grid">
            {REASONS.map(([icon, title, description]) => (
              <article className="kioluna-why-card" key={title}>
                <span className="kioluna-why-icon"><BenefitIcon name={icon} /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="kioluna-reviews-section">
        <div className="kioluna-reviews-heading">
          <h2>お客様の声</h2>
          <p>日本全国のお客様から、嬉しいお声をいただいています</p>
        </div>
        <div className="kioluna-reviews-row" aria-label="お客様のレビュー">
          {REVIEWS.map((review) => <ReviewCard key={review[0]} review={review} />)}
        </div>
      </section>
    </div>
  );
}
