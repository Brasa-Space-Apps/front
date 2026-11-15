export default function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-foreground/10 px-4 py-3">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-green">brasa</span>
        <p className="text-sm text-foreground/80">
          The history of fire in the Pantanal, in one click.
        </p>
      </div>
      <a
        href="/how-it-works"
        className="rounded-sm text-sm font-medium text-foreground/85 underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4501C]"
      >
        How it works
      </a>
    </header>
  );
}