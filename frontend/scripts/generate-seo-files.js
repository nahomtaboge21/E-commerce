const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, '../build');
const productsPath = path.resolve(__dirname, '../src/data/products.json');
const configuredSiteUrl = process.env.REACT_APP_SITE_URL
  || process.env.VERCEL_PROJECT_PRODUCTION_URL
  || process.env.VERCEL_URL;
const shopifyConfigured = Boolean(process.env.REACT_APP_SHOPIFY_STORE_DOMAIN && process.env.REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN);
const indexPath = path.join(buildDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  throw new Error('CRA build output is missing; SEO files were not generated.');
}

if (!configuredSiteUrl) {
  console.warn('SEO route files and sitemap not generated: set REACT_APP_SITE_URL or deploy with Vercel production URL.');
  process.exit(0);
}

const siteUrl = new URL(/^https?:\/\//i.test(configuredSiteUrl) ? configuredSiteUrl : `https://${configuredSiteUrl}`).origin;
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const organizationId = `${siteUrl}/#organization`;
const siteId = `${siteUrl}/#website`;
const storeTitle = 'Luniva公式オンラインストア | 美容・ウェルネス・毎日のケア';
const storeDescription = '美容、ウェルネス、毎日の暮らしに役立つアイテムをお届けするLunivaの公式オンラインストアです。';
const baseSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: 'Luniva',
      url: `${siteUrl}/`,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/luniva-logo.png` },
      areaServed: { '@type': 'Country', name: 'Japan' },
      description: storeDescription,
    },
    {
      '@type': 'WebSite',
      '@id': siteId,
      url: `${siteUrl}/`,
      name: 'Luniva公式オンラインストア',
      inLanguage: 'ja-JP',
      publisher: { '@id': organizationId },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/shop?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
const escapeHtml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const escapeXml = (value) => escapeHtml(value).replace(/'/g, '&apos;');
let shell = fs.readFileSync(indexPath, 'utf8');
shell = shell.replace(/(<link[^>]*id="luniva-canonical"[^>]*href=")[^"]*(")/i, `$1${siteUrl}/$2`);
shell = shell.replace(/(<meta[^>]*property="og:url"[^>]*content=")[^"]*(")/i, `$1${siteUrl}/$2`);
shell = shell.replace(/(<meta[^>]*property="og:image"[^>]*content=")[^"]*(")/i, `$1${siteUrl}/luniva-logo.png$2`);
shell = shell.replace('</head>', `  <script>window.__LUNIVA_SITE_URL__=${safeJson(siteUrl)};</script>\n  <script id="luniva-base-structured-data" type="application/ld+json">${safeJson(baseSchema)}</script>\n</head>`);
fs.writeFileSync(indexPath, shell);

function setMeta(html, attribute, key, content) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tag = new RegExp(`<meta\\s+[^>]*${attribute}="${escapedKey}"[^>]*>`, 'gi');
  const safeContent = escapeHtml(content);
  return html.replace(tag, '').replace('</head>', `  <meta ${attribute}="${key}" content="${safeContent}" />\n</head>`);
}

function createPageHtml({ route, title, description, image, type = 'website', noIndex = false, schema }) {
  const canonical = `${siteUrl}${route}`;
  const absoluteImage = image ? (/^https?:\/\//i.test(image) ? image : `${siteUrl}${image.startsWith('/') ? '' : '/'}${image}`) : `${siteUrl}/luniva-logo.png`;
  let html = shell.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/(<link[^>]*id="luniva-canonical"[^>]*href=")[^"]*(")/i, `$1${canonical}$2`);
  html = html.replace(/(<meta[^>]*property="og:url"[^>]*content=")[^"]*(")/i, `$1${escapeHtml(canonical)}$2`);
  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'name', 'robots', noIndex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
  html = setMeta(html, 'name', 'googlebot', noIndex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
  html = setMeta(html, 'property', 'og:type', type);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'property', 'og:url', canonical);
  html = setMeta(html, 'property', 'og:image', absoluteImage);
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', description);
  html = setMeta(html, 'name', 'twitter:image', absoluteImage);
  if (schema) {
    html = html.replace('</head>', `  <script type="application/ld+json">${safeJson(schema)}</script>\n</head>`);
  }
  const outputPath = path.join(buildDir, ...route.split('/').filter(Boolean), 'index.html');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);
}

const publicPages = [
  { route: '/', title: storeTitle, description: storeDescription },
  { route: '/shop', title: `全商品一覧 | Luniva`, description: 'Lunivaの全商品一覧。美容・ウェルネス・毎日のケアに役立つ商品をカテゴリーからお選びいただけます。' },
  { route: '/faq', title: 'よくある質問 | Luniva', description: 'ご注文、配送、お支払い、返品・返金について、Lunivaのお客様からよくいただく質問をご案内します。' },
  { route: '/contact', title: 'お問い合わせ | Luniva', description: 'Lunivaへの商品やご注文に関するお問い合わせはこちら。カスタマーサポートの連絡先と受付時間をご案内します。' },
  { route: '/shipping-policy', title: '配送ポリシー | Luniva', description: 'Lunivaの配送地域、送料、発送時期、配送に関するご案内です。' },
  { route: '/refund-policy', title: '返品・返金ポリシー | Luniva', description: 'Lunivaの返品・返金条件とお手続き方法をご案内します。ご注文前に内容をご確認ください。' },
  { route: '/terms-of-service', title: '利用規約 | Luniva', description: 'Lunivaオンラインストアをご利用いただく際の利用規約をご案内します。' },
  { route: '/privacy-policy', title: 'プライバシーポリシー | Luniva', description: 'Lunivaにおける個人情報の取り扱いとプライバシーポリシーをご案内します。' },
];

for (const page of publicPages) {
  const schema = page.route === '/'
    ? { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${siteUrl}/#home`, name: page.title, description: page.description, url: `${siteUrl}/`, inLanguage: 'ja-JP', isPartOf: { '@id': siteId } }
    : null;
  createPageHtml({ ...page, schema });
}

