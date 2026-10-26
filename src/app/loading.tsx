export default function PageLoading() {
  return (
    <main aria-label="Loading page" className="min-h-screen animate-pulse bg-[var(--theme-bgElevated)] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="h-8 w-56 rounded-lg bg-[var(--theme-bgElevated)]/10" />
        <div className="mt-4 h-4 w-80 max-w-full rounded bg-[var(--theme-bgElevated)]/[0.06]" />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[4/5] rounded-2xl bg-[var(--theme-bgElevated)]/[0.05]" />)}
        </div>
      </div>
    </main>
  );
}
