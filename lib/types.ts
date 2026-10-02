export type Score = '1' | '2' | '3' | '4'

export type NavItem =
  | 'Dashboard'
  | 'Player Portal'
  | 'Scouting Portal'
  | 'Fixtures'
  | 'Recruitment'
  | 'Administration'

export type Profile = {
  id: string
  email: string
  full_name: string
  access_level: string
  active: boolean
}

export type Club = {
  id: string
  name: string
}

export type Player = {
  id: string
  full_name: string
  date_of_birth: string | null
  position: string | null
  club_id: string | null
  preferred_foot: string | null
  latest_score: Score | null
  average_score: number | null
  report_count: number
  highest_score: Score | null
  recruitment_status: string
  last_watched_at: string | null
  clubs?: Club | null
}

export type Fixture = {
  id: string
  home_team: string
  away_team: string
  fixture_date: string
  kick_off: string | null
  venue: string | null
  age_group: string | null
  competition: string | null
  allocated_scout: string | null
  status: string
  fixture_reference: string | null
  profiles?: Pick<Profile, 'id' | 'full_name'> | null
}
