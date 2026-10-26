import Image from "next/image";
import Link from "next/link";

export default function SkinAnalysisBanner() {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-[var(--theme-accentText)] min-h-[220px] sm:min-h-[260px]">
          {/* Background decorative blob */}
          <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-[var(--theme-accent)]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 items-center gap-6 p-8 sm:p-12">
            {/* Text content */}
            <div>
              <span className="inline-block text-[var(--theme-accentHover)] text-xs font-semibold uppercase tracking-widest mb-3">
                NEW
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--theme-cardFg)] leading-snug mb-3">
                Virtual Skincare Analysis
              </h2>
              <p className="text-[var(--theme-cardFg)]/65 text-sm leading-relaxed mb-6 max-w-sm">
                Get a personalised skincare routine based on your unique skin type and concerns — powered by AI.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="#"
                  className="inline-flex items-center px-6 py-2.5 rounded-full bg-[var(--theme-accent)] text-[var(--theme-accentText)] text-sm font-semibold hover:bg-[var(--theme-accentHover)] transition-colors"
                >
                  Try It Free
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center px-6 py-2.5 rounded-full border border-white/30 text-[var(--theme-cardFg)] text-sm font-semibold hover:border-white/60 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right image */}
            <div className="relative h-56 sm:h-64 md:h-72">
              <Image
                src="/images/banners/6ca51358913515bfc16aef3a089ea97af096a30e.jpg"
                alt="Diverse skin tones"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
