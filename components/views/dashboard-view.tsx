'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { NavItem } from '@/lib/types'

export function DashboardView({
  onNavigate,
}: {
  onNavigate: (item: NavItem) => void
}) {
  const [upcomingActions, setUpcomingActions] = useState<any[]>([])
  const [actionsLoading, setActionsLoading] = useState(true)
useEffect(() => {
  async function loadUpcomingActions() {
    if (!supabase) {
      setActionsLoading(false)
      return
    }

    const today = new Date().toISOString().slice(0, 10)

    const { data, error } = await supabase
      .from('recruitment_actions')
      .select(`
        id,
        next_contact_date,
        next_contact_action,
        action_type,
        players (
          id,
          full_name,
          recruitment_status
        ),
        profiles!recruitment_actions_created_by_fkey (
          full_name
        )
      `)
      .not('next_contact_date', 'is', null)
      .gte('next_contact_date', today)
      .order('next_contact_date', { ascending: true })
      .limit(10)

    if (error) {
      console.error('Unable to load recruitment actions:', error.message)
      setUpcomingActions([])
    } else {
      setUpcomingActions(data || [])
    }

    setActionsLoading(false)
  }

  loadUpcomingActions()
}, [])
  return (
    <div className="grid grid2">
      <div className="panel">
        <div className="panelhead">
          <h2>Recruitment overview</h2>
        </div>

        <div className="grid grid3">
          <div className="stat">
            <strong>Live</strong>
            <span className="muted">Supabase player data</span>
          </div>

          <div className="stat">
            <strong>1–4</strong>
            <span className="muted">Frequency of completion scoring</span>
          </div>

          <div className="stat">
            <strong>Blue</strong>
            <span className="muted">Talent pathway</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panelhead">
          <h2>Quick actions</h2>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <button
            className="btn primary"
            onClick={() => onNavigate('Scouting Portal')}
          >
            Add report
          </button>

          <button
            className="btn secondary"
            onClick={() => onNavigate('Fixtures')}
          >
            Manage fixtures
          </button>

          <button
            className="btn secondary"
            onClick={() => onNavigate('Player Portal')}
          >
            Find player
          </button>
        </div>
      </div>
<div className="panel">
  <div className="panelhead">
    <div>
      <h2>Upcoming recruitment actions</h2>
      <span className="muted">
        Next recruitment follow-ups
      </span>
    </div>

    <span className="badge">{upcomingActions.length} upcoming</span>
  </div>

  {actionsLoading && (
    <p className="muted">Loading recruitment actions...</p>
  )}

  {!actionsLoading && upcomingActions.length === 0 && (
    <p className="muted">No upcoming recruitment actions.</p>
  )}

  {!actionsLoading && upcomingActions.length > 0 && (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Player</th>
            <th>Next action</th>
            <th>Status</th>
            <th>Created by</th>
          </tr>
        </thead>

        <tbody>
          {upcomingActions.map((action) => (
            <tr key={action.id}>
              <td>
                <strong>{action.next_contact_date}</strong>
              </td>

              <td>{action.players?.full_name || '—'}</td>

              <td>
                {action.next_contact_action ||
                  action.action_type ||
                  '—'}
              </td>

              <td>
                <span className="badge">
                  {action.players?.recruitment_status || '—'}
                </span>
              </td>

              <td>{action.profiles?.full_name || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div> 
    </div>
  )
}
