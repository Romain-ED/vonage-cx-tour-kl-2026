/**
 * Server component — renders the Vonage-only header.
 */
export function AppHeader() {
  return (
    <header className="flex items-center justify-center px-8 py-4 bg-[rgba(8,6,20,0.8)] border-b border-white/[0.08] backdrop-blur-xl">
      <img src="/vonage-logo.png" alt="Vonage" className="h-5 w-auto invert" />
    </header>
  );
}
