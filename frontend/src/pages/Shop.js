import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../api';
import ProductCard from '../components/common/ProductCard';
import './Shop.css';

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'reviews', label: 'Most Reviews' },
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
      setCategories(['All', ...res.data.categories]);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, category, sortBy, page, minPrice, maxPrice, featured]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

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
    setPriceFrom(''); setPriceTo('');
    setSearchParams({});
  };

  const hasFilters = category || search || minPrice || maxPrice || featured;

  return (
    <div className="shop page">
      <div className="shop-header-bar">
        <div className="container shop-header-inner">
          <div>
            <h1 className="shop-title">{search ? `Results for "${search}"` : category || 'All Products'}</h1>
            <p className="shop-count">{total} products</p>
          </div>
          <div className="shop-controls">
            <button className="btn btn-outline btn-sm filter-toggle" onClick={() => setFiltersOpen(v => !v)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters {hasFilters && <span className="filter-dot" />}
            </button>
            <select className="form-input sort-select" value={sortBy} onChange={e => setParam('sortBy', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="container shop-body" style={{ marginTop: '40px' }}>
        {/* Filters sidebar */}
        <aside className={`shop-filters ${filtersOpen ? 'open' : ''}`}>
          <div className="filters-header">
            <h3>Filters</h3>
            {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear all</button>}
          </div>

          <div className="filter-section">
            <h4>Category</h4>
            {categories.map(cat => (
              <label key={cat} className={`filter-option ${(category || 'All') === cat ? 'active' : ''}`}>
                <input type="radio" name="category" checked={(category || 'All') === cat} onChange={() => setParam('category', cat === 'All' ? '' : cat)} />
                {cat}
              </label>
            ))}
          </div>

          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-range">
              <input className="form-input" type="number" placeholder="Min $" value={priceFrom} onChange={e => setPriceFrom(e.target.value)} min="0" />
              <span>—</span>
              <input className="form-input" type="number" placeholder="Max $" value={priceTo} onChange={e => setPriceTo(e.target.value)} min="0" />
            </div>
            <button className="btn btn-outline btn-sm" style={{width:'100%', marginTop:10}} onClick={applyPrice}>Apply</button>
          </div>

          <div className="filter-section">
            <label className={`filter-option ${featured ? 'active' : ''}`}>
              <input type="checkbox" checked={!!featured} onChange={e => setParam('featured', e.target.checked ? 'true' : '')} />
              On Sale / Featured
            </label>
          </div>
        </aside>

        {/* Products */}
        <div className="shop-main">
          {loading ? (
            <div className="shop-loading">
              {[...Array(8)].map((_, i) => <div key={i} className="product-skeleton" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="shop-empty">
              <p>No products found</p>
              <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="shop-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {pages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline btn-sm" onClick={() => setParam('page', String(page - 1), true)} disabled={page <= 1}>← Prev</button>
              <div className="page-nums">
                {[...Array(pages)].map((_, i) => (
                  <button key={i} className={`page-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setParam('page', String(i+1), true)}>{i+1}</button>
                ))}
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setParam('page', String(page + 1), true)} disabled={page >= pages}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
