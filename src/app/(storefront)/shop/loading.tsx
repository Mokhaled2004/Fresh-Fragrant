export default function ShopLoading() {
  return (
    <main aria-label="Loading shop" className="min-h-screen animate-pulse bg-[var(--theme-panel)] pb-16">
      <div className="mx-auto max-w-7xl px-5 pb-7 pt-32 sm:px-10">
        <div className="h-3 w-24 rounded bg-rose-200" />
        <div className="mt-3 h-11 w-48 rounded-lg bg-zinc-200" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-zinc-200" />
      </div>
      <div className="h-[320px] bg-[var(--theme-bgElevated)] sm:h-[360px]" />
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-10">
        <div className="mb-6 h-12 rounded-lg bg-[var(--theme-bgElevated)]" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index}><div className="aspect-[4/5] rounded-2xl bg-zinc-200"/><div className="mt-3 h-4 w-3/4 rounded bg-zinc-200"/><div className="mt-2 h-3 w-1/3 rounded bg-zinc-200"/></div>)}
        </div>
      </div>
    </main>
  );
}
