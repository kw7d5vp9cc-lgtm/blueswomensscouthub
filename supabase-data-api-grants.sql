-- Run only if the app receives "permission denied for table ..." from the Supabase Data API.
-- RLS still determines which rows each authenticated user may access.
grant select on table public.clubs to authenticated;
grant select on table public.players to authenticated;
grant select on table public.profiles to authenticated;
grant select, insert on table public.fixtures to authenticated;
grant select, insert on table public.reports to authenticated;
grant select, insert on table public.report_assessments to authenticated;
grant select, insert on table public.fixture_requests to authenticated;
grant select, insert on table public.recruitment_actions to authenticated;
grant select on table public.season_themes to authenticated;
