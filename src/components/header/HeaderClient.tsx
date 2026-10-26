"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search, ShoppingBag, Menu, X, User, LogOut, Package, LogIn } from "lucide-react";
import gsap from "gsap";

import { useCart } from "@/components/cart/CartProvider"; 
import CartDrawer from "@/components/cart/CartDrawer"; // <-- IMPORT NEW CART DRAWER
import NavItem from "./NavItem";
import ActiveTabIndicator from "./ActiveTabIndicator";
import ProfileDrawer from "./ProfileDrawer";

interface HeaderClientProps {
  user?: { name?: string; email?: string; fullName?: string; firstName?: string; [key: string]: unknown } | null;
}

// --- GSAP SIGN IN BUTTON ---
function SignInButton() {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const fill = fillRef.current;
    const text1 = text1Ref.current;
    const text2 = text2Ref.current;
    if (!btn || !fill || !text1 || !text2) return;

    gsap.set(fill, { y: "100%" });
    gsap.set(text2, { y: "100%" });

    const onEnter = () => {
      gsap.to(fill, { y: "0%", duration: 0.4, ease: "power3.out" });
      gsap.to(text1, { y: "-100%", duration: 0.4, ease: "power3.out" });
      gsap.to(text2, { y: "0%", duration: 0.4, ease: "power3.out" });
    };

    const onLeave = () => {
      gsap.to(fill, { y: "100%", duration: 0.4, ease: "power3.out" });
      gsap.to(text1, { y: "0%", duration: 0.4, ease: "power3.out" });
      gsap.to(text2, { y: "100%", duration: 0.4, ease: "power3.out" });
    };

    btn.addEventListener("mouseenter", onEnter);
    btn.addEventListener("mouseleave", onLeave);

    return () => {
      btn.removeEventListener("mouseenter", onEnter);
      btn.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf([fill, text1, text2]);
    };
  }, []);

  return (
    <Link
      ref={btnRef}
      href="/auth/login"
      className="relative hidden sm:inline-flex items-center justify-center px-6 py-2 ml-2 rounded-full border border-[var(--theme-border)] bg-transparent overflow-hidden outline-none z-10 whitespace-nowrap"
    >
      <span ref={fillRef} className="absolute inset-0 w-full h-full bg-[var(--theme-accent)] z-0" />
      <span className="relative z-10 block overflow-hidden h-[18px]">
        <span ref={text1Ref} className="block text-[var(--theme-text)] text-[13px] font-medium leading-[18px]">
          Sign In
        </span>
        <span ref={text2Ref} className="absolute top-0 left-0 block text-white text-[13px] font-medium leading-[18px]">
          Sign In
        </span>
      </span>
    </Link>
  );
}

