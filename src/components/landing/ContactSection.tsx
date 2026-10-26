"use client";

import { ArrowRight, Globe, Share2, AtSign, HelpCircle } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="py-16 sm:py-24 bg-white outline-none border-0">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* LEFT: Creative Text & Links (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <div>
              <span className="inline-block text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--theme-muted)] mb-4">
                Support & Community
              </span>
              
              <h2 className="text-[44px] sm:text-[56px] font-medium text-[var(--theme-text)] leading-[0.95] tracking-tight mb-6">
                Let&apos;s start a <br className="hidden sm:block" /> conversation.
              </h2>
              
              <p className="text-[16px] sm:text-[18px] text-[var(--theme-text)]/70 leading-[1.5] mb-12 max-w-md">
                Whether you have a question about our natural ingredients, need help with an order, or just want to share your skin journey — we&apos;re all ears.
              </p>

              {/* Creative Links instead of contact details */}
              <div className="space-y-6">
                <a href="/faq" className="group flex items-center gap-4 text-[var(--theme-text)] hover:text-[var(--theme-accent)] transition-colors">
                  <div className="w-12 h-12 rounded-full border border-[var(--theme-border)] flex items-center justify-center group-hover:bg-[var(--theme-accent)] group-hover:border-[var(--theme-accent)] group-hover:text-white transition-all duration-300">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[16px] font-medium border-b border-transparent group-hover:border-[var(--theme-accent)] pb-0.5 transition-all">
                    Read our FAQ
                  </span>
                </a>

                <div className="pt-6 border-t border-[var(--theme-border)] max-w-xs">
                  <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--theme-muted)] mb-4">Follow our journey</p>
                  <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-[#F8F6F4] flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors">
                      <Globe className="w-4 h-4" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-[#F8F6F4] flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors">
                      <Share2 className="w-4 h-4" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-[#F8F6F4] flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors">
                      <AtSign className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Creative Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#F8F6F4] rounded-[24px] p-8 sm:p-12">
            <h3 className="text-[24px] font-medium text-[var(--theme-text)] mb-8">Send a message</h3>
            
            <form className="space-y-8">
              
              {/* Form Grid for Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="relative">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--theme-muted)] mb-2">
                    Your Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Jane Doe"
                    className="w-full bg-transparent border-b border-[var(--theme-border)] py-2 text-[15px] text-[var(--theme-text)] outline-none focus:border-[var(--theme-accent)] transition-colors placeholder:text-gray-300 rounded-none"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--theme-muted)] mb-2">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    placeholder="jane@example.com"
                    className="w-full bg-transparent border-b border-[var(--theme-border)] py-2 text-[15px] text-[var(--theme-text)] outline-none focus:border-[var(--theme-accent)] transition-colors placeholder:text-gray-300 rounded-none"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div className="relative">
                <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--theme-muted)] mb-2">
                  How can we help?
                </label>
                <textarea 
                  rows={4}
                  placeholder="Tell us a little about what you're looking for..."
                  className="w-full bg-transparent border-b border-[var(--theme-border)] py-2 text-[15px] text-[var(--theme-text)] outline-none focus:border-[var(--theme-accent)] transition-colors placeholder:text-gray-300 resize-none rounded-none"
                />
              </div>

              {/* Submit Button - Guaranteed solid purple */}
              <div className="pt-4">
                <button 
                  type="button"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#5433EB] text-white font-medium text-[13px] uppercase tracking-[0.1em] hover:bg-[#4524DB] active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  Send Message
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}