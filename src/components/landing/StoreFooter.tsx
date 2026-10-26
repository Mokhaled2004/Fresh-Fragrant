"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function StoreFooter() {
  return (
    <footer className="bg-[#F8F6F4] border-t border-[var(--theme-border)] pt-16 pb-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-medium text-[20px] tracking-wide text-black whitespace-nowrap">
                Fresh <span className="text-[var(--theme-accent)]">&</span> Fragrant
              </span>
            </Link>
            <p className="text-[14px] text-[var(--theme-muted)] leading-relaxed mb-8 max-w-xs">
              Premium natural soaps and conditioners crafted with organic botanicals. Rooted in nature, made for you.
            </p>
            
            {/* Social Icons using custom SVGs to guarantee they build */}
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-accent)] hover:border-[var(--theme-accent)] hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-accent)] hover:border-[var(--theme-accent)] hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-accent)] hover:border-[var(--theme-accent)] hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--theme-muted)] mb-5">Shop</h4>
            <ul className="space-y-3">
              {["All Products", "Handcrafted Soaps", "Hair Conditioners", "Body Oils", "Zero Waste"].map((item) => (
                <li key={item}>
                  <Link href="/shop" className="text-[14px] text-[var(--theme-text)]/70 hover:text-[var(--theme-accent)] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--theme-muted)] mb-5">Support</h4>
            <ul className="space-y-3">
              {["FAQ", "Shipping Info", "Returns & Exchanges", "Track Your Order", "Contact Us"].map((item) => (
                <li key={item}>
                  <Link href="#contact" className="text-[14px] text-[var(--theme-text)]/70 hover:text-[var(--theme-accent)] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--theme-muted)] mb-5">Join the Ritual</h4>
            <p className="text-[14px] text-[var(--theme-text)]/70 mb-4 leading-relaxed">
              Subscribe for exclusive offers, botanical skincare tips, and early access to new launches.
            </p>
            <form className="flex items-center border-b border-[var(--theme-border)] pb-2 focus-within:border-[var(--theme-accent)] transition-colors" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-transparent text-[14px] text-[var(--theme-text)] placeholder:text-gray-400 outline-none"
              />
              <button type="submit" className="text-[var(--theme-text)] hover:text-[var(--theme-accent)] transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--theme-border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[var(--theme-muted)]">
            © {new Date().getFullYear()} Fresh & Fragrant. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[12px] text-[var(--theme-muted)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Cruelty Free
            </span>
            <p className="text-[12px] text-[var(--theme-muted)]">Designed by Fresh & Fragrant Studio</p>
          </div>
        </div>
      </div>
    </footer>
  );
}