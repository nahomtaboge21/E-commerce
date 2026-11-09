import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../api';
import ProductCard from '../components/common/ProductCard';
import fallbackProducts from '../data/products.json';
import { isShopifyConfigured } from '../shopify/storefront';
import { useSeo } from '../utils/seo';
import './Shop.css';

const SORT_OPTIONS = [
  { value: 'default', label: 'おすすめ順' },
  { value: 'newest', label: '新着順' },
  { value: 'price_asc', label: '価格の安い順' },
  { value: 'price_desc', label: '価格の高い順' },
  { value: 'rating', label: '評価の高い順' },
  { value: 'reviews', label: 'レビューの多い順' },
];

function getFallbackCatalog({ search, category, sortBy, page, minPrice, maxPrice, featured, limit }) {
  let products = [...fallbackProducts];
  const query = String(search || '').trim().toLocaleLowerCase('ja-JP');

  if (query) {
    products = products.filter((product) =>
      `${product.name} ${product.description || ''} ${product.category || ''} ${(product.tags || []).join(' ')}`
        .toLocaleLowerCase('ja-JP').includes(query));
  }
  if (category && category !== '全商品') products = products.filter((product) => product.category === category);
  if (minPrice !== '' && minPrice != null) products = products.filter((product) => product.price >= Number(minPrice));
  if (maxPrice !== '' && maxPrice != null) products = products.filter((product) => product.price <= Number(maxPrice));
  if (featured === 'true') products = products.filter((product) => product.featured);

  if (sortBy === 'newest') products.sort((a, b) => Number(b.id) - Number(a.id));
  else if (sortBy === 'price_asc') products.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price_desc') products.sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') products.sort((a, b) => b.rating - a.rating);
  else if (sortBy === 'reviews') products.sort((a, b) => b.reviews - a.reviews);
  else products.sort((a, b) => Number(b.featured) - Number(a.featured));

  const total = products.length;
  const pageSize = Math.max(1, Number(limit) || 12);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), pages);
  products = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const categories = [...new Set(fallbackProducts.map((product) => product.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'ja'));

  return { products, categories, total, pages };
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth > 960);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'default';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const featured = searchParams.get('featured') || '';

  const [priceFrom, setPriceFrom] = useState(minPrice);
  const [priceTo, setPriceTo] = useState(maxPrice);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      if (!isShopifyConfigured && process.env.NODE_ENV === 'production') {
        const data = getFallbackCatalog({ search, category, sortBy, page, minPrice, maxPrice, featured, limit: 12 });
        setProducts(data.products);
        setCategories(['全商品', ...data.categories]);
        setTotal(data.total);
        setPages(data.pages);
        return;
      }

      const res = await productsAPI.getAll({ search, category, sortBy, page, minPrice, maxPrice, featured, limit: 12 });
      setProducts(res.data.products);
      setCategories(['全商品', ...res.data.categories]);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (e) {
      if (isShopifyConfigured) {
        setProducts([]);
        setCategories([]);
        setTotal(0);
        setPages(1);
        setLoadError('Shopifyの商品を読み込めませんでした。設定と公開状態を確認して、もう一度お試しください。');
        return;
      }
      const data = getFallbackCatalog({ search, category, sortBy, page, minPrice, maxPrice, featured, limit: 12 });
      setProducts(data.products);
      setCategories(['全商品', ...data.categories]);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy, page, minPrice, maxPrice, featured]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const setParam = (key, val, keepPage = false) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    if (!keepPage) p.delete('page');
    setSearchParams(p);
  };

  const applyPrice = () => {
    const p = new URLSearchParams(searchParams);
    if (priceFrom) p.set('minPrice', priceFrom); else p.delete('minPrice');
    if (priceTo) p.set('maxPrice', priceTo); else p.delete('maxPrice');
    p.delete('page');
    setSearchParams(p);
  };

  const clearFilters = () => {
    setPriceFrom('');
    setPriceTo('');
    setSearchParams({});
  };

  const hasFilters = category || search || minPrice || maxPrice || featured;
  const hasQueryFilters = search || minPrice || maxPrice || featured || sortBy !== 'default' || page > 1;
  const shopTitle = search ? `「${search}」の検索結果 | Luniva` : category ? `${category}の商品一覧 | Luniva` : '全商品一覧 | Luniva';
  useSeo({
    title: shopTitle,
    description: search
      ? `「${search}」に関連するLunivaの商品をご覧いただけます。`
      : category
        ? `${category}のおすすめ商品をLuniva公式オンラインストアでご覧いただけます。`
        : 'Lunivaの全商品一覧。美容・ウェルネス・毎日のケアに役立つ商品をカテゴリーからお選びいただけます。',
    canonicalPath: category && !hasQueryFilters ? `/shop?category=${encodeURIComponent(category)}` : '/shop',
    noIndex: Boolean(hasQueryFilters),
  });

  return (
    <div className="shop page">
      <div className="shop-header-bar">
        <div className="container shop-header-inner">
          <div>
            <span className="shop-eyebrow">Luniva 公式オンラインストア</span>
            <h1 className="shop-title">
              {search ? `「${search}」の検索結果` : category || '全商品コレクション'}
            </h1>
            <p className="shop-count">
              全 {total} 件の商品 · 日本全国送料無料 · 60日間返金保証
            </p>
          </div>
          <div className="shop-controls">
            <button
              className="btn btn-outline btn-sm filter-toggle"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-label={filtersOpen ? '絞り込みを閉じる' : '絞り込み'}
              aria-expanded={filtersOpen}
              aria-controls="shop-filters"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {filtersOpen ? '絞り込みを閉じる' : '絞り込み'} {hasFilters && <span className="filter-dot" />}
            </button>
            <select
              className="form-input sort-select"
              value={sortBy}
              onChange={(e) => setParam('sortBy', e.target.value)}
              aria-label="並び替え"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={`container shop-body ${filtersOpen ? 'filters-open' : 'filters-closed'}`}>
        {/* Filters sidebar */}
        <aside id="shop-filters" className={`shop-filters ${filtersOpen ? 'open' : ''}`}>
          <div className="filters-header">
            <h3>絞り込み条件</h3>
            {hasFilters && (
              <button className="btn btn-ghost btn-sm clear-filters-btn" onClick={clearFilters}>
                条件をクリア
              </button>
            )}
          </div>

          <div className="filter-section">
            <h4>カテゴリー</h4>
            {categories.map((cat) => {
              const isActive = (!category && cat === '全商品') || category === cat;
              return (
                <label key={cat} className={`filter-option ${isActive ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={isActive}
                    onChange={() => setParam('category', cat === '全商品' ? '' : cat)}
                  />
                  <span>{cat}</span>
                </label>
              );
            })}
          </div>

          <div className="filter-section">
            <h4>価格帯 (JPY)</h4>
            <div className="price-range">
              <input
                className="form-input"
                type="number"
                placeholder="¥ 最小"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                min="0"
              />
              <span>〜</span>
              <input
                className="form-input"
                type="number"
                placeholder="¥ 最大"
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
                min="0"
              />
            </div>
            <button className="btn btn-outline btn-sm apply-price-btn" onClick={applyPrice}>
              価格を適用
            </button>
          </div>

          <div className="filter-section">
            <h4>特別条件</h4>
            <label className={`filter-option ${featured ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={!!featured}
                onChange={(e) => setParam('featured', e.target.checked ? 'true' : '')}
              />
              <span>人気商品 / セール品</span>
            </label>
          </div>

          <div className="filter-guarantee-box">
            <span className="guarantee-icon">🛡️</span>
            <div>
              <strong>全品60日間返金保証</strong>
              <p>日本全国どこでも送料無料でお届けします。</p>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="shop-main">
          {loading ? (
            <div className="shop-loading">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-skeleton" />
              ))}
            </div>
          ) : loadError ? (
            <div className="shop-empty">
              <p>{loadError}</p>
              <button className="btn btn-outline" onClick={fetchProducts}>再読み込み</button>
            </div>
          ) : products.length === 0 ? (
            <div className="shop-empty">
              <p>該当する商品が見つかりませんでした。</p>
              <button className="btn btn-outline" onClick={clearFilters}>
                条件をクリアして全商品を見る
              </button>
            </div>
          ) : (
            <div className="shop-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setParam('page', String(page - 1), true)}
                disabled={page <= 1}
              >
                ← 前へ
              </button>
              <div className="page-nums">
                {[...Array(pages)].map((_, i) => (
                  <button
                    key={i}
                    className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                    onClick={() => setParam('page', String(i + 1), true)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setParam('page', String(page + 1), true)}
                disabled={page >= pages}
              >
                次へ →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
