import Image from "next/image";
import Link from "next/link";

export default function SpecialOffersBanner() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white outline-none border-0">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Main Container */}
        <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-[#F3F0FF] via-[#F8F6F4] to-[#F8F6F4] min-h-[400px] flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 md:pl-16 md:pr-0 border-none outline-none">
          
          {/* LEFT: Text Content */}
          <div className="relative z-10 w-full md:w-1/2 py-10 md:py-16 md:pr-12">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--theme-accent)] mb-4">
              Special Offer
            </span>

            <h2 className="text-[36px] sm:text-[46px] font-medium text-[var(--theme-text)] leading-[1.05] tracking-tight mb-5">
              The Botanical <br className="hidden sm:block" /> Soap Bundle
            </h2>

            <p className="text-[15px] sm:text-[16px] text-[var(--theme-text)]/70 leading-relaxed mb-8 max-w-sm">
              Get a personalised natural routine based on your unique skin type. Save 30% on our cold-pressed, handmade soap bundles this week only.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {/* Purple Filled Button */}
              <Link
                href="/shop?sale=true"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[var(--theme-accent)] text-white text-[13px] font-medium hover:bg-[var(--theme-accentHover)] transition-colors duration-300"
              >
                Shop The Sale
              </Link>
              
              {/* Text Link */}
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-4 py-3.5 text-[var(--theme-text)] text-[13px] font-medium hover:text-[var(--theme-accent)] transition-colors duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* RIGHT: Image */}
          <div className="relative w-full md:w-1/2 h-[300px] sm:h-[380px] md:h-[450px] mt-8 md:mt-0">
            {/* 
              The image is pulled to the right and given its own rounded corners 
              to mimic the "floating" look of the second reference image.
            */}
            <div className="absolute inset-y-0 right-0 w-full md:w-[110%] rounded-tl-[32px] rounded-tr-[32px] md:rounded-tr-none md:rounded-l-[32px] overflow-hidden bg-[#EBE7E0]">
              <Image
                src="https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1200&auto=format&fit=crop"
                alt="Handcrafted natural soap bundle"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}