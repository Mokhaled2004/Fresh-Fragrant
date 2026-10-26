"use client";

import { useMemo, useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Filter, Search, X, PanelLeftClose, PanelLeftOpen, Check, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import CatalogSidebar from './CatalogSidebar';
import ShopProductCard from './ShopProductCard';

const keyLabel = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^./, (l) => l.toUpperCase());
const attributeValue = (value: unknown) => Array.isArray(value) ? value.map(String) : value == null || typeof value === 'object' ? [] : [String(value)];

const facetValues = (products: any[], source: 'product' | 'variant') => {
  const result = new Map<string, Set<string>>();
  for (const product of products) {
    const records = source === 'product' ? [product.metadata] : product.variants.map((v: any) => v.metadata);
    for (const record of records) if (record) for (const [key, value] of Object.entries(record)) {
      const values = result.get(key) ?? new Set<string>();
      attributeValue(value).forEach((entry) => values.add(entry));
      result.set(key, values);
    }
  }
  return [...result.entries()].filter(([, values]) => values.size > 1).sort(([a], [b]) => a.localeCompare(b)).map(([key, values]) => ({ key, values: [...values].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) }));
};

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name' },
];

export default function ShopCatalog({ products, categories, initialCategory, initialSale, offeredProductIds }: any) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [stock, setStock] = useState<'all' | 'in' | 'out'>('all');
  const [featured, setFeatured] = useState(false);
  const [sale, setSale] = useState(initialSale);
  const [minimumRating, setMinimumRating] = useState(0);
  const [productFacets, setProductFacets] = useState<Record<string, string[]>>({});
  const [variantFacets, setVariantFacets] = useState<Record<string, string[]>>({});
  
  const [sort, setSort] = useState('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const sortTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [mobileFilters, setMobileFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarWrapperRef = useRef<HTMLDivElement>(null);

  // Sidebar animation
  useEffect(() => {
    if (!sidebarWrapperRef.current) return;
    if (isSidebarOpen) {
      gsap.to(sidebarWrapperRef.current, { width: "280px", opacity: 1, duration: 0.4, ease: "power3.out" });
    } else {
      gsap.to(sidebarWrapperRef.current, { width: "0px", opacity: 0, duration: 0.4, ease: "power3.inOut" });
    }
  }, [isSidebarOpen]);

  // Sort Dropdown animation
  useEffect(() => {
    if (!sortDropdownRef.current) return;
    if (isSortOpen) {
      gsap.to(sortDropdownRef.current, { y: 0, opacity: 1, pointerEvents: "auto", duration: 0.3, ease: "power3.out" });
    } else {
      gsap.to(sortDropdownRef.current, { y: 10, opacity: 0, pointerEvents: "none", duration: 0.2, ease: "power3.in" });
    }
  }, [isSortOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        // If the click is outside the dropdown container, close it
        const dropdownContainer = sortDropdownRef.current.parentElement;
        if (dropdownContainer && !dropdownContainer.contains(event.target as Node)) {
          setIsSortOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSortEnter = () => {
    // Only trigger hover on desktop screens (larger than 768px)
    if (window.innerWidth >= 768) {
      if (sortTimeoutRef.current) clearTimeout(sortTimeoutRef.current);
      setIsSortOpen(true);
    }
  };

  const handleSortLeave = () => {
    // Only trigger hover out on desktop
    if (window.innerWidth >= 768) {
      sortTimeoutRef.current = setTimeout(() => {
        setIsSortOpen(false);
      }, 150);
    }
  };

  const toggleSortDropdown = () => {
    // Click toggle for mobile (or desktop)
    setIsSortOpen(!isSortOpen);
  };

  const productOptions = useMemo(() => facetValues(products, 'product'), [products]);
  const variantOptions = useMemo(() => facetValues(products, 'variant'), [products]);
  
  const result = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const filtered = products.filter((item: any) => {
      const variantSkus = item.variants.map((v: any) => v.sku).join(' ');
      const matchesQuery = !query || [item.name, item.sku, item.description ?? '', variantSkus].join(' ').toLocaleLowerCase().includes(query);
      const matchesCategory = !category || item.categoryId === category || item.categorySlug === category || item.categoryName?.toLocaleLowerCase() === category.toLocaleLowerCase();
      const price = Number(item.price);
      const weights = [item.weight, ...item.variants.map((v: any) => v.metadata?.weight)].filter((v) => v != null).map(Number).filter(Number.isFinite);
      const minW = minWeight === '' ? -Infinity : Number(minWeight), maxW = maxWeight === '' ? Infinity : Number(maxWeight);
      const matchesWeight = (!minWeight && !maxWeight) || (weights.length > 0 && Math.max(...weights) >= minW && Math.min(...weights) <= maxW);
      const matchesStock = stock === 'all' || (stock === 'in' ? item.stock > 0 || item.variants.some((v: any) => v.stock > 0) : item.stock <= 0 && item.variants.every((v: any) => v.stock <= 0));
      const matchesSale = !sale || (item.compareAtPrice != null && Number(item.compareAtPrice) > price) || offeredProductIds.includes(item.id);
      const matchesRating = !minimumRating || Number(item.rating ?? 0) >= minimumRating;
      const matchesProductFacets = Object.entries(productFacets).every(([key, selected]) => !selected.length || selected.some((value) => attributeValue(item.metadata?.[key]).includes(value)));
      const matchesVariantFacets = Object.entries(variantFacets).every(([key, selected]) => !selected.length || item.variants.some((v: any) => selected.some((value) => attributeValue(v.metadata?.[key]).includes(value))));
      return matchesQuery && matchesCategory && price >= (minPrice === '' ? -Infinity : Number(minPrice)) && price <= (maxPrice === '' ? Infinity : Number(maxPrice)) && matchesWeight && matchesStock && (!featured || item.isFeatured) && matchesSale && matchesRating && matchesProductFacets && matchesVariantFacets;
    });
    
    return filtered.sort((a: any, b: any) => 
      sort === 'price-low' ? Number(a.price) - Number(b.price) : 
      sort === 'price-high' ? Number(b.price) - Number(a.price) : 
      sort === 'name' ? a.name.localeCompare(b.name) : 
      sort === 'rating' ? Number(b.rating ?? 0) - Number(a.rating ?? 0) : 
      sort === 'newest' ? b.createdAt.localeCompare(a.createdAt) : 
      Number(b.isFeatured) - Number(a.isFeatured) || b.createdAt.localeCompare(a.createdAt)
    );
  }, [products, offeredProductIds, search, category, minPrice, maxPrice, minWeight, maxWeight, stock, featured, sale, minimumRating, productFacets, variantFacets, sort]);

  const activeCount = Number(!!search) + Number(!!category) + Number(!!minPrice || !!maxPrice) + Number(!!minWeight || !!maxWeight) + Number(stock !== 'all') + Number(featured) + Number(sale) + Number(!!minimumRating) + Object.values(productFacets).flat().length + Object.values(variantFacets).flat().length;
  
  const clearAll = () => { setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setMinWeight(''); setMaxWeight(''); setStock('all'); setFeatured(false); setSale(false); setMinimumRating(0); setProductFacets({}); setVariantFacets({}); };
  
  const toggleFacet = (type: 'product'|'variant', key: string, value: string) => {
    if (type === 'product') {
      const current = productFacets[key] || [];
      setProductFacets({ ...productFacets, [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
    } else {
      const current = variantFacets[key] || [];
      setVariantFacets({ ...variantFacets, [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
    }
  };

  const sidebarProps = {
    search, setSearch, category, setCategory, categories, minPrice, setMinPrice, maxPrice, setMaxPrice, minWeight, setMinWeight, maxWeight, setMaxWeight,
    hasWeights: products.some((item: any) => item.weight != null), stock, setStock, featured, setFeatured, sale, setSale, minimumRating, setMinimumRating,
    activeCount, clearAll, productOptions, productFacets, variantOptions, variantFacets, toggleFacet, keyLabel
  };

  return (
    <section className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 py-10">
      
      {/* Top Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--theme-border)] pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex items-center gap-2 text-[13px] font-medium text-[var(--theme-text)] hover:text-[var(--theme-accent)] transition-colors"
          >
            {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            {isSidebarOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <div className="text-[13px] text-[var(--theme-muted)] hidden sm:block">
            <span className="font-bold text-[var(--theme-text)]">{result.length}</span> {result.length === 1 ? 'style' : 'styles'} available
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setMobileFilters(true)} className="inline-flex items-center gap-2 rounded-full border border-[var(--theme-border)] px-4 py-2 text-[13px] font-medium text-[var(--theme-text)] md:hidden hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4"/> Filters{activeCount > 0 && <span className="rounded-full bg-[var(--theme-accent)] text-white px-2 py-0.5 text-[10px]">{activeCount}</span>}
          </button>
          
          {/* CUSTOM SORT DROPDOWN */}
          <div 
            className="relative flex items-center gap-2 text-[13px] text-[var(--theme-muted)]"
            onMouseEnter={handleSortEnter}
            onMouseLeave={handleSortLeave}
          >
            <ArrowUpDown className="h-4 w-4"/>
            <span className="hidden sm:inline">Sort by</span>
            
            {/* Trigger Button (Now handles onClick for mobile) */}
            <button 
              onClick={toggleSortDropdown}
              className="flex items-center gap-1 font-medium text-[var(--theme-text)] hover:text-[var(--theme-accent)] transition-colors outline-none group"
            >
              {SORT_OPTIONS.find(o => o.value === sort)?.label}
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
            </button>

            {/* Dropdown Menu */}
            <div 
              ref={sortDropdownRef}
              className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 pointer-events-none z-50 overflow-hidden"
              style={{ transform: "translateY(10px)" }}
            >
              <div className="p-1.5 flex flex-col gap-0.5">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSort(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`group relative flex items-center justify-between px-3 py-2 text-[13px] rounded-lg transition-colors overflow-hidden ${
                      sort === option.value 
                        ? "bg-[var(--theme-accentSubtle)] text-[var(--theme-accent)] font-medium" 
                        : "text-gray-600 hover:bg-[var(--theme-accentSubtle)]/50 hover:text-[var(--theme-accent)]"
                    }`}
                  >
                    <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                      {option.label}
                    </span>
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)] opacity-0 scale-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100" />
                    {sort === option.value && (
                      <Check className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Desktop Sidebar */}
        <div ref={sidebarWrapperRef} className="hidden md:block shrink-0 overflow-hidden">
          <div className="w-[280px] bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <CatalogSidebar {...sidebarProps} />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {result.length ? (
            <div className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:gap-x-6 ${isSidebarOpen ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}>
              {result.slice(0, visibleCount).map((product: any) => (
                <ShopProductCard key={product.id} product={product} keyLabel={keyLabel} attributeValue={attributeValue} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-24 text-center h-full flex flex-col justify-center items-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                <Search className="h-6 w-6 text-[var(--theme-muted)]"/>
              </div>
              <h2 className="mt-4 text-[20px] font-medium text-[var(--theme-text)]">No products match those filters</h2>
              <p className="mt-2 text-[14px] text-[var(--theme-muted)]">Try adjusting your search or clearing some filters.</p>
              <button onClick={clearAll} className="mt-6 rounded-full bg-[var(--theme-accent)] px-6 py-3 text-[13px] font-medium text-white transition hover:bg-[var(--theme-accentHover)]">Clear filters</button>
            </div>
          )}
          
          {result.length > visibleCount && (
            <div className="mt-12 text-center">
              <button onClick={() => setVisibleCount((c) => c + 12)} className="rounded-full border border-[var(--theme-border)] px-8 py-3 text-[13px] font-medium text-[var(--theme-text)] transition hover:bg-gray-50">
                Show more styles
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setMobileFilters(false)}>
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-[18px] font-medium text-[var(--theme-text)]">Filters</h2>
              <button onClick={() => setMobileFilters(false)} className="rounded-full border border-[var(--theme-border)] p-2 text-[var(--theme-muted)] hover:text-[var(--theme-text)]">
                <X className="h-4 w-4"/>
              </button>
            </div>
            <CatalogSidebar {...sidebarProps} />
            <button onClick={() => setMobileFilters(false)} className="mt-8 w-full rounded-full bg-[var(--theme-accent)] py-3.5 text-[13px] font-medium text-white hover:bg-[var(--theme-accentHover)] transition-colors">
              Show {result.length} styles
            </button>
          </div>
        </div>
      )}
    </section>
  );
}