// Fallback ambient types — used only when @types resolution from `next` is
// incomplete (e.g., a partial sandbox install). Real builds will use the
// bundled types from the next package and override these. Safe to delete
// once `npm install` has finished cleanly on the host machine.

declare module 'next' {
  export type Metadata = Record<string, unknown>;
  export type Viewport = Record<string, unknown>;
  export type NextConfig = Record<string, unknown>;
}

declare module 'next/link' {
  import type { ComponentProps, ReactElement } from 'react';
  interface LinkProps {
    href: string;
    className?: string;
    children?: React.ReactNode;
    prefetch?: boolean;
    [key: string]: unknown;
  }
  const Link: (props: LinkProps) => ReactElement;
  export default Link;
}

declare module 'next/navigation' {
  export function redirect(url: string): never;
  export function notFound(): never;
  export function useRouter(): {
    push(url: string): void;
    replace(url: string): void;
    back(): void;
    refresh(): void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

declare module 'next/headers' {
  export function cookies(): Promise<{
    getAll(): { name: string; value: string }[];
    set(name: string, value: string, options?: Record<string, unknown>): void;
  }>;
  export function headers(): Promise<Headers>;
}

declare module 'next/cache' {
  export function revalidatePath(path: string): void;
  export function revalidateTag(tag: string): void;
}

declare module 'next/server' {
  export class NextResponse extends Response {
    static redirect(url: URL | string, init?: number | ResponseInit): NextResponse;
    static next(init?: { request?: NextRequest }): NextResponse;
    cookies: {
      set(name: string, value: string, options?: Record<string, unknown>): void;
      getAll(): { name: string; value: string }[];
    };
  }
  export class NextRequest extends Request {
    nextUrl: URL;
    cookies: {
      getAll(): { name: string; value: string }[];
      set(name: string, value: string): void;
    };
  }
}
