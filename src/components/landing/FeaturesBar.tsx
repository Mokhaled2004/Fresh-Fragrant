import { Truck, RotateCcw, Leaf, Headphones } from "lucide-react";

const FEATURES = [
  { icon: Truck,        label: "Free Delivery",   sub: "On orders over $50" },
  { icon: RotateCcw,   label: "Easy Returns",     sub: "30-day return policy" },
  { icon: Leaf,        label: "100% Natural",      sub: "No harmful chemicals" },
  { icon: Headphones,  label: "24/7 Support",      sub: "Always here to help" },
];

export default function FeaturesBar() {
  return (
    <section className="border-t border-b border-[var(--theme-border)] bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {FEATURES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F8F6F4] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[var(--theme-accent)]" />
              </div>
              <div>
                <p className="text-[13px] font-medium uppercase tracking-[0.05em] text-[var(--theme-text)] mb-1">{label}</p>
                <p className="text-[12px] text-[var(--theme-muted)]">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}