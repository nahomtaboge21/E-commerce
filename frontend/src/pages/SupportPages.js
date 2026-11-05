import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api';
import { getRecentOrders } from '../utils/recentOrders';
import { formatYen } from '../utils/currency';
import './SupportPages.css';

const FAQ = [
  ['送料はかかりますか？', 'いいえ。日本全国どこでも送料無料です。ご注文金額にかかわらず、追加料金は一切かかりません。'],
  ['商品はいつ届きますか？', 'ご注文確認後1〜2営業日以内に発送し、発送から5〜8日程度でお届けします。発送後、追跡番号をメールでお送りします。'],
  ['返品・返金はできますか？', 'はい。商品到着から60日以内であれば、理由を問わず返品・返金を承ります。ご注文番号を添えて info@luniva.com までご連絡ください。'],
  ['サイズが合わなかった場合は？', '商品到着から60日以内であれば、無料で1回サイズ交換を承ります。'],
  ['どのお支払い方法が使えますか？', 'クレジットカード（Visa、Mastercard、American Express、JCB）、Shop Pay、Google Pay、Apple Payをご利用いただけます。表示価格はすべて税込です。'],
  ['注文内容の変更やキャンセルはできますか？', '発送前であれば変更・キャンセルが可能です。できるだけ早く info@luniva.com までご連絡ください。'],
  ['お問い合わせ方法は？', 'info@luniva.com までご連絡ください。月曜日〜土曜日の9:00〜19:00に対応し、通常12時間以内に返信いたします。'],
];

const SHIPPING = [
  ['配送地域', '日本国内全域にお届けします（離島・一部地域を含む）。現在、海外への発送は行っておりません。'],
  ['送料', '日本全国どこでも送料無料です。ご注文金額にかかわらず、追加料金は一切かかりません。'],
  ['お届けまでの日数', 'ご注文確認後、1〜2営業日以内に発送し、発送から5〜8日程度でお届けします。繁忙期や天候・交通事情により、お届けが前後する場合があります。'],
  ['追跡番号', '発送後、ご登録のメールアドレスに追跡番号をお送りします。配送状況は「ご注文の追跡」ページからご確認いただけます。'],
  ['関税・輸入消費税', '表示価格はすべて税込です。お客様に関税や追加の税金をご請求することはありません。'],
  ['お届け先の変更・住所不備', '発送前であればお届け先の変更を承ります。発送後は変更できませんので、ご注文時に住所をご確認ください。'],
  ['商品が届かない・破損している場合', '発送から20日を過ぎても商品が届かない場合や、破損して届いた場合は info@luniva.com までご連絡ください。再送または返金で対応いたします。'],
];

const RETURNS = [
  ['60日間返金保証', '商品到着日から60日以内であれば、理由を問わず返品・返金を承ります。「思っていたものと違った」「効果を実感できなかった」という場合もお気軽にご連絡ください。'],
  ['サイズ交換無料', 'サイズが合わなかった場合は、商品到着日から60日以内であれば無料で1回サイズ交換を承ります。'],
  ['返品・交換の手順', 'ご注文番号とご希望（返金または交換）を記載のうえ、info@luniva.com までメールでご連絡ください。営業日24時間以内に、返送先と手順をご案内します。返送時の送料はお客様のご負担となります（当店の不備・初期不良の場合は当店が負担いたします）。返送品の到着確認後、5〜10営業日以内にご購入時の決済方法へ返金いたします。'],
  ['ご注意', '衛生上の理由により、明らかに使用感のある商品、破損・汚損のある商品は返品をお受けできない場合があります。セット商品の一部返品では、該当商品分の金額を返金いたします。カード会社の処理により返金の反映までお時間をいただく場合があります。初期不良・配送中の破損は、到着から7日以内に写真を添えてご連絡ください。'],
];

