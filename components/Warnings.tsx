// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
export default function Warnings({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul role="status" className="space-y-1 rounded-md border border-[var(--warning)] bg-[var(--warning-surface)] p-3 text-sm text-[var(--warning)]">
      {items.map((w) => (
        <li key={w}><span aria-hidden="true">⚠︎</span> <span>{w}</span></li>
      ))}
    </ul>
  );
}
