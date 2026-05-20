import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

// Magic-link callback. Exchanges the auth code for a session, then
// redirects to the home screen. Also calls the seed function so the
// program template is in place for first-time sign-ins.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Idempotent: seeds the 9-week program on first sign-in, no-op afterwards.
      await supabase.rpc('seed_default_program', {
        p_user: (await supabase.auth.getUser()).data.user?.id,
      });
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL('/auth/sign-in?error=auth', url.origin));
}
