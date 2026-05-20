import Link from 'next/link';

export function Header({ title, back }: { title: string; back?: string }) {
  return (
    <header className="mb-4 flex items-center gap-3">
      {back ? (
        <Link
          href={back}
          className="text-mute active:text-neon px-2 -ml-2 text-xl leading-none"
          aria-label="Back"
        >
          ←
        </Link>
      ) : null}
      <h1 className="text-xl font-bold tracking-tight">
        <span className="text-neon">{title}</span>
      </h1>
    </header>
  );
}
