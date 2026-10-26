import { Loader2 } from 'lucide-react';

interface AdminLoaderProps {
  text?: string;
}

export default function AdminLoader({ text = 'Loading...' }: AdminLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-[var(--theme-bgElevated)] rounded-2xl border border-gray-200 text-gray-500 text-sm gap-2 w-full">
      <Loader2 className="w-6 h-6 animate-spin text-[var(--theme-accent)]" />
      <span>{text}</span>
    </div>
  );
}