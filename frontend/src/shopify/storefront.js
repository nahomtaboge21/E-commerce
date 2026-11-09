const rawDomain = process.env.REACT_APP_SHOPIFY_STORE_DOMAIN || '';
const storeDomain = rawDomain.replace(/^https?:\/\//i, '').replace(/\/$/, '');
const storefrontToken = process.env.REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const apiVersion = process.env.REACT_APP_SHOPIFY_API_VERSION || '2026-10';
const requestedMarketCountry = String(process.env.REACT_APP_SHOPIFY_MARKET_COUNTRY || 'JP').toUpperCase();
const marketCountry = /^[A-Z]{2}$/.test(requestedMarketCountry) ? requestedMarketCountry : 'JP';
const PRODUCT_CACHE_KEY = `luniva_shopify_catalog_${storeDomain}_${marketCountry}_v1`;
const PRODUCT_CACHE_TTL = 10 * 60 * 1000;

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

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20_000);
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Shopify took too long to respond. Check your connection and try again.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Shopify returned an unreadable response. Please try again.');
  }
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
  productType
  tags
  createdAt
  images(first: 12) {
    nodes {
      url(transform: { maxWidth: 1440, maxHeight: 1440, preferredContentType: WEBP })
      altText
    }
  }
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

const PRODUCT_SUMMARY_FIELDS = `
  id
  handle
  title
  description
  productType
  tags
  createdAt
  featuredImage {
    url(transform: { maxWidth: 800, maxHeight: 800, preferredContentType: WEBP })
    altText
  }
  selectedOrFirstAvailableVariant {
    id
    title
    availableForSale
    price { amount currencyCode }
    compareAtPrice { amount currencyCode }
    selectedOptions { name value }
  }
`;

const PRODUCTS_QUERY = `
  query LunivaProducts($after: String) @inContext(country: ${marketCountry}) {
    products(first: 100, after: $after) {
      nodes { ${PRODUCT_SUMMARY_FIELDS} }
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
  const selectedVariant = variants.find((variant) => variant.availableForSale)
    || variants[0]
    || (product.selectedOrFirstAvailableVariant ? mapVariant(product.selectedOrFirstAvailableVariant) : null);
  const images = (product.images?.nodes || []).map((image) => image.url).filter(Boolean);
  if (!images.length && product.featuredImage?.url) images.push(product.featuredImage.url);
  const tags = product.tags || [];

  return {
    id: product.handle,
    handle: product.handle,
    shopifyProductId: product.id,
    name: product.title,
    description: product.description,
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
    // Shopify validates the real inventory when the cart line is created.
    stock: selectedVariant?.availableForSale ? 99 : 0,
    availableForSale: Boolean(selectedVariant?.availableForSale),
    createdAt: product.createdAt,
  };
}

function readProductCache() {
  try {
    const cached = JSON.parse(window.localStorage.getItem(PRODUCT_CACHE_KEY) || 'null');
    if (Array.isArray(cached?.products)) {
      return { products: cached.products, time: Number(cached.time) || 0 };
    }
  } catch {
    // A browser storage failure should not keep the catalog from loading.
  }
  return { products: null, time: 0 };
}

const initialProductCache = typeof window === 'undefined' ? { products: null, time: 0 } : readProductCache();
let productCache = initialProductCache.products;
let productCacheTime = initialProductCache.time;
let productCacheRequest = null;

async function loadAllProducts() {
  if (productCache && Date.now() - productCacheTime < 60_000) return productCache;
  if (productCacheRequest) return productCacheRequest;

  productCacheRequest = (async () => {
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
    try {
      window.localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify({ products, time: productCacheTime }));
    } catch {
      // Keep the in-memory catalog when browser storage is full or disabled.
    }
    return products;
  })();

  try {
    return await productCacheRequest;
  } finally {
    productCacheRequest = null;
  }
}

export async function getShopifyProducts(params = {}) {
  let products;
  if (productCache && Date.now() - productCacheTime < PRODUCT_CACHE_TTL) {
    products = productCache;
  } else if (productCache) {
    // Serve the previous catalog right away and refresh it for the next visit.
    products = productCache;
    loadAllProducts().catch(() => undefined);
  } else {
    products = await loadAllProducts();
  }
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

  const categories = [...new Set((productCache || products).map((product) => product.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'ja'));
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
  const query = `query LunivaProduct($handle: String!) @inContext(country: ${marketCountry}) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`;
  const data = await storefrontRequest(query, { handle });
  if (!data.product) throw new Error('Product not found.');
  const product = mapProduct(data.product);
  return { data: product };
}

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  lines(first: 100) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          title
          availableForSale
          price { amount currencyCode }
          selectedOptions { name value }
          product {
            id
            handle
            title
            productType
            featuredImage {
              url(transform: { maxWidth: 240, maxHeight: 240, preferredContentType: WEBP })
              altText
            }
          }
        }
      }
    }
  }
`;

