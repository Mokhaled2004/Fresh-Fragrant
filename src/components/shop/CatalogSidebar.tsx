import { SlidersHorizontal, Search, Star } from "lucide-react";
import { CheckRow, NumberField, FilterGroup } from "./CatalogUI";

interface SidebarProps {
  search: string; setSearch: (v: string) => void;
  category: string; setCategory: (v: string) => void;
  categories: { id: string; name: string; slug: string }[];
  minPrice: string; setMinPrice: (v: string) => void;
  maxPrice: string; setMaxPrice: (v: string) => void;
  minWeight: string; setMinWeight: (v: string) => void;
  maxWeight: string; setMaxWeight: (v: string) => void;
  hasWeights: boolean;
  stock: 'all' | 'in' | 'out'; setStock: (v: 'all' | 'in' | 'out') => void;
  featured: boolean; setFeatured: (v: boolean) => void;
  sale: boolean; setSale: (v: boolean) => void;
  minimumRating: number; setMinimumRating: (v: number) => void;
  activeCount: number; clearAll: () => void;
  productOptions: { key: string, values: string[] }[];
  productFacets: Record<string, string[]>; toggleFacet: (type: 'product'|'variant', key: string, value: string) => void;
  variantOptions: { key: string, values: string[] }[];
  variantFacets: Record<string, string[]>;
  keyLabel: (k: string) => string;
}

export default function CatalogSidebar(props: SidebarProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--theme-text)]">
          <SlidersHorizontal className="h-4 w-4 text-[var(--theme-accent)]"/> Refine results
        </div>
        <button onClick={props.clearAll} className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--theme-muted)] transition hover:text-[var(--theme-accent)]">
          Clear all{props.activeCount > 0 ? ` (${props.activeCount})` : ''}
        </button>
      </div>

      <label className="block">
        <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--theme-text)]">Search catalog</span>
        <span className="flex items-center border-b border-[var(--theme-border)] py-1 focus-within:border-[var(--theme-accent)] transition-colors">
          <Search className="h-4 w-4 text-[var(--theme-muted)]"/>
          <input value={props.search} onChange={(e) => props.setSearch(e.target.value)} placeholder="Name, SKU or variant SKU" className="min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-[13px] text-[var(--theme-text)] outline-none placeholder:text-gray-300"/>
        </span>
      </label>

      <FilterGroup title="Category">
        <div className="space-y-3">
          {props.categories.map((item) => (
            <CheckRow key={item.id} label={item.name} checked={props.category === item.id || props.category === item.slug} onChange={() => props.setCategory(props.category === item.id || props.category === item.slug ? '' : item.id)}/>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price range">
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Min" value={props.minPrice} onChange={props.setMinPrice} prefix="$"/>
          <NumberField label="Max" value={props.maxPrice} onChange={props.setMaxPrice} prefix="$"/>
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <div className="space-y-3">
          <CheckRow label="All products" checked={props.stock === 'all'} onChange={() => props.setStock('all')}/>
          <CheckRow label="In stock" checked={props.stock === 'in'} onChange={() => props.setStock(props.stock === 'in' ? 'all' : 'in')}/>
          <CheckRow label="Out of stock" checked={props.stock === 'out'} onChange={() => props.setStock(props.stock === 'out' ? 'all' : 'out')}/>
        </div>
      </FilterGroup>

      <FilterGroup title="Collection">
        <div className="space-y-3">
          <CheckRow label="On sale" checked={props.sale} onChange={() => props.setSale(!props.sale)}/>
          <CheckRow label="Featured" checked={props.featured} onChange={() => props.setFeatured(!props.featured)}/>
        </div>
      </FilterGroup>

      <FilterGroup title="Customer rating">
        <div className="space-y-3">
          {[4, 3, 2, 1].map((rating) => (
            <button 
              key={rating} 
              onClick={() => props.setMinimumRating(props.minimumRating === rating ? 0 : rating)} 
              className={`group flex w-full items-center gap-1 text-left text-[13px] transition ${
                props.minimumRating === rating ? 'text-[var(--theme-accent)] font-medium' : 'text-[var(--theme-muted)] hover:text-[var(--theme-text)]'
              }`}
            >
              <span className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3.5 w-3.5 transition-colors ${
                      i < rating 
                        ? 'fill-[var(--theme-accent)] text-[var(--theme-accent)]' 
                        : 'text-gray-200 group-hover:text-[var(--theme-accent)]/30'
                    }`}
                  />
                ))}
              </span>
              <span className="ml-2">& up</span>
            </button>
          ))}
        </div>
      </FilterGroup>

      {props.hasWeights && (
        <FilterGroup title="Weight">
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Min" value={props.minWeight} onChange={props.setMinWeight}/>
            <NumberField label="Max" value={props.maxWeight} onChange={props.setMaxWeight}/>
          </div>
        </FilterGroup>
      )}

      {props.productOptions.map(({ key, values }) => (
        <FilterGroup key={`product-${key}`} title={props.keyLabel(key)}>
          <div className="max-h-40 space-y-3 overflow-y-auto pr-2">
            {values.map((value) => <CheckRow key={value} label={value} checked={props.productFacets[key]?.includes(value) ?? false} onChange={() => props.toggleFacet('product', key, value)}/>)}
          </div>
        </FilterGroup>
      ))}

      {props.variantOptions.map(({ key, values }) => (
        <FilterGroup key={`variant-${key}`} title={`Variant ${props.keyLabel(key)}`}>
          <div className="max-h-40 space-y-3 overflow-y-auto pr-2">
            {values.map((value) => <CheckRow key={value} label={value} checked={props.variantFacets[key]?.includes(value) ?? false} onChange={() => props.toggleFacet('variant', key, value)}/>)}
          </div>
        </FilterGroup>
      ))}
    </div>
  );
}