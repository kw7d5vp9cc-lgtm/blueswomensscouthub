'use client'

import { useEffect, useMemo, useState } from 'react'
import { getPlayers } from '@/lib/data'
import type { Player } from '@/lib/types'
import { configured } from '@/lib/supabase/client'

export function PlayerPortalView({ query }: { query: string }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    getPlayers()
      .then((data) => setPlayers(data as unknown as Player[]))
      .catch((err) => setError(err.message))
  }, [])

  const term = query.toLowerCase().trim()

  const rows = useMemo(
    () =>
      players.filter(
        (player) =>
          !term ||
          player.full_name.toLowerCase().includes(term) ||
          (player.position || '').toLowerCase().includes(term) ||
          (player.clubs?.name || '').toLowerCase().includes(term),
      ),
    [players, term],
  )

  return (
    <div className="panel">
      <div className="panelhead">
        <h2>Player search</h2>
        <span className="badge">{rows.length} players</span>
      </div>

      {!configured && (
        <div className="notice error">
          Supabase needs to be connected before using live data.
        </div>
      )}

      {error && <div className="notice error">{error}</div>}

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>DOB</th>
              <th>Position</th>
              <th>Foot</th>
              <th>Club</th>
              <th>Average</th>
              <th>Reports</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((player) => (
              <tr key={player.id}>
                <td>
                  <strong>{player.full_name}</strong>
                </td>
                <td>{player.date_of_birth || '—'}</td>
                <td>{player.position || '—'}</td>
                <td>{player.preferred_foot || '—'}</td>
                <td>{player.clubs?.name || '—'}</td>
                <td>{player.average_score ?? '—'}</td>
                <td>{player.report_count}</td>
                <td>
                  <span className="badge">
                    {player.recruitment_status}
                  </span>
                </td>
              </tr>
            ))}

            {rows.length === 0 && configured && !error && (
              <tr>
                <td colSpan={8} className="muted">
                  No players found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
