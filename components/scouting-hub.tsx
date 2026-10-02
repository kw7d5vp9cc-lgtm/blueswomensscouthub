'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { NavItem } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'
import { Login } from './login'
import { DashboardView } from './views/dashboard-view'
import { PlayerPortalView } from './views/player-portal-view'
import { ScoutingPortalView } from './views/scouting-portal-view'
import { FixturesView } from './views/fixtures-view'
import { RecruitmentView } from './views/recruitment-view'
import { AdministrationView } from './views/administration-view'

const nav: NavItem[] = [
  'Dashboard',
  'Player Portal',
  'Scouting Portal',
  'Fixtures',
  'Recruitment',
  'Administration',
]

export function ScoutingHub() {
  const [active, setActive] = useState<NavItem>('Dashboard')
  const [query, setQuery] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setCheckingAuth(false)
      return
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setCheckingAuth(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setCheckingAuth(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    if (!supabase) return

    await supabase.auth.signOut()
    setUser(null)
  }

  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <p className="muted">Checking access...</p>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          Chelsea Women
          <small>Scouting Hub</small>
        </div>

        <div className="nav">
          {nav.map((item) => (
            <button
              key={item}
              className={active === item ? 'active' : ''}
              onClick={() => setActive(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div
          style={{
            marginTop: 'auto',
            padding: '20px 12px',
          }}
        >
          <div
            style={{
              color: '#9fc4ef',
              fontSize: 11,
              marginBottom: 10,
              overflowWrap: 'anywhere',
            }}
          >
            {user.email}
          </div>

          <button
            onClick={signOut}
            style={{
              width: '100%',
              border: '1px solid #315579',
              background: 'transparent',
              color: '#ffffff',
              padding: '9px 10px',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <section className="main">
        <header className="top">
          <h1>{active}</h1>

          <input
            className="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search players, clubs, fixtures..."
          />
        </header>

        <main className="content">
          {active === 'Dashboard' && (
            <DashboardView onNavigate={setActive} />
          )}

          {active === 'Player Portal' && (
            <PlayerPortalView query={query} />
          )}

          {active === 'Scouting Portal' && <ScoutingPortalView />}

          {active === 'Fixtures' && (
            <FixturesView query={query} />
          )}

          {active === 'Recruitment' && (
            <RecruitmentView query={query} />
          )}

          {active === 'Administration' && (
            <AdministrationView />
          )}
        </main>
      </section>
    </div>
  )
}
