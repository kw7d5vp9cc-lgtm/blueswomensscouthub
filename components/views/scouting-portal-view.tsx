
'use client'

import { useEffect, useState } from 'react'
import { getFixtures, getPlayers } from '@/lib/data'
import { supabase } from '@/lib/supabase/client'
import type { Fixture, Player, Score } from '@/lib/types'

const scores: Score[] = ['1', '2', '3', '4']

export function ScoutingPortalView() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    fixture_id: '',
    player_id: '',
    score: '3' as Score,
    technical: '3' as Score,
    tactical: '3' as Score,
    physical: '3' as Score,
    mentality: '3' as Score,
    special: '',
    strengths: '',
    development: '',
  })

  useEffect(() => {
    Promise.all([getPlayers(), getFixtures()])
      .then(([playerData, fixtureData]) => {
        setPlayers(playerData as unknown as Player[])
        setFixtures(fixtureData as unknown as Fixture[])
      })
      .catch((error) => setMessage(error.message))
  }, [])

  async function submitReport() {
    if (!supabase) {
      setMessage('Supabase is not configured.')
      return
    }

    if (!form.player_id || !form.fixture_id || !form.special) {
      setMessage(
        'Please select a player, fixture and Yes/No answer.',
      )
      return
    }

    setSaving(true)

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError || !authData.user) {
        throw new Error('Please sign in before submitting a report.')
      }

      const { data: report, error: reportError } =
        await supabase
          .from('reports')
          .insert({
            fixture_id: form.fixture_id,
            player_id: form.player_id,
            scout_id: authData.user.id,
            score: form.score,
          })
          .select('id')
          .single()

      if (reportError || !report) {
        throw new Error(
          reportError?.message || 'Could not create the report.',
        )
      }

      const { error: assessmentError } = await supabase
        .from('report_assessments')
        .insert({
          report_id: report.id,
          technical_score: form.technical,
          tactical_score: form.tactical,
          physical_score: form.physical,
          mentality_score: form.mentality,
          showed_something_special: form.special === 'yes',
          strengths: form.strengths || null,
          development_areas: form.development || null,
        })

      if (assessmentError) {
        throw new Error(
          `Report saved, but assessment failed: ${assessmentError.message}`,
        )
      }

      setMessage('Report submitted successfully.')
      setOpen(false)
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Submission failed.',
      )
    } finally {
      setSaving(false)
    }
  }

  function ScoreField({
    label,
    field,
  }: {
    label: string
    field: 'score' | 'technical' | 'tactical' | 'physical' | 'mentality'
  }) {
    return (
      <div className="field">
        <label>{label}</label>
        <select
          value={form[field]}
          onChange={(e) =>
            setForm({
              ...form,
              [field]: e.target.value as Score,
            })
          }
        >
          {scores.map((score) => (
            <option key={score} value={score}>
              {score}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid2">
        <div className="panel">
          <div className="panelhead">
            <h2>Scout home</h2>
          </div>

          <div className="grid grid3">
            <div className="stat">
              <strong>{fixtures.length}</strong>
              <span className="muted">Fixtures</span>
            </div>

            <div className="stat">
              <strong>{players.length}</strong>
              <span className="muted">Players</span>
            </div>

            <div className="stat">
              <strong>1–4</strong>
              <span className="muted">Scoring system</span>
            </div>
          </div>

          <button
            className="btn primary"
            style={{ width: '100%', marginTop: 18 }}
            onClick={() => {
              setMessage('')
              setOpen(true)
            }}
          >
            + Add report
          </button>
        </div>

        <div className="panel">
          <div className="panelhead">
            <h2>Report workflow</h2>
          </div>

          <p className="muted">
            Select fixture → Select player → Assess performance →
            Record evidence → Submit report.
          </p>

          <p className="muted">
            Scores use a 1–4 frequency-of-completion scale.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={
            message.includes('successfully')
              ? 'notice'
              : 'notice error'
          }
          style={{ marginTop: 18 }}
        >
          {message}
        </div>
      )}

      {open && (
        <div className="overlay">
          <div className="modal">
            <h2>Add scouting report</h2>

            <div className="formgrid">
              <div className="field">
                <label>Fixture</label>
                <select
                  value={form.fixture_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fixture_id: e.target.value,
                    })
                  }
                >
                  <option value="">Select fixture</option>

                  {fixtures.map((fixture) => (
                    <option key={fixture.id} value={fixture.id}>
                      {fixture.fixture_reference ||
                        fixture.fixture_date}
                      {' · '}
                      {fixture.home_team} v {fixture.away_team}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Player</label>
                <select
                  value={form.player_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      player_id: e.target.value,
                    })
                  }
                >
                  <option value="">Select player</option>

                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.full_name}
                      {player.date_of_birth
                        ? ` · ${player.date_of_birth}`
                        : ''}
                    </option>
                  ))}
                </select>
              </div>

              <ScoreField label="Overall score" field="score" />
              <ScoreField label="Technical" field="technical" />
              <ScoreField label="Tactical" field="tactical" />
              <ScoreField label="Physical" field="physical" />
              <ScoreField label="Mentality" field="mentality" />

              <div className="field">
                <label>
                  Did the player show something special?
                </label>

                <select
                  value={form.special}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      special: e.target.value,
                    })
                  }
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="field full">
                <label>Strengths and supporting evidence</label>
                <textarea
                  value={form.strengths}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      strengths: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field full">
                <label>Development areas</label>
                <textarea
                  value={form.development}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      development: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="actions">
              <button
                className="btn secondary"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="btn primary"
                onClick={submitReport}
                disabled={saving}
              >
                {saving ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