for (const product of products) {
  const productHandle = shopifyConfigured ? `luniva-${product.id}` : String(product.id);
  const route = `/product/${encodeURIComponent(productHandle)}`;
  const title = `${product.name} | Luniva`;
  const description = String(product.description || `${product.name}。Luniva公式オンラインストアの商品詳細。`).replace(/\s+/g, ' ').slice(0, 155);
  const productUrl = `${siteUrl}${route}`;
  const availability = Number(product.stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    sku: String(product.id),
    image: product.images?.length ? product.images : [product.image].filter(Boolean),
    brand: { '@type': 'Brand', name: 'Luniva' },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'JPY',
      price: Number(product.price),
      availability,
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
  createPageHtml({ route, title, description, image: product.image, type: 'product', schema });
}

for (const route of ['/checkout', '/orders', '/profile', '/login', '/admin', '/track-order']) {
  createPageHtml({ route, title: `${route.slice(1)} | Luniva`, description: 'Lunivaのお客様向けページです。', noIndex: true });
}

const urls = [...publicPages.map((page) => page.route), ...products.map((product) => `/product/${encodeURIComponent(shopifyConfigured ? `luniva-${product.id}` : product.id)}`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((route) => `  <url><loc>${escapeXml(`${siteUrl}${route}`)}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(buildDir, 'sitemap.xml'), sitemap);

const robotsPath = path.join(buildDir, 'robots.txt');
const robots = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, 'utf8').replace(/^Sitemap:.*\r?\n?/gim, '').trimEnd() : 'User-agent: *\nAllow: /';
fs.writeFileSync(robotsPath, `${robots}\nSitemap: ${siteUrl}/sitemap.xml\n`);

const llms = [
  '# Luniva',
  '',
  '> Luniva is a Japanese-language online store for beauty, wellness, and everyday-care products.',
  '',
  '## Store information',
  '',
  '- Primary language: Japanese (Japan)',
  '- Currency: Japanese yen (JPY)',
  '- Shipping area: Japan',
  '- Customer support: Monday to Saturday, 09:00-19:00 Japan time',
  '',
  '## Key pages',
  '',
  ...publicPages.map((page) => `- [${page.title}](${siteUrl}${page.route})`),
  '',
  '## Product catalog',
  '',
  ...products.map((product) => `- [${product.name}](${siteUrl}/product/${encodeURIComponent(shopifyConfigured ? `luniva-${product.id}` : product.id)}): ${product.description} Price: JPY ${Number(product.price).toLocaleString('ja-JP')}.`),
  '',
].join('\n');
fs.writeFileSync(path.join(buildDir, 'llms.txt'), llms);

console.log(`Generated route metadata, product structured data, sitemap.xml, robots.txt, and llms.txt for ${siteUrl}.`);
