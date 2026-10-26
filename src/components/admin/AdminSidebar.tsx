'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, FolderTree, Package, Boxes, 
  Gift, Tag, ShoppingCart, Settings, Bell, ShoppingBag, AlertTriangle, UserPlus, X
} from 'lucide-react';
import gsap from 'gsap';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { id: 'categories', label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { id: 'products', label: 'Products', href: '/admin/products', icon: Package },
  { id: 'variants', label: 'Variants', href: '/admin/variants', icon: Boxes },
  { id: 'packages', label: 'Packages', href: '/admin/packages', icon: Gift },
  { id: 'offers', label: 'Offers', href: '/admin/offers', icon: Tag },
];

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  referenceId: string | null;
  referenceType: string | null;
  isRead: boolean;
  createdAt: string;
}

function getNotifStyle(type: string): { icon: React.ElementType; color: string; bg: string } {
  switch (type) {
    case 'new_order':    return { icon: ShoppingBag,   color: 'text-green-600',  bg: 'bg-green-50' };
    case 'low_stock':   return { icon: AlertTriangle,  color: 'text-orange-600', bg: 'bg-orange-50' };
    case 'new_user':    return { icon: UserPlus,       color: 'text-blue-600',   bg: 'bg-blue-50' };
    case 'offer_expiring': return { icon: Tag,         color: 'text-red-600',    bg: 'bg-red-50' };
    default:            return { icon: Bell,           color: 'text-gray-600',   bg: 'bg-gray-50' };
  }
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [realNotifications, setRealNotifications] = useState<Notification[]>([]);
  const [showRead, setShowRead] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const activePillRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setRealNotifications(data.notifications || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = realNotifications.filter((n) => !n.isRead).length;

  // === ANIMATED ACTIVE PILL ===
  useEffect(() => {
    if (!navContainerRef.current || !activePillRef.current) return;
    
    // Find the currently active link
    const activeLink = navContainerRef.current.querySelector('[data-active="true"]') as HTMLElement;
    
    if (activeLink) {
      const containerRect = navContainerRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      
      // Calculate relative position
      const top = linkRect.top - containerRect.top;
      const height = linkRect.height;

      // Animate the pill
      gsap.to(activePillRef.current, {
        y: top,
        height: height,
        opacity: 1,
        duration: 0.4,
        ease: "elastic.out(1, 0.8)",
      });
    } else {
      // Hide the pill if no active link is found (e.g. on settings)
      gsap.to(activePillRef.current, { opacity: 0, duration: 0.2 });
    }
  }, [pathname]);

  // Animate Notification Panel
  useEffect(() => {
    if (!notifRef.current) return;
    if (isNotifOpen) {
      gsap.to(notifRef.current, { x: 0, opacity: 1, pointerEvents: 'auto', duration: 0.3, ease: 'power3.out' });
    } else {
      gsap.to(notifRef.current, { x: -10, opacity: 0, pointerEvents: 'none', duration: 0.2, ease: 'power3.in' });
    }
  }, [isNotifOpen]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        const bellButton = document.getElementById('sidebar-notif-bell');
        if (bellButton && !bellButton.contains(event.target as Node)) {
          setIsNotifOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 flex-col">
      
      {/* The Floating Pill Container */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-2xl shadow-gray-200/50 rounded-[32px] p-2 flex flex-col gap-1.5">
        
        {/* Navigation Wrapper with Sliding Background */}
        <div ref={navContainerRef} className="relative flex flex-col gap-1.5">
          
          {/* The Sliding Active Pill */}
          <div
            ref={activePillRef}
            className="absolute top-0 left-0 w-12 bg-[#5433EB] rounded-2xl shadow-md z-0 pointer-events-none opacity-0"
          />

          {/* Navigation Items */}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <div key={item.id} className="relative group flex justify-center z-10">
                <Link
                  href={item.href}
                  data-active={isActive ? "true" : undefined}
                  // Removed the background color from the Link itself so the sliding pill handles it
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-[20px] h-[20px]" />
                </Link>
                
                {/* Tooltip */}
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-xl translate-x-2 group-hover:translate-x-0">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-8 h-px bg-gray-200 mx-auto my-1" />

        {/* Notifications */}
        <div className="relative group flex justify-center">
          <button
            id="sidebar-notif-bell"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 outline-none ${isNotifOpen ? 'bg-[#F3F0FF] text-[#5433EB]' : 'text-gray-400 hover:text-black hover:bg-gray-100'}`}
          >
            <Bell className="w-[20px] h-[20px]" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 min-w-[16px] h-4 bg-[#5433EB] text-white text-[9px] font-bold flex items-center justify-center rounded-full px-1 border border-white">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notification Popup */}
          <div
            ref={notifRef}
            className="absolute bottom-0 left-full ml-4 w-80 bg-white rounded-2xl opacity-0 pointer-events-none overflow-hidden"
            style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)' }}
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-black">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold text-[#5433EB] bg-[#F3F0FF] px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
                {realNotifications.some(n => n.isRead) && (
                  <button
                    onClick={() => setShowRead(!showRead)}
                    className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showRead ? 'Hide read' : 'Show all'}
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '340px' }}>
              {(() => {
                const visible = showRead ? realNotifications : realNotifications.filter(n => !n.isRead);
                if (visible.length === 0) {
                  return (
                    <div className="px-4 py-6 text-center">
                      <p className="text-[13px] text-gray-400">
                        {realNotifications.length === 0 ? 'No notifications yet' : 'All caught up!'}
                      </p>
                    </div>
                  );
                }
                return visible.map((notif) => {
                  const { icon: Icon, color, bg } = getNotifStyle(notif.type);
                  return (
                    <div key={notif.id} className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group ${notif.isRead ? 'opacity-50' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={async () => {
                        if (!notif.isRead) {
                          await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: notif.id }) });
                          fetchNotifications();
                        }
                      }}>
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-[13px] font-medium text-black leading-tight">{notif.title}</p>
                          {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#5433EB] shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-1">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                      </div>
                      <button
                        onClick={async () => {
                          await fetch(`/api/notifications/${notif.id}`, { method: 'DELETE' });
                          fetchNotifications();
                        }}
                        className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all mt-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                });
              })()}
            </div>

            {unreadCount > 0 && (
              <div className="px-4 py-2.5 flex justify-center">
                <button
                  className="text-[12px] font-medium text-gray-400 hover:text-black transition-colors"
                  onClick={async () => {
                    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) });
                    fetchNotifications();
                  }}
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="relative group flex justify-center">
          <Link
            href="/admin/settings"
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${pathname === '/admin/settings' ? 'bg-[#5433EB] text-white shadow-md' : 'text-gray-400 hover:text-black hover:bg-gray-100'}`}
          >
            <Settings className="w-[20px] h-[20px]" />
          </Link>
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-xl">
            Settings
          </div>
        </div>
      </div>
    </aside>
  );
}