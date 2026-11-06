const rawDomain = process.env.REACT_APP_SHOPIFY_STORE_DOMAIN || '';
const storeDomain = rawDomain.replace(/^https?:\/\//i, '').replace(/\/$/, '');
const storefrontToken = process.env.REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const apiVersion = process.env.REACT_APP_SHOPIFY_API_VERSION || '2026-10';

export const isShopifyConfigured = Boolean(storeDomain && storefrontToken);
export const shopifyStoreUrl = storeDomain ? `https://${storeDomain}` : '';
export const shopifyAccountUrl = shopifyStoreUrl ? `${shopifyStoreUrl}/account` : '';
export const shopifyAdminUrl = shopifyStoreUrl ? `${shopifyStoreUrl}/admin` : '';

const endpoint = isShopifyConfigured
  ? `${shopifyStoreUrl}/api/${apiVersion}/graphql.json`
  : '';

async function storefrontRequest(query, variables = {}) {
  if (!isShopifyConfigured) {
    throw new Error('Shopify is not configured. Add the Shopify storefront environment variables.');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.map((error) => error.message).join('; ') || 'Shopify storefront request failed.');
  }
  return payload.data;
}

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  descriptionHtml
  productType
  tags
  createdAt
  images(first: 12) { nodes { url altText } }
  variants(first: 100) {
    nodes {
      id
      title
      availableForSale
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      selectedOptions { name value }
    }
  }
`;

const PRODUCTS_QUERY = `
  query LunivaProducts($after: String) {
    products(first: 100, after: $after) {
      nodes { ${PRODUCT_FIELDS} }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

function mapVariant(variant) {
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    price: Number(variant.price?.amount || 0),
    compareAtPrice: Number(variant.compareAtPrice?.amount || 0) || null,
    currencyCode: variant.price?.currencyCode || 'JPY',
    selectedOptions: variant.selectedOptions || [],
  };
}

function mapProduct(product) {
  const variants = (product.variants?.nodes || []).map(mapVariant);
  const selectedVariant = variants.find((variant) => variant.availableForSale) || variants[0];
  const images = (product.images?.nodes || []).map((image) => image.url).filter(Boolean);
  const tags = product.tags || [];

  return {
    id: product.handle,
    handle: product.handle,
    shopifyProductId: product.id,
    name: product.title,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    category: product.productType || tags.find((tag) => tag.toLowerCase() !== 'featured') || '',
    tags,
    featured: tags.some((tag) => tag.toLowerCase() === 'featured'),
    image: images[0] || '',
    images,
    variants,
    variantId: selectedVariant?.id || '',
    variantTitle: selectedVariant?.title || '',
    price: selectedVariant?.price || 0,
    originalPrice: selectedVariant?.compareAtPrice || null,
    currencyCode: selectedVariant?.currencyCode || 'JPY',
    stock: selectedVariant?.availableForSale ? Number.MAX_SAFE_INTEGER : 0,
    availableForSale: Boolean(selectedVariant?.availableForSale),
    createdAt: product.createdAt,
  };
}

let productCache = null;
let productCacheTime = 0;

async function loadAllProducts() {
  if (productCache && Date.now() - productCacheTime < 60_000) return productCache;

  const products = [];
  let after = null;
  let hasNextPage = true;
  while (hasNextPage) {
    const data = await storefrontRequest(PRODUCTS_QUERY, { after });
    const connection = data.products;
    products.push(...connection.nodes.map(mapProduct));
    hasNextPage = connection.pageInfo.hasNextPage;
    after = connection.pageInfo.endCursor;
  }
  productCache = products;
  productCacheTime = Date.now();
  return products;
}

export async function getShopifyProducts(params = {}) {
  let products = await loadAllProducts();
  const search = String(params.search || '').trim().toLocaleLowerCase('ja-JP');
  const category = String(params.category || '');
  const minPrice = params.minPrice === '' || params.minPrice == null ? null : Number(params.minPrice);
  const maxPrice = params.maxPrice === '' || params.maxPrice == null ? null : Number(params.maxPrice);
  const featured = String(params.featured || '').toLowerCase();

  if (search) {
    products = products.filter((product) => `${product.name} ${product.description} ${product.category} ${product.tags.join(' ')}`.toLocaleLowerCase('ja-JP').includes(search));
  }
  if (category) products = products.filter((product) => product.category === category);
  if (minPrice !== null && Number.isFinite(minPrice)) products = products.filter((product) => product.price >= minPrice);
  if (maxPrice !== null && Number.isFinite(maxPrice)) products = products.filter((product) => product.price <= maxPrice);
  if (featured) products = products.filter((product) => product.featured === (featured === 'true'));

  if (params.sortBy === 'newest') products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (params.sortBy === 'price_asc') products.sort((a, b) => a.price - b.price);
  if (params.sortBy === 'price_desc') products.sort((a, b) => b.price - a.price);

  const categories = [...new Set((await loadAllProducts()).map((product) => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ja'));
  const total = products.length;
  const limit = Math.max(1, Number(params.limit) || 12);
  const pages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.max(1, Number(params.page) || 1), pages);
  products = products.slice((page - 1) * limit, page * limit);

  return { data: { products, categories, total, pages } };
}

export async function getShopifyFeaturedProducts() {
  const result = await getShopifyProducts({ featured: true, limit: 100 });
  return { data: result.data.products };
}

export async function getShopifyProductByHandle(handle) {
  const query = `query LunivaProduct($handle: String!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`;
  const data = await storefrontRequest(query, { handle });
  if (!data.product) throw new Error('Product not found.');
  const product = mapProduct(data.product);
  return { data: product };
}

export async function createShopifyCheckout(items) {
  const lines = items.map((item) => ({
    merchandiseId: item.variantId,
    quantity: item.quantity,
  }));
  if (lines.some((line) => !line.merchandiseId)) {
    throw new Error('A Shopify product variant is missing. Refresh the product page and try again.');
  }

  const mutation = `
    mutation LunivaCreateCart($input: CartInput!) {
      cartCreate(input: $input) {
        cart { checkoutUrl }
        userErrors { field message }
      }
    }
  `;
  const data = await storefrontRequest(mutation, { input: { lines } });
  const result = data.cartCreate;
  if (result.userErrors?.length) throw new Error(result.userErrors.map((error) => error.message).join(' '));
  if (!result.cart?.checkoutUrl) throw new Error('Shopify did not return a checkout link. Please try again.');
  return result.cart.checkoutUrl;
}
