import heroImage from '../assets/kioluna-hero.png';
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
  ['✨', '確かな品質', '丁寧に選び抜いた、長く使えて、約束どおりの働きをするアイテムだけを。'],
  ['💚', '実感できる変化', '多くのお客様が、肌や髪、毎日の暮らしの違いを実感しています。'],
  ['🛡️', 'リスクなしでお試し', '60日間の返金保証。ご満足いただけなければ、全額返金いたします。'],
];

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
  return (
    <div className="kioluna-home">
      <section className="kioluna-hero-section">
        <div className="kioluna-hero-copy">
          <div className="kioluna-hero-eyebrow">毎日の暮らしに、心地よさを</div>
          <h1>肌、髪、そして毎日の健やかさを支えるアイテム</h1>
          <p>シンプルで、品質が高く、実感できる結果。毎日の暮らしをもっと快適にするために選び抜きました。</p>
        </div>
        <div className="kioluna-hero-image">
          <img src={heroImage} alt="Kiolunaのスキンケアと、毎日のセルフケア" />
        </div>
      </section>

      <section className="kioluna-perks-section" aria-label="Kiolunaのお約束">
        <div className="kioluna-home-wrap kioluna-perks-grid">
          <div className="kioluna-perk-card"><span className="kioluna-perk-icon">🚚</span><span>日本全国<br />送料無料</span></div>
          <div className="kioluna-perk-card"><span className="kioluna-perk-icon">🛡️</span><span>60日間<br />返金保証</span></div>
          <div className="kioluna-perk-card"><span className="kioluna-perk-icon">🔒</span><span>100%安全な<br />お支払い</span></div>
          <div className="kioluna-perk-card"><span className="kioluna-perk-icon">⭐</span><span>100,000人以上の<br />お客様</span></div>
        </div>
      </section>

      <section className="kioluna-why-section">
        <div className="kioluna-home-wrap">
          <div className="kioluna-why-eyebrow">Kiolunaが選ばれる理由</div>
          <h2>品質と実感を、シンプルに。</h2>
          <p className="kioluna-why-lead">Kiolunaでは、信頼できて使いやすいアイテムだけを厳選。毎日のルーティンと健やかさを、少しずつ良くしていきます。</p>
          <div className="kioluna-why-grid">
            {REASONS.map(([icon, title, description]) => (
              <article className="kioluna-why-card" key={title}>
                <span className="kioluna-why-icon" aria-hidden="true">{icon}</span>
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
