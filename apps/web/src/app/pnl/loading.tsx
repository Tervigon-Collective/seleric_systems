export default function PnlLoading() {
  return (
    <main className="p-6 space-y-6">
      <div className="h-8 w-56 rounded-lg bg-stone-200 dark:bg-night-800 animate-pulse" />
      <div className="h-16 rounded-xl bg-stone-100 dark:bg-night-900 border border-stone-200 dark:border-night-800 animate-pulse" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-72 rounded-xl bg-stone-100 dark:bg-night-900 border border-stone-200 dark:border-night-800 animate-pulse"
          />
        ))}
      </div>
    </main>
  )
}
