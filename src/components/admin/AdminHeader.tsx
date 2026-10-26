import { Menu } from 'lucide-react';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-[var(--theme-bgElevated)]">
      <div className="flex items-center gap-4">
        {/* Hamburger button visible only on mobile/tablet */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-[var(--theme-textStrong)]">Welcome back, Admin</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600 hidden sm:inline">admin@ecommerce.com</span>
        <div className="w-9 h-9 rounded-full bg-gray-200 text-[var(--theme-textStrong)] font-bold flex items-center justify-center text-sm shadow-sm">
          A
        </div>
      </div>
    </header>
  );
}