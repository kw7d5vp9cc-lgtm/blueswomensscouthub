import { supabase } from './supabase/client'

export async function getPlayers() {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('players')
    .select(`
      id,
      full_name,
      date_of_birth,
      position,
      club_id,
      preferred_foot,
      latest_score,
      average_score,
      report_count,
      highest_score,
      recruitment_status,
      last_watched_at,
      clubs (
        id,
        name
      )
    `)
    .order('full_name')

  if (error) throw error

  return data ?? []
}

export async function getFixtures() {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('fixtures')
    .select(`
      id,
      home_team,
      away_team,
      fixture_date,
      kick_off,
      venue,
      age_group,
      competition,
      allocated_scout,
      status,
      fixture_reference,
      profiles!fixtures_allocated_scout_fkey (
        id,
        full_name
      )
    `)
    .order('fixture_date')

  if (error) throw error

  return data ?? []
}

export async function getProfiles() {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      access_level,
      active
    `)
    .eq('active', true)
    .order('full_name')

  if (error) throw error

  return data ?? []
}
