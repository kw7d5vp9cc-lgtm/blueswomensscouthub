'use client'

import { useEffect, useMemo, useState } from 'react'
import { getFixtures, getProfiles } from '@/lib/data'
import { supabase } from '@/lib/supabase/client'
import type { Fixture, Profile } from '@/lib/types'

const emptyForm = {
  home_team: '',
  away_team: '',
  fixture_date: '',
  kick_off: '',
  venue: '',
  age_group: '',
  competition: '',
  fixture_reference: '',
  allocated_scout: '',
}

export function FixturesView({ query }: { query: string }) {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')

  const load = async () => {
    const [fixtureData, profileData] = await Promise.all([
      getFixtures(),
      getProfiles(),
    ])

    setFixtures(fixtureData as unknown as Fixture[])
    setProfiles(profileData as Profile[])
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message))
  }, [])

  const term = query.toLowerCase().trim()

  const rows = useMemo(
    () =>
      fixtures.filter(
        (fixture) =>
          !term ||
          fixture.home_team.toLowerCase().includes(term) ||
          fixture.away_team.toLowerCase().includes(term) ||
          (fixture.venue || '').toLowerCase().includes(term) ||
          (fixture.fixture_reference || '').toLowerCase().includes(term),
      ),
    [fixtures, term],
  )

  async function saveFixture() {
    if (!supabase) {
      setMessage('Supabase is not configured.')
      return
    }

    if (!form.home_team || !form.away_team || !form.fixture_date) {
      setMessage('Home team, away team and date are required.')
      return
    }

    const payload = {
      home_team: form.home_team,
      away_team: form.away_team,
      fixture_date: form.fixture_date,
      kick_off: form.kick_off || null,
      venue: form.venue || null,
      age_group: form.age_group || null,
      competition: form.competition || null,
      fixture_reference: form.fixture_reference || null,
      allocated_scout: form.allocated_scout || null,
      status: form.allocated_scout ? 'allocated' : 'available',
    }

    const { error } = await supabase.from('fixtures').insert(payload)

    if (error) {
      setMessage(error.message)
      return
    }

    setOpen(false)
    setForm(emptyForm)
    setMessage('Fixture created successfully.')
    await load()
  }

  return (
    <>
      <div className="panel">
        <div className="panelhead">
          <h2>Upcoming fixtures</h2>

          <button
            className="btn primary"
            onClick={() => {
              setMessage('')
              setOpen(true)
            }}
          >
            + Add fixture
          </button>
        </div>

        {message && (
          <div
            className={
              message.includes('successfully')
                ? 'notice'
                : 'notice error'
            }
          >
            {message}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Fixture</th>
                <th>Time</th>
                <th>Age</th>
                <th>Venue</th>
                <th>Competition</th>
                <th>Scout</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((fixture) => (
                <tr key={fixture.id}>
                  <td>{fixture.fixture_date}</td>

                  <td>
                    {fixture.fixture_reference || '—'}
                  </td>

                  <td>
                    <strong>{fixture.home_team}</strong>
                    {' v '}
                    <strong>{fixture.away_team}</strong>
                  </td>

                  <td>
                    {fixture.kick_off?.slice(0, 5) || '—'}
                  </td>

                  <td>{fixture.age_group || '—'}</td>

                  <td>{fixture.venue || '—'}</td>

                  <td>{fixture.competition || '—'}</td>

                  <td>
                    {fixture.profiles?.full_name || (
                      <span className="badge">
                        {fixture.status}
                      </span>
                    )}
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
            <h2>Add fixture</h2>

            <div className="formgrid">
              <div className="field">
                <label>Home team</label>
                <input
                  value={form.home_team}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      home_team: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Away team</label>
                <input
                  value={form.away_team}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      away_team: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Date</label>
                <input
                  type="date"
                  value={form.fixture_date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fixture_date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Kick-off</label>
                <input
                  type="time"
                  value={form.kick_off}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      kick_off: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Age group</label>
                <input
                  placeholder="e.g. U14"
                  value={form.age_group}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      age_group: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Competition</label>
                <input
                  value={form.competition}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      competition: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Venue</label>
                <input
                  value={form.venue}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      venue: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Fixture reference</label>
                <input
                  placeholder="e.g. FIX-2026-1002-U14-001"
                  value={form.fixture_reference}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fixture_reference: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field full">
                <label>Assign scout</label>

                <select
                  value={form.allocated_scout}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      allocated_scout: e.target.value,
                    })
                  }
                >
                  <option value="">
                    Available / unassigned
                  </option>

                  {profiles.map((profile) => (
                    <option
                      key={profile.id}
                      value={profile.id}
                    >
                      {profile.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="actions">
              <button
                className="btn secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              <button
                className="btn primary"
                onClick={saveFixture}
              >
                Create fixture
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
