'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div 
      className="min-h-screen w-full text-black"
      style={{
        background: `
          radial-gradient(circle at 0% 0%, rgba(84, 51, 235, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 100% 100%, rgba(212, 163, 115, 0.12) 0%, transparent 60%),
          #F8F6F4
        `,
        backgroundAttachment: 'fixed'
      }}
    >
      
      {/* FLOATING SIDEBAR (Left) */}
      <AdminSidebar />

      {/* 
        MAIN CONTENT AREA 
        - pt-8 gives a tiny top gap so titles don't touch the screen edge
        - pl-28 offsets the floating sidebar
      */}
      <main className="pt-8 lg:pt-10 pl-24 lg:pl-32 pr-6 lg:pr-10 pb-12 w-full min-h-screen relative z-10">
        {children}
      </main>
      
    </div>
  );
}