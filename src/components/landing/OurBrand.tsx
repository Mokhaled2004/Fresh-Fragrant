import Image from "next/image";
import Link from "next/link";

export default function OurBrand() {
  return (
    <section className="py-16 sm:py-24 bg-[#F8F6F4]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* LEFT: Text Content */}
          <div className="order-2 md:order-1">
            <span className="inline-block text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--theme-muted)] mb-4">
              Our Brand
            </span>
            
            <h2 className="text-[41px] sm:text-[51px] font-medium text-[var(--theme-text)] leading-[0.95] tracking-tight mb-6">
              Rooted in <br className="hidden sm:block" /> Nature.
            </h2>
            
            <div className="space-y-4 mb-8">
              <p className="text-[16px] sm:text-[18px] text-[var(--theme-text)]/70 leading-[1.5]">
                Fresh & Fragrant was born from a simple belief: that daily rituals should be gentle on your skin and the earth. We source the finest natural botanicals, combining cold-pressed oils and plant extracts to create products that truly make a difference.
              </p>
              <p className="text-[16px] sm:text-[18px] text-[var(--theme-text)]/70 leading-[1.5]">
                From our cruelty-free formulas to our zero-waste packaging, every choice we make is guided by our commitment to pure, sustainable beauty.
              </p>
            </div>

            <div className="flex flex-wrap gap-8 sm:gap-12 mb-10 border-t border-[var(--theme-border)] pt-8">
              {[
                { value: "100%", label: "Natural Origin" },
                { value: "50K+", label: "Happy Customers" },
                { value: "0%", label: "Synthetic Fragrance" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-[24px] font-medium text-[var(--theme-text)] leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--theme-muted)]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-[var(--theme-text)] text-[var(--theme-text)] text-[13px] font-medium hover:bg-[var(--theme-text)] hover:text-white transition-colors duration-300"
            >
              Explore Our Story
            </Link>
          </div>

          {/* RIGHT: Image */}
          <div className="order-1 md:order-2 w-full h-[400px] sm:h-[500px] md:h-[600px] relative rounded-xl overflow-hidden bg-[#E8DCD0]">
            <Image
              src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1200&auto=format&fit=crop"
              alt="Natural botanical ingredients"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
          
        </div>
      </div>
    </section>
  );
}