import { Check, ChevronDown } from "lucide-react";

export function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className="flex w-full items-center gap-2.5 text-left text-[13px] text-[var(--theme-muted)] transition hover:text-[var(--theme-text)]">
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${checked ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)] text-white' : 'border-[var(--theme-border)] bg-white'}`}>
        {checked && <Check className="h-3 w-3" />}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function NumberField({ label, value, onChange, prefix }: { label: string; value: string; onChange: (value: string) => void; prefix?: string }) {
  return (
    <label className="flex min-w-0 items-center border-b border-[var(--theme-border)] py-1 focus-within:border-[var(--theme-accent)] transition-colors">
      <span className="text-[13px] text-[var(--theme-muted)]">{prefix}</span>
      <input 
        aria-label={label} type="number" min="0" value={value} onChange={(event) => onChange(event.target.value)} placeholder={label} 
        className="w-full min-w-0 bg-transparent px-2 py-1 text-[13px] text-[var(--theme-text)] outline-none placeholder:text-gray-300"
      />
    </label>
  );
}

export function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group border-b border-[var(--theme-border)] pb-6 last:border-0 last:pb-0">
      <summary className="mb-4 flex cursor-pointer list-none items-center justify-between text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--theme-text)]">
        {title}
        <ChevronDown className="h-3.5 w-3.5 text-[var(--theme-muted)] transition group-open:rotate-180" />
      </summary>
      {children}
    </details>
  );
}