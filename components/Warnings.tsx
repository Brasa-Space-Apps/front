// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
export default function Warnings({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul role="status" className="space-y-1 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      {items.map((w) => (
        <li key={w}>⚠︎ {w}</li>
      ))}
    </ul>
  );
}