const PAGE_CONTENT = {
  '/faq': { title: 'よくある質問', eyebrow: 'よくあるご質問', intro: 'ご注文・配送・返品についてのよくあるご質問をまとめました。', rows: FAQ, accordion: true },
  '/shipping-policy': { title: '配送ポリシー', eyebrow: '配送について', intro: '日本全国送料無料でお届けします。', rows: SHIPPING },
  '/refund-policy': { title: '返品・返金ポリシー', eyebrow: '返品・返金について', intro: '安心してお試しいただけるよう、60日間返金保証をご用意しています。', rows: RETURNS },
  '/terms-of-service': { title: '利用規約', eyebrow: 'ご利用条件', intro: 'Lunivaが運営するオンラインストアのご利用条件です。', rows: [
    ['第1条（適用）', '本規約は、本サイトにおける商品の閲覧、ご注文、ご購入その他すべてのサービスに適用されます。'],
    ['第2条（ご注文と売買契約の成立）', 'ご注文は、本サイトの注文手続きを完了した時点で当店に送信されます。売買契約は、当店がご注文確認メールを送信した時点で成立します。在庫切れ、価格の誤表記、不正の疑いがある場合、当店はご注文をお受けできないことがあります。'],
    ['第3条（価格と支払い）', '商品価格はすべて日本円・税込で表示しています。お支払いは、本サイトで提示する決済方法（クレジットカード、Shop Pay、Google Pay 等）によりご注文時に行っていただきます。'],
    ['第4条（配送）', '配送については「配送ポリシー」に定めるとおりとします。'],
    ['第5条（返品・返金）', '返品・返金・交換については「返品・返金ポリシー」に定めるとおりとします。'],
    ['第6条（知的財産権）', '本サイトに掲載されている文章、画像、ロゴ、デザインその他のコンテンツに関する権利は、当店または正当な権利者に帰属します。無断で複製、転載、改変することを禁止します。'],
    ['第7条（禁止事項）', '虚偽の情報による注文や転売目的の購入、当店または第三者の権利を侵害する行為、本サイトの運営を妨げる行為、法令または公序良俗に反する行為を禁止します。'],
    ['第8条（免責事項）', '当店の商品は、医療機器・医薬品ではありません。効果の感じ方には個人差があります。持病をお持ちの方、妊娠中の方は、ご使用前に医師にご相談ください。当店は、法令で認められる範囲において、本サイトのご利用により生じた損害について責任を負いません。'],
    ['第9条（規約の変更）', '当店は、必要に応じて本規約を変更することがあります。変更後の規約は、本サイトに掲載した時点から効力を生じます。'],
    ['第10条（準拠法・管轄）', '本規約は日本法に準拠します。本サイトに関して紛争が生じた場合、誠実に協議のうえ解決を図るものとします。'],
    ['お問い合わせ', '本規約に関するお問い合わせは info@luniva.com までご連絡ください。'],
  ] },
  '/privacy-policy': { title: 'プライバシーポリシー', eyebrow: '個人情報の取り扱い', intro: 'Lunivaは、お客様の個人情報を適切に取り扱います。', rows: [
    ['1. 収集する情報', 'お名前、住所、電話番号、メールアドレスなどの連絡先情報、ご注文内容や購入履歴、決済に関する情報（カード番号は決済代行会社が処理し、当店では保持しません）、IPアドレス、ブラウザの種類、閲覧ページ、Cookie などの利用状況に関する情報、お問い合わせの際にご提供いただいた情報を収集することがあります。'],
    ['2. 利用目的', 'ご注文の処理、商品の発送、お支払いの確認、お問い合わせへの対応、カスタマーサポートの提供、新商品やキャンペーンのご案内、本サイトの改善、不正利用の防止、法令に基づく対応のために利用します。メール配信はいつでも停止できます。'],
    ['3. 第三者への提供', '商品の配送、決済処理、サイト運営（Shopify）など業務上必要な範囲で委託先に情報を提供する場合、広告配信・効果測定のためMeta（Facebook/Instagram）、Googleなどのサービスと情報を共有する場合、法令に基づき開示が求められた場合を除き、お客様の個人情報を第三者に提供しません。'],
    ['4. Cookie について', '本サイトでは、利便性の向上、利用状況の分析、広告配信のためにCookieを使用しています。ブラウザの設定でCookieを無効にできますが、一部の機能が利用できなくなる場合があります。'],
    ['5. 安全管理', '個人情報への不正アクセス、紛失、改ざん、漏えいを防止するため、適切な安全管理措置を講じます。本サイトはSSLにより通信を暗号化しています。'],
    ['6. 国外への移転', '本サイトはShopifyのプラットフォーム上で運営されており、お客様の情報は日本国外のサーバーで処理・保管されることがあります。'],
    ['7. お客様の権利', 'お客様は、ご自身の個人情報の開示、訂正、削除、利用停止を求めることができます。ご希望の場合は info@luniva.com までご連絡ください。'],
    ['8. 方針の変更', '本方針は、必要に応じて変更することがあります。変更後の内容は本サイトに掲載した時点から適用されます。'],
    ['お問い合わせ窓口', 'Luniva カスタマーサポート info@luniva.com'],
  ] },
};

