import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../api';
import ProductCard from '../components/common/ProductCard';
import fallbackProducts from '../data/products.json';
import './Shop.css';

const SORT_OPTIONS = [
  { value: 'default', label: 'おすすめ順 (Featured)' },
  { value: 'newest', label: '新着順 (Newest)' },
  { value: 'price_asc', label: '価格が安い順 (Price: Low to High)' },
  { value: 'price_desc', label: '価格が高い順 (Price: High to Low)' },
  { value: 'rating', label: '評価が高い順 (Best Rated)' },
  { value: 'reviews', label: 'レビューが多い順 (Most Reviews)' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    try {
      const res = await productsAPI.getAll({ search, category, sortBy, page, minPrice, maxPrice, featured, limit: 12 });
      setProducts(res.data.products);
      setCategories(['全商品', ...res.data.categories]);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (e) {
      let filtered = [...fallbackProducts];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
      }
      if (category && category !== '全商品') {
        filtered = filtered.filter(p => p.category === category);
      }
      if (minPrice) filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
      if (maxPrice) filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
      if (featured) filtered = filtered.filter(p => p.featured);
      setProducts(filtered);
      setCategories(['全商品', ...new Set(fallbackProducts.map(p => p.category))]);
      setTotal(filtered.length);
      setPages(1);
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

  return (
    <div className="shop page">
      <div className="shop-header-bar">
        <div className="container shop-header-inner">
          <div>
            <span className="shop-eyebrow">KIOLUNA OFFICIAL STORE</span>
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
              aria-label="絞り込み"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              絞り込み {hasFilters && <span className="filter-dot" />}
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

      <div className="container shop-body">
        {/* Filters sidebar */}
        <aside className={`shop-filters ${filtersOpen ? 'open' : ''}`}>
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
