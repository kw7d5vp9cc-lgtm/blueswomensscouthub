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

  async function load() {
    try {
      const [playerData, fixtureData] = await Promise.all([
        getPlayers(),
        getFixtures(),
      ])

      setPlayers(playerData as unknown as Player[])
      setFixtures(fixtureData as unknown as Fixture[])
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function updatePlayerSummary(playerId: string) {
    if (!supabase) return

    const { data: reports, error } = await supabase
      .from('reports')
      .select('score, submitted_at')
      .eq('player_id', playerId)
      .order('submitted_at', { ascending: false })

    if (error || !reports || reports.length === 0) {
      return
    }

    const numericScores = reports
      .map((report) => Number(report.score))
      .filter((score) => !Number.isNaN(score))

    if (numericScores.length === 0) return

    const latestScore = String(numericScores[0]) as Score

    const averageScore =
      numericScores.reduce((total, score) => total + score, 0) /
      numericScores.length

    const highestScore = String(
      Math.max(...numericScores),
    ) as Score

    await supabase
      .from('players')
      .update({
        latest_score: latestScore,
        average_score: Number(averageScore.toFixed(2)),
        report_count: numericScores.length,
        highest_score: highestScore,
        last_watched_at: new Date().toISOString(),
      })
      .eq('id', playerId)
  }

  async function submit() {
    setMessage('')

    if (!supabase) {
      setMessage('Supabase is not configured.')
      return
    }

    if (!form.player_id) {
      setMessage('Player is required.')
      return
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessage('You must be signed in to submit a report.')
      return
    }

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        fixture_id: form.fixture_id || null,
        player_id: form.player_id,
        scout_id: user.id,
        score: form.score,
      })
      .select('id')
      .single()

    if (error || !report) {
      setMessage(
        error?.message || 'Report could not be created.',
      )
      return
    }

    const { error: assessmentError } = await supabase
      .from('report_assessments')
      .insert({
        report_id: report.id,
        technical_score: form.technical,
        tactical_score: form.tactical,
        physical_score: form.physical,
        mentality_score: form.mentality,
        showed_something_special:
          form.special === ''
            ? null
            : form.special === 'yes',
        strengths: form.strengths || null,
        development_areas: form.development || null,
      })

    if (assessmentError) {
      setMessage(
        `Report created but assessment failed: ${assessmentError.message}`,
      )
      return
    }

    await updatePlayerSummary(form.player_id)

    setMessage('Report submitted successfully.')
    setOpen(false)

    setForm({
      fixture_id: '',
      player_id: '',
      score: '3',
      technical: '3',
      tactical: '3',
      physical: '3',
      mentality: '3',
      special: '',
      strengths: '',
      development: '',
    })

    await load()
  }

  const ScoreField = ({
    label,
    keyName,
  }: {
    label: string
    keyName:
      | 'score'
      | 'technical'
      | 'tactical'
      | 'physical'
      | 'mentality'
  }) => (
    <div className="field">
      <label>{label}</label>

      <select
        value={form[keyName]}
        onChange={(e) =>
          setForm({
            ...form,
            [keyName]: e.target.value as Score,
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
            style={{
              width: '100%',
              marginTop: 18,
            }}
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
          style={{ marginTop: 18 }}
          className={
            message.includes('successfully')
              ? 'notice'
              : 'notice error'
          }
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
                  <option value="">No fixture selected</option>

                  {fixtures.map((fixture) => (
                    <option
                      key={fixture.id}
                      value={fixture.id}
                    >
                      {fixture.fixture_reference ||
                        fixture.fixture_date}{' '}
                      · {fixture.home_team} v{' '}
                      {fixture.away_team}
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
                    <option
                      key={player.id}
                      value={player.id}
                    >
                      {player.full_name}
                      {player.date_of_birth
                        ? ` · ${player.date_of_birth}`
                        : ''}
                    </option>
                  ))}
                </select>
              </div>

              <ScoreField
                label="Overall score"
                keyName="score"
              />

              <ScoreField
                label="Technical"
                keyName="technical"
              />

              <ScoreField
                label="Tactical"
                keyName="tactical"
              />

              <ScoreField
                label="Physical"
                keyName="physical"
              />

              <ScoreField
                label="Mentality"
                keyName="mentality"
              />

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
                <label>
                  Strengths and supporting evidence
                </label>

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
              >
                Cancel
              </button>

              <button
                className="btn primary"
                onClick={submit}
              >
                Submit report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