function SupportLayout({ title, eyebrow, intro, children }) {
  return (
    <main className="support-page page">
      <div className="support-heading">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>
      <div className="container support-content">{children}</div>
      <section className="support-help">
        <div className="container support-help-inner">
          <div><span>LUNIVA SUPPORT</span><h2>ご質問はありますか？</h2><p>専門スタッフが月曜日〜土曜日 9:00〜19:00にお答えします。</p></div>
          <a className="btn btn-primary" href="mailto:info@luniva.com">info@luniva.com</a>
        </div>
      </section>
    </main>
  );
}

function OrderTracking() {
  const { user } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const recentOrders = useMemo(() => getRecentOrders(), []);

  const trackOrder = async (event) => {
    event.preventDefault();
    setMessage('');
    setResult(null);
    const term = orderNumber.trim().toLowerCase();
    if (!term) return;
    const localMatch = recentOrders.find((order) => order.id?.toLowerCase() === term || order.trackingNumber?.toLowerCase() === term);
    if (localMatch) { setResult(localMatch); return; }
    if (user) {
      try {
        const response = await ordersAPI.getAll();
        const match = response.data.find((order) => order.id?.toLowerCase() === term || order.trackingNumber?.toLowerCase() === term);
        if (match) { setResult(match); return; }
      } catch { /* Keep the customer-facing lookup message below. */ }
    }
    setMessage('追跡情報が見つかりませんでした。ご注文番号をご確認いただくか、発送案内メールをご確認ください。');
  };

  return (
    <SupportLayout title="ご注文の追跡" eyebrow="追跡サービス" intro="発送案内メールに記載の追跡番号を入力して、配送状況をご確認ください。">
      <form className="tracking-form" onSubmit={trackOrder}>
        <label htmlFor="tracking-number">追跡番号またはご注文番号</label>
        <div><input id="tracking-number" value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="例：ORD-001" /><button className="btn btn-primary" type="submit">配送状況を確認</button></div>
      </form>
      {message && <p className="tracking-message" role="status">{message}</p>}
      {result && <div className="tracking-result"><span>ご注文番号 {result.id}</span><strong>{{ processing: 'ご注文確認中', confirmed: '注文確定', shipped: '発送済み', delivered: '配達完了', cancelled: 'キャンセル' }[result.status] || result.status}</strong><p>合計 {formatYen(result.total)}</p><Link to="/orders">ご注文の詳細を見る</Link></div>}
      <p className="tracking-note">追跡番号は商品発送後にメールでお送りします。ご不明な点は <a href="mailto:info@luniva.com">info@luniva.com</a> までお問い合わせください。</p>
    </SupportLayout>
  );
}

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Luniva お問い合わせ：${form.get('name')}`);
    const body = encodeURIComponent(`お名前：${form.get('name')}\nメール：${form.get('email')}\n電話番号：${form.get('phone')}\n\n${form.get('message')}`);
    window.location.href = `mailto:info@luniva.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };
  return (
    <SupportLayout title="お問い合わせ" eyebrow="カスタマーサポート" intro="ご質問やご不安な点がございましたら、サポートチームまでお気軽にご連絡ください。">
      <div className="contact-details"><a href="mailto:info@luniva.com">info@luniva.com</a><span>受付時間：月曜日〜土曜日 9:00〜19:00</span><span>平均返信時間：12時間以内</span></div>
      <form className="contact-form" onSubmit={submit}>
        <label>お名前<input name="name" required autoComplete="name" /></label>
        <label>メールアドレス<input name="email" type="email" required autoComplete="email" /></label>
        <label>電話番号<input name="phone" type="tel" autoComplete="tel" /></label>
        <label>お問い合わせ内容<textarea name="message" rows="6" required /></label>
        <button className="btn btn-primary" type="submit">送信する</button>
        {submitted && <p role="status">メールアプリが開かない場合は info@luniva.com まで直接ご連絡ください。</p>}
      </form>
    </SupportLayout>
  );
}

export default function SupportPages() {
  const { pathname } = useLocation();
  if (pathname === '/contact') return <ContactPage />;
  if (pathname === '/track-order') return <OrderTracking />;
  const page = PAGE_CONTENT[pathname] || PAGE_CONTENT['/faq'];
  return (
    <SupportLayout title={page.title} eyebrow={page.eyebrow} intro={page.intro}>
      <div className={`support-rows${page.accordion ? ' support-faq' : ''}`}>
        {page.rows.map(([heading, body]) => page.accordion ? (
          <details key={heading}><summary>{heading}</summary><p>{body}</p></details>
        ) : (
          <section key={heading}><h2>{heading}</h2><p>{body}</p></section>
        ))}
      </div>
    </SupportLayout>
  );
}
