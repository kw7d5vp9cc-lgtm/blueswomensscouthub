# Chelsea Women's Scouting Hub — recovered/upgraded build

This is a safe replacement project based on the recovered Vercel source structure and the existing Supabase schema.

## Included
- Dashboard navigation
- Live Supabase player search
- Live fixtures
- Add Fixture form with scout assignment
- Add Report workflow
- Technical / Tactical / Physical / Mentality scores (1–4)
- "Did the player show something special?" Yes / No
- Strengths and development areas
- Recruitment longlist
- Uses publishable browser key only

## Supabase environment variables
Create `.env.local` from `.env.example` and set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Never use the service-role key in the browser.

## Important authentication note
Your existing RLS policies expect authenticated Supabase users. This build deliberately does not bypass RLS.
Before production use, add a sign-in screen or connect your existing authentication flow so `auth.uid()` maps to `profiles.id`.

## Data API grants
Supabase changed Data API defaults in 2026. If the browser receives `permission denied for table ...`, review and run the included `supabase-data-api-grants.sql`. Grants expose the table to the authenticated role; RLS still controls row access.

## Safe rollout
1. Keep the current production deployment untouched.
2. Put this project in GitHub.
3. Create a separate Vercel preview project/deployment.
4. Add Supabase environment variables in Vercel.
5. Test authentication, fixture creation, scout assignment and report submission.
6. Promote only after validation.
