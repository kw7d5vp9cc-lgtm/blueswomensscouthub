'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!supabase) {
      setMessage('Supabase is not configured.')
      return
    }

    if (!email || !password) {
      setMessage('Please enter your email and password.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage('Email or password is incorrect.')
      setLoading(false)
      return
    }

    window.location.reload()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f6f8fb',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          border: '1px solid #e4e7ec',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 10px 30px rgba(16,24,40,0.08)',
        }}
      >
        <div
          style={{
            background: '#061d3b',
            borderRadius: 12,
            padding: 22,
            marginBottom: 28,
            color: '#ffffff',
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            Chelsea Women
          </div>

          <div
            style={{
              color: '#9fc4ef',
              fontSize: 12,
              fontWeight: 700,
              marginTop: 5,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Scouting Hub
          </div>
        </div>

        <h1
          style={{
            margin: '0 0 8px',
            fontSize: 24,
          }}
        >
          Sign in
        </h1>

        <p
          className="muted"
          style={{
            marginBottom: 24,
          }}
        >
          Sign in with your authorised scouting account.
        </p>

        <form onSubmit={signIn}>
          <div
            className="field"
            style={{ marginBottom: 16 }}
          >
            <label>Email address</label>

            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@club.com"
            />
          </div>

          <div
            className="field"
            style={{ marginBottom: 20 }}
          >
            <label>Password</label>

            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {message && (
            <div className="notice error">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="btn primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p
          className="muted"
          style={{
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          Access is restricted to authorised users.
        </p>
      </div>
    </div>
  )
}
