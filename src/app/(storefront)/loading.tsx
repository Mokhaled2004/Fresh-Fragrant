export default function StorefrontLoading() {
  return (
    <main aria-label="Loading storefront" className="min-h-screen animate-pulse bg-[var(--theme-bgElevated)]">
      <section className="mx-auto grid min-h-[82vh] max-w-7xl content-center px-6 pt-24 sm:px-10">
        <div className="h-3 w-32 rounded bg-rose-300/25" />
        <div className="mt-5 h-12 w-80 max-w-full rounded-lg bg-[var(--theme-bgElevated)]/10" />
        <div className="mt-3 h-5 w-64 max-w-full rounded bg-[var(--theme-bgElevated)]/[0.06]" />
        <div className="mt-8 h-11 w-36 rounded-xl bg-rose-300/20" />
      </section>
    </main>
  );
}
