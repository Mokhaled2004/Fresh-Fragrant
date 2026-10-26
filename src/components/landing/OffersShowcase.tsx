// src/components/landing/OffersShowcase.tsx
"use client";

import React from "react";
import Link from "next/link";

interface OffersShowcaseProps {
  offers?: Array<{
    id: string;
    title?: string;
    slug?: string;
    description?: string | null;
    imageUrl?: string | null;
  }>;
  categories?: Array<{ id: string; name: string; slug: string }>;
}

export default function OffersShowcase({ offers = [] }: OffersShowcaseProps) {
  if (!offers.length) return null;

  return (
    <section className="bg-[var(--theme-bg)] py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--theme-muted)] mb-2">
              Limited time
            </p>
            <h2 className="text-[28px] sm:text-[36px] font-medium uppercase tracking-[0.06em] text-[var(--theme-text)] leading-none">
              Current Offers
            </h2>
          </div>
          <Link
            href="/shop?sale=true"
            className="hidden sm:inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--theme-text)] border-b border-dashed border-[var(--theme-borderStrong)] pb-0.5 hover:text-[var(--theme-accent)] hover:border-[var(--theme-accent)] transition-colors"
          >
            View all offers
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <Link
              key={offer.id}
              href={`/shop?offer=${encodeURIComponent(offer.slug ?? offer.id)}`}
              className="group relative rounded-[var(--radius)] border border-[var(--theme-border)] bg-[var(--theme-bgElevated)] overflow-hidden hover:border-[var(--theme-accent)] transition-colors"
            >
              <div className="aspect-[4/3] bg-[var(--theme-bg)] overflow-hidden">
                {offer.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={offer.imageUrl}
                    alt={offer.title ?? "Offer"}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--theme-accent)] mb-1">
                  Offer
                </p>
                <h3 className="text-[14px] font-medium uppercase tracking-[0.06em] text-[var(--theme-text)]">
                  {offer.title ?? "Untitled offer"}
                </h3>
                {offer.description ? (
                  <p className="mt-2 text-[13px] text-[var(--theme-muted)] line-clamp-2">
                    {offer.description}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}