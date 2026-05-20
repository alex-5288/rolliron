# Roll & Iron — Phase 1 Setup

Personal fight-camp PWA. Installable from iPhone Safari.

## Stack
- **Next.js 15** (App Router, Server Actions, TypeScript)
- **Tailwind CSS** — black + neon-red theme
- **Supabase** — Postgres + Auth (free tier)
- **Vercel** — hosting (free tier)

## One-time setup

### 1. Create a Supabase project

1. Go to https://supabase.com → **New project**.
2. Pick a region close to you (e.g., West US).
3. Set a strong DB password and save it somewhere safe.
4. Wait ~2 minutes for the project to spin up.

### 2. Run the migrations

In the Supabase dashboard → **SQL Editor** → **+ New query**:

1. Paste the contents of `../supabase/migrations/001_init.sql`. Run.
2. Paste the contents of `../supabase/migrations/002_seed_program.sql`. Run.

Both should report `Success. No rows returned.`

The seed function isn't called automatically — instead, it runs the first time you sign in (via the auth callback in this app).

### 3. Configure Supabase Auth

In the Supabase dashboard:

1. **Authentication → Providers → Email**: enable "Email", disable "Confirm email" (optional, makes magic links faster).
2. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (for now)
   - Redirect URLs: add `http://localhost:3000/auth/callback`
3. After deploying to Vercel, come back and replace these with your production URL (and add it as an additional redirect URL).

### 4. Local environment

```sh
cd web
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# Find them in Supabase → Settings → API
npm install
npm run dev
```

Visit http://localhost:3000. Sign in with `acummings@apu.edu`. Open the magic link from your email.

### 5. Deploy to Vercel

1. Push this repo to GitHub.
2. Go to https://vercel.com → **Add new project** → import the repo.
3. **Root directory:** `web`
4. **Framework preset:** Next.js (auto-detected)
5. Add the environment variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy.

After the first deploy, update Supabase **URL Configuration** with the Vercel URL.

### 6. Install on iPhone

1. Open the Vercel URL in Safari on your iPhone.
2. Tap **Share → Add to Home Screen**.
3. Tap the home-screen icon. Sign in.

Done — you're tracking camp.

## What's in Phase 1

- ✅ Today screen — shows today's prescribed session (lift / BJJ / cardio / rest / taper / comp).
- ✅ Lift logger — pre-fills prescribed sets/reps/RPE; you enter actual.
- ✅ BJJ logger — gi/no-gi, focus, rolls, taps, RPE, notes, optional ORB summary.
- ✅ Cardio logger — manual; replaced by Garmin auto-sync in Phase 2.
- ✅ Body metrics — weight, BF%, muscle%, water%.
- ✅ History — filterable list of all sessions.
- ✅ PWA — installable, full-screen, dark.

## What's next

- **Phase 2** — Garmin Epix Gen 2 nightly sync via GitHub Actions + `python-garminconnect`.
- **Phase 3** — Nutrition logging (Open Food Facts barcode + USDA search), dashboard tab, PR tracking.
- **Phase 4** — Taper-mode UI polish, CSV/PDF export.

## Troubleshooting

**"Not signed in" error after clicking the magic link.** Check the redirect URL in Supabase Auth → URL Configuration matches your deployment.

**Today screen says "No program is set up."** The seed function should run on sign-in. To re-run it manually, in Supabase SQL Editor:
```sql
select seed_default_program(auth.uid());
```
Won't work — `auth.uid()` is null in the SQL editor. Use:
```sql
select seed_default_program('YOUR-USER-ID-HERE');
```
Find your user id at Supabase → Authentication → Users.

**Home screen icon is ugly.** See `public/icons/README.md` — add 192/512/180 PNGs.
