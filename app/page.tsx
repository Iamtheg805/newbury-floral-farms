'use client'
import { useState } from 'react'
import { supabase } from './supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (authError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'manager') {
        window.location.href = '/manager'
      } else {
        window.location.href = '/dashboard'
      }
    }

    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f8' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '340px', border: '0.5px solid #e5e5e3' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '20px', fontWeight: '500', color: '#111' }}>Newbury Floral Farms</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Sales portal</div>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '13px', color: '#111' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '13px', color: '#111' }} />
        </div>
        {error && <div style={{ color: '#A32D2D', fontSize: '12px', marginBottom: '10px', background: '#FCEBEB', padding: '8px', borderRadius: '6px' }}>{error}</div>}
        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '10px', background: loading ? '#888' : '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <div style={{ fontSize: '11px', color: '#999', marginTop: '12px', textAlign: 'center' }}>
          Contact your manager if you need access.
        </div>
      </div>
    </div>
  )
}