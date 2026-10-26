import Link from "next/link";
import ShopProductCard from "./ShopProductCard";

interface RelatedProductsProps {
  products: any[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  // A dummy function because ShopProductCard expects it, 
  // but for related products we usually don't show variant labels on the card.
  const keyLabel = (k: string) => k;
  const attributeValue = (v: any) => [String(v)];

  return (
    <div className="pt-16 border-t border-gray-100">
      
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#5433EB] mb-2">
            Complete your ritual
          </p>
          <h2 className="text-[28px] sm:text-[36px] font-medium text-black leading-[0.95]">
            You May Also Like
          </h2>
        </div>
        <Link 
          href="/shop" 
          className="hidden sm:inline-flex text-[13px] font-medium text-gray-500 hover:text-black border-b border-gray-300 hover:border-black pb-0.5 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
        {products.map((product) => (
          <ShopProductCard 
            key={product.id} 
            product={product} 
            keyLabel={keyLabel} 
            attributeValue={attributeValue} 
          />
        ))}
      </div>

    </div>
  );
}