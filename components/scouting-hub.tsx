'use client'

import { useState } from 'react'
import type { NavItem } from '@/lib/types'
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
      </aside>

      <section className="main">
        <header className="top">
          <h1>{active}</h1>

          <input
            className="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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

          {active === 'Fixtures' && <FixturesView query={query} />}

          {active === 'Recruitment' && (
            <RecruitmentView query={query} />
          )}

          {active === 'Administration' && <AdministrationView />}
        </main>
      </section>
    </div>
  )
}