function mapCart(cart) {
  if (!cart) return null;
  const lines = cart.lines?.nodes || [];
  const items = lines.map((line) => {
    const variant = line.merchandise;
    const product = variant?.product;
    const image = product?.featuredImage?.url || '';
    return {
      id: line.id,
      lineId: line.id,
      variantId: variant?.id || '',
      variantTitle: variant?.title || '',
      selectedOptions: variant?.selectedOptions || [],
      productId: product?.handle || product?.id || '',
      name: product?.title || 'Product',
      category: product?.productType || '',
      image,
      images: image ? [image] : [],
      price: Number(variant?.price?.amount || 0),
      currencyCode: variant?.price?.currencyCode || cart.cost?.subtotalAmount?.currencyCode || 'JPY',
      quantity: Number(line.quantity || 0),
      stock: variant?.availableForSale ? 99 : 0,
    };
  });
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    items,
    total: Number(cart.cost?.subtotalAmount?.amount || 0),
    currencyCode: cart.cost?.subtotalAmount?.currencyCode || 'JPY',
  };
}

function readCartResult(result, operation) {
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((error) => error.message).join(' '));
  }
  if (!result.cart) throw new Error(`Shopify could not ${operation}. Please try again.`);
  const cart = mapCart(result.cart);
  if (!cart.checkoutUrl) throw new Error('Shopify did not return a checkout link. Check the Headless cart permissions and try again.');
  return cart;
}

export async function getShopifyCart(cartId) {
  const query = `query LunivaCart($cartId: ID!) { cart(id: $cartId) { ${CART_FIELDS} } }`;
  const data = await storefrontRequest(query, { cartId });
  const cart = mapCart(data.cart);
  if (cart && !cart.checkoutUrl) throw new Error('Shopify did not return a checkout link. Check the Headless cart permissions and try again.');
  return cart;
}

export async function createShopifyCart(lines) {
  if (!lines.length || lines.some((line) => !line.merchandiseId || !Number.isInteger(line.quantity) || line.quantity < 1)) {
    throw new Error('Choose an available Shopify variant and quantity before adding it to the cart.');
  }
  const mutation = `
    mutation LunivaCreateCart($input: CartInput!) {
      cartCreate(input: $input) {
        cart { ${CART_FIELDS} }
        userErrors { field message }
      }
    }
  `;
  const data = await storefrontRequest(mutation, {
    input: { buyerIdentity: { countryCode: marketCountry }, lines },
  });
  return readCartResult(data.cartCreate, 'create the cart');
}

export async function addShopifyCartLines(cartId, lines) {
  const mutation = `
    mutation LunivaAddCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
        userErrors { field message }
      }
    }
  `;
  const data = await storefrontRequest(mutation, { cartId, lines });
  return readCartResult(data.cartLinesAdd, 'add items to the cart');
}

export async function updateShopifyCartLines(cartId, lines) {
  const mutation = `
    mutation LunivaUpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
        userErrors { field message }
      }
    }
  `;
  const data = await storefrontRequest(mutation, { cartId, lines });
  return readCartResult(data.cartLinesUpdate, 'update the cart');
}

export async function removeShopifyCartLines(cartId, lineIds) {
  const mutation = `
    mutation LunivaRemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ${CART_FIELDS} }
        userErrors { field message }
      }
    }
  `;
  const data = await storefrontRequest(mutation, { cartId, lineIds });
  return readCartResult(data.cartLinesRemove, 'remove items from the cart');
}
