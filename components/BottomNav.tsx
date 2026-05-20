import Link from 'next/link';

const items = [
  { href: '/', label: 'Today', icon: '◎' },
  { href: '/history', label: 'History', icon: '⌛' },
  { href: '/body', label: 'Body', icon: '⚖' },
  { href: '/log/bjj', label: 'Log BJJ', icon: '✕' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-ink-700 bg-ink-950/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-mute active:text-neon"
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
