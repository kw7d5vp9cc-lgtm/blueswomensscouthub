'use client'

import { useEffect, useMemo, useState } from 'react'
import { getPlayers } from '@/lib/data'
import { supabase } from '@/lib/supabase/client'
import type { Player } from '@/lib/types'

const emptyForm = {
  full_name: '',
  date_of_birth: '',
  position: '',
  preferred_foot: '',
}

export function PlayerPortalView({ query }: { query: string }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  async function load() {
    try {
      const data = await getPlayers()
      setPlayers(data as unknown as Player[])
    } catch (e: any) {
      setError(e.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const term = query.toLowerCase().trim()

  const rows = useMemo(
    () =>
      players.filter(
        (p) =>
          !term ||
          p.full_name.toLowerCase().includes(term) ||
          (p.position || '').toLowerCase().includes(term) ||
          (p.clubs?.name || '').toLowerCase().includes(term),
      ),
    [players, term],
  )

  async function savePlayer() {
    setMessage('')
    setError('')

    if (!supabase) {
      setError('Supabase is not configured.')
      return
    }

    if (!form.full_name.trim() || !form.date_of_birth) {
      setError('Player name and date of birth are required.')
      return
    }

    const normalizedName = form.full_name.trim()

    const duplicate = players.find(
      (player) =>
        player.full_name.trim().toLowerCase() ===
          normalizedName.toLowerCase() &&
        player.date_of_birth === form.date_of_birth,
    )

    if (duplicate) {
      setError(
        'A player with this name and date of birth already exists.',
      )
      return
    }

    const { error: insertError } = await supabase
      .from('players')
      .insert({
        full_name: normalizedName,
        date_of_birth: form.date_of_birth,
        position: form.position || null,
        preferred_foot: form.preferred_foot || null,
      })

    if (insertError) {
      setError(insertError.message)
      return
    }

    setForm(emptyForm)
    setOpen(false)
    setMessage('Player created successfully.')
    await load()
  }

  return (
    <>
      <div className="panel">
        <div className="panelhead">
          <h2>Player search</h2>

          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <span className="badge">{rows.length} players</span>

            <button
              className="btn primary"
              onClick={() => {
                setError('')
                setMessage('')
                setOpen(true)
              }}
            >
              + Add player
            </button>
          </div>
        </div>

        {message && <div className="notice">{message}</div>}

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
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted">
                    No players found.
                  </td>
                </tr>
              )}

              {rows.map((player) => (
                <tr key={player.id}>
                  <td>
  <button
    type="button"
    onClick={() => setSelectedPlayer(player)}
    style={{
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      fontWeight: 700,
      color: '#034694',
      textDecoration: 'underline',
    }}
  >
    {player.full_name}
  </button>
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
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="overlay">
          <div className="modal">
            <h2>Add player</h2>

            <div className="formgrid">
              <div className="field">
                <label>Full name *</label>

                <input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      full_name: e.target.value,
                    })
                  }
                  placeholder="Player full name"
                />
              </div>

              <div className="field">
                <label>Date of birth *</label>

                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date_of_birth: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Position</label>

                <select
                  value={form.position}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      position: e.target.value,
                    })
                  }
                >
                  <option value="">Select position</option>
                  <option value="GK">GK</option>
                  <option value="CB">CB</option>
                  <option value="FB">FB</option>
                  <option value="CM">CM</option>
                  <option value="AM">AM</option>
                  <option value="W">W</option>
                  <option value="CF">CF</option>
                </select>
              </div>

              <div className="field">
                <label>Preferred foot</label>

                <select
                  value={form.preferred_foot}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      preferred_foot: e.target.value,
                    })
                  }
                >
                  <option value="">Select...</option>
                  <option value="Right">Right</option>
                  <option value="Left">Left</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            <div className="actions">
              <button
                className="btn secondary"
                onClick={() => {
                  setOpen(false)
                  setForm(emptyForm)
                  setError('')
                }}
              >
                Cancel
              </button>

              <button
                className="btn primary"
                onClick={savePlayer}
              >
                Create player
              </button>
            </div>
          </div>
        </div>
      )}
          {selectedPlayer && (
        <div className="overlay">
          <div className="modal">
            <div className="panelhead">
              <div>
                <h2>{selectedPlayer.full_name}</h2>
                <span className="muted">Player profile</span>
              </div>

              <button
                className="btn secondary"
                onClick={() => setSelectedPlayer(null)}
              >
                Close
              </button>
            </div>

            <div className="grid grid3">
              <div className="stat">
                <span className="muted">Position</span>
                <strong>{selectedPlayer.position || '—'}</strong>
              </div>

              <div className="stat">
                <span className="muted">Date of birth</span>
                <strong>{selectedPlayer.date_of_birth || '—'}</strong>
              </div>

              <div className="stat">
                <span className="muted">Preferred foot</span>
                <strong>{selectedPlayer.preferred_foot || '—'}</strong>
              </div>
            </div>

            <div
              className="grid grid3"
              style={{ marginTop: 20 }}
            >
              <div className="stat">
                <span className="muted">Average score</span>
                <strong>{selectedPlayer.average_score ?? '—'}</strong>
              </div>

              <div className="stat">
                <span className="muted">Reports</span>
                <strong>{selectedPlayer.report_count}</strong>
              </div>

              <div className="stat">
                <span className="muted">Highest score</span>
                <strong>{selectedPlayer.highest_score ?? '—'}</strong>
              </div>
            </div>

            <div className="panel" style={{ marginTop: 20 }}>
              <div className="panelhead">
                <h2>Recruitment status</h2>
              </div>

              <span className="badge">
                {selectedPlayer.recruitment_status}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