// --- USER PROFILE DROPDOWN ---
function UserProfile({ 
  user, 
  onOpenProfile,
  onLogout 
}: { 
  user: NonNullable<HeaderClientProps["user"]>, 
  onOpenProfile: (tab?: "profile" | "orders") => void,
  onLogout: () => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const displayName = user.name || user.fullName || user.firstName || user.username || user.email?.split("@")[0] || "User";
  const firstName = String(displayName).split(" ")[0];

  useEffect(() => {
    if (!dropdownRef.current) return;

    if (isOpen) {
      gsap.to(dropdownRef.current, { y: 0, opacity: 1, pointerEvents: "auto", duration: 0.3, ease: "power3.out" });
    } else {
      gsap.to(dropdownRef.current, { y: 10, opacity: 0, pointerEvents: "none", duration: 0.2, ease: "power3.in" });
    }
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div 
      className="relative ml-2 border-l border-[var(--theme-border)] pl-4 outline-none whitespace-nowrap z-50 flex items-center h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative inline-block">
        <button className="flex items-center justify-center outline-none py-2 cursor-pointer">
          <span className="text-[13px] font-medium text-[var(--theme-text)]">
            Hi, {firstName}
          </span>
        </button>

        <div 
          ref={dropdownRef}
          className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 pointer-events-none"
          style={{ transform: "translate(-50%, 10px)" }} 
        >
          <div className="w-44 bg-white border border-gray-200 rounded-xl shadow-lg">
            <div className="p-1.5 flex flex-col gap-0.5">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  onOpenProfile("profile");
                }}
                className="flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full text-left cursor-pointer"
              >
                <User className="w-4 h-4" />
                My Profile
              </button>

              <button 
                onClick={() => {
                  setIsOpen(false);
                  onOpenProfile("orders");
                }}
                className="flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full text-left cursor-pointer"
              >
                <Package className="w-4 h-4" />
                My Orders
              </button>

              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN HEADER ---
export default function HeaderClient({ user }: HeaderClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<"profile" | "orders" | "wishlist">("profile");

  const searchInputContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { items } = useCart();
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Our Collections", href: "/shop" },
    { name: "Offers", href: "/shop?sale=true" },
    { name: "Contact", href: "#contact" },
  ];

  useEffect(() => {
    if (!searchInputContainerRef.current) return;

    if (isSearchOpen) {
      gsap.to(searchInputContainerRef.current, {
        width: "200px",
        opacity: 1,
        duration: 0.4,
        ease: "power3.out",
        onComplete: () => searchInputRef.current?.focus()
      });
    } else {
      gsap.to(searchInputContainerRef.current, {
        width: "0px",
        opacity: 0,
        duration: 0.3,
        ease: "power3.in"
      });
    }
  }, [isSearchOpen]);

  return (
    <>
      <div className="relative w-full flex items-center justify-between h-full">
        
        {/* CENTER: Navigation */}
        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
          <nav ref={navRef} className="relative flex items-center gap-1 whitespace-nowrap">
            <ActiveTabIndicator containerRef={navRef} />
            {navLinks.map((link) => (
              <NavItem key={link.name} href={link.href} label={link.name} active={pathname === link.href} />
            ))}
          </nav>
        </div>

        {/* RIGHT: Utilities */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 ml-auto z-20">
          
          {/* SEARCH */}
          <div className="flex items-center">
            <div ref={searchInputContainerRef} className="overflow-hidden w-0 opacity-0 flex items-center h-[30px]">
              <input 
                ref={searchInputRef} type="text" placeholder="Search..." 
                className="bg-transparent border-b border-[var(--theme-accent)] text-[13px] text-[var(--theme-text)] outline-none w-full pb-1 mr-2 placeholder:text-[var(--theme-muted)]"
                onBlur={(e) => { if(!e.target.value) setIsSearchOpen(false); }}
              />
            </div>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`text-[var(--theme-muted)] hover:text-[var(--theme-text)] transition-colors outline-none hidden sm:flex items-center justify-center w-8 h-8 ${isSearchOpen ? 'text-[var(--theme-accent)]' : ''}`}
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          </div>

          <button onClick={() => setIsCartOpen(true)} className="relative text-[var(--theme-muted)] hover:text-[var(--theme-text)] transition-colors outline-none mr-2">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center rounded-full bg-[var(--theme-accent)] text-white text-[9px] font-bold px-1">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth Block */}
          {user ? (
            <UserProfile 
              user={user} 
              onOpenProfile={(tab) => {
                if (tab) setProfileTab(tab);
                setIsProfileOpen(true);
              }} 
              onLogout={handleLogout}
            />
          ) : (
            <SignInButton />
          )}

          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-[var(--theme-text)] ml-2 outline-none">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* PROFILE DRAWER */}
      {user && (
        <ProfileDrawer 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          user={user} 
          initialTab={profileTab}
        />
      )}

      {/* NEW SEPARATE CART DRAWER */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-4/5 max-w-sm h-full bg-white p-6 flex flex-col z-10 shadow-2xl overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 shrink-0">
                <span className="font-bold text-[18px] text-black">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="p-1 -mr-1 rounded-full text-gray-500 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1.5 shrink-0">
                {navLinks.map((link) => (
                  <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`px-4 py-3 rounded-xl text-[14px] font-medium transition-colors ${pathname === link.href ? "bg-[var(--theme-accentSubtle)] text-[var(--theme-accent)]" : "text-gray-700 hover:bg-gray-50"}`}>
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* User Account Section on Mobile */}
              <div className="mt-auto pt-6 border-t border-gray-100 shrink-0">
                {user ? (
                  <div className="flex flex-col gap-1">
                    <div className="px-3 pb-3 mb-2 border-b border-gray-100">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">Account</p>
                      <p className="text-[14px] font-semibold text-black truncate mt-0.5">
                        {user.fullName || user.name || user.firstName || user.email?.split("@")[0] || "User"}
                      </p>
                      {user.email && (
                        <p className="text-[12px] text-gray-400 truncate mt-0.5">{user.email}</p>
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setProfileTab("profile");
                        setIsProfileOpen(true);
                      }}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors w-full text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Profile</span>
                    </button>

                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setProfileTab("orders");
                        setIsProfileOpen(true);
                      }}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors w-full text-left cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-gray-500" />
                      <span>Orders</span>
                    </button>

                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left cursor-pointer mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#5433EB] hover:bg-[#4524DB] text-white text-[14px] font-medium transition-colors shadow-sm"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-2.5 rounded-full border border-gray-200 text-gray-700 text-[13px] font-medium hover:bg-gray-50 transition-colors text-center"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}