'use client'

import { useEffect, useMemo, useState } from 'react'
import { getPlayers } from '@/lib/data'
import type { Player } from '@/lib/types'

export function RecruitmentView({ query }: { query: string }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [sort, setSort] = useState<
    'average_score' | 'full_name' | 'position' | 'recruitment_status'
  >('average_score')

  useEffect(() => {
    getPlayers()
      .then((data) => setPlayers(data as unknown as Player[]))
      .catch(() => {})
  }, [])

  const term = query.toLowerCase().trim()

  const rows = useMemo(
    () =>
      players
        .filter(
          (player) =>
            !term ||
            player.full_name.toLowerCase().includes(term) ||
            (player.position || '').toLowerCase().includes(term) ||
            (player.clubs?.name || '').toLowerCase().includes(term),
        )
        .sort((a, b) =>
          String(b[sort] ?? '').localeCompare(
            String(a[sort] ?? ''),
            undefined,
            { numeric: true },
          ),
        ),
    [players, term, sort],
  )

  return (
    <div className="panel">
      <div className="panelhead">
        <h2>Reports overview · Longlist</h2>

        <div>
          {(
            [
              'average_score',
              'position',
              'recruitment_status',
              'full_name',
            ] as const
          ).map((item) => (
            <button
              key={item}
              className={
                'btn ' + (sort === item ? 'primary' : 'secondary')
              }
              style={{ marginLeft: 6 }}
              onClick={() => setSort(item)}
            >
              {item.replaceAll('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Position</th>
              <th>Club</th>
              <th>Average</th>
              <th>Reports</th>
              <th>Highest</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((player) => (
              <tr key={player.id}>
                <td>
                  <strong>{player.full_name}</strong>
                </td>

                <td>{player.position || '—'}</td>

                <td>{player.clubs?.name || '—'}</td>

                <td>{player.average_score ?? '—'}</td>

                <td>{player.report_count}</td>

                <td>{player.highest_score ?? '—'}</td>

                <td>
                  <span className="badge">
                    {player.recruitment_status}
                  </span>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
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
