'use client';

/**
 * Full-page loading skeleton shown during route transitions
 * and initial hydration of client-heavy pages.
 */
export function LoadingSkeleton() {
  return (
    <main className="mesh-bg min-h-screen flex flex-col">
      {/* Header skeleton */}
      <header className="flex items-center justify-center px-8 py-4 bg-[rgba(8,6,20,0.85)] border-b border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="h-5 w-24 rounded bg-white/10 animate-pulse" />
          <span className="text-white/20 text-sm">×</span>
          <div className="h-4 w-20 rounded bg-white/10 animate-pulse" />
        </div>
      </header>

      {/* Content skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 gap-6 max-w-lg mx-auto w-full">
        {/* Title */}
        <div className="h-8 w-3/4 rounded-lg bg-white/[0.06] animate-pulse" />
        {/* Subtitle */}
        <div className="h-4 w-full rounded bg-white/[0.04] animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-white/[0.04] animate-pulse" />

        {/* Card skeleton */}
        <div className="glass-card w-full p-7 mt-4 flex flex-col gap-4">
          <div className="h-5 w-1/2 rounded bg-white/[0.08] animate-pulse" />
          <div className="h-4 w-full rounded bg-white/[0.05] animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-white/[0.05] animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-white/[0.05] animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-white/[0.08] animate-pulse mt-2" />
        </div>
      </div>
    </main>
  );
}

/**
 * Inline card skeleton for use within pages (e.g. chat loading).
 */
export function CardSkeleton() {
  return (
    <div className="glass-card p-6 flex flex-col gap-3 animate-pulse">
      <div className="h-5 w-2/5 rounded bg-white/[0.08]" />
      <div className="h-4 w-full rounded bg-white/[0.05]" />
      <div className="h-4 w-4/5 rounded bg-white/[0.05]" />
      <div className="h-4 w-3/5 rounded bg-white/[0.05]" />
    </div>
  );
}
