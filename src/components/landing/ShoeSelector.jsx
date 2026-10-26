"use client";

import React, { useState } from "react";

// Mock data for the 6 shoes corresponding to your frames
const shoes = [
    { id: "shoe1", name: "Air Jordan 1 Retro", price: "$180", image: "/images/shoe1.png", frame: "Displaying Frame 1: Air Jordan High-Top" },
    { id: "shoe2", name: "Nike Air Max Yellow", price: "$150", image: "/images/shoe2.png", frame: "Displaying Frame 2: Nike Air Max Yellow Edition" },
    { id: "shoe3", name: "Nike Pink Runner", price: "$120", image: "/images/shoe3.png", frame: "Displaying Frame 3: Nike Pink Runner Active" },
    { id: "shoe4", name: "Nike Orange/Black 270", price: "$160", image: "/images/shoe4.png", frame: "Displaying Frame 4: Nike Air Max 270 Black/Orange" },
    { id: "shoe5", name: "Nike Blue Trainer", price: "$130", image: "/images/shoe5.png", frame: "Displaying Frame 5: Nike Performance Blue Trainer" },
    { id: "shoe6", name: "Nike Leather Edition", price: "$170", image: "/images/shoe6.png", frame: "Displaying Frame 6: Nike Premium Leather Lifestyle" },
];

export default function ShoeSelector() {
    const [selectedShoe, setSelectedShoe] = useState(shoes[0]);

    return (
        <div className="relative w-full min-h-screen bg-[var(--theme-bgElevated)] text-[var(--theme-cardFg)] flex flex-col lg:flex-row items-center justify-between px-6 lg:px-12 py-12 overflow-hidden gap-8">

            {/* MAIN DISPLAY AREA (Left/Center) */}
            <div className="flex-1 flex flex-col justify-center max-w-xl z-10">
                <span className="text-[var(--theme-accent)] font-semibold uppercase tracking-widest text-sm mb-2">
                    Featured Release
                </span>
                <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight mb-4">
                    {selectedShoe.name}
                </h1>
                <p className="text-[var(--theme-muted)] text-base lg:text-lg mb-6">
                    {selectedShoe.frame} — Engineered for ultimate comfort, striking streetwear aesthetics, and peak performance.
                </p>
                <div className="flex items-center space-x-4">
                    <button className="bg-[var(--theme-warn)] hover:bg-amber-600 text-foreground font-bold px-8 py-3 rounded-full transition-all shadow-lg shadow-amber-500/20">
                        Buy Now
                    </button>
                    <span className="text-2xl font-semibold text-[var(--theme-cardFg)]">{selectedShoe.price}</span>
                </div>
            </div>

            {/* 6-ITEM SELECTOR (Scrollable on mobile, Grid on large screens) */}
            <div className="flex lg:grid lg:grid-cols-2 gap-4 z-10 p-4 lg:p-6 bg-[var(--theme-bgElevated)]/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-x-auto max-w-full">
                {shoes.map((shoe) => {
                    const isSelected = selectedShoe.id === shoe.id;
                    return (
                        <button
                            key={shoe.id}
                            onClick={() => setSelectedShoe(shoe)}
                            className={`group relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none overflow-hidden ${isSelected
                                    ? "border-2 border-[var(--theme-accent)] shadow-[0_0_20px_rgba(225,29,72,0.6)] scale-105 bg-[var(--theme-bgElevated)]"
                                    : "border border-white/20 hover:border-white/50 bg-[var(--theme-bgElevated)]/80"
                                }`}
                        >
                            {/* Inner content / Shoe thumbnail */}
                            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden flex items-center justify-center p-1">
                                <img
                                    src={shoe.image}
                                    alt={shoe.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 pointer-events-none"
                                />
                            </div>

                            {/* Active Sub-glow Ring Effect */}
                            {isSelected && (
                                <span className="absolute -inset-1 rounded-full border border-[var(--theme-accent)]/40 animate-pulse pointer-events-none" />
                            )}
                        </button>
                    );
                })}
            </div>

        </div>
    );
}