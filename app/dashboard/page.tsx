'use client'
import { useState } from 'react'
import { supabase } from '../supabase.js'

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
      const role = data.user.user_metadata?.role
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', data.user.id)
        .single()

      const name = profile?.full_name || email.split('@')[0]
      const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase()

      localStorage.setItem('user_name', name)
      localStorage.setItem('user_initials', initials)
      localStorage.setItem('user_email', email.toLowerCase())
      localStorage.setItem('user_role', role || 'rep')

      if (role === 'manager') {
        window.location.href = '/manager'
      } else {
        window.location.href = '/dashboard'
      }
    }

    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f8' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '340px', border: '0.5px solid #e5e5e3', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '22px', fontWeight: '600', color: '#111' }}>Newbury Floral Farms</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Sales portal — sign in to continue</div>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '13px', color: '#111', outline: 'none' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '13px', color: '#111', outline: 'none' }} />
        </div>
        {error && (
          <div style={{ color: '#A32D2D', fontSize: '12px', marginBottom: '12px', background: '#FCEBEB', padding: '8px 12px', borderRadius: '6px' }}>
            {error}
          </div>
        )}
        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '10px', background: loading ? '#aaa' : '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '14px', textAlign: 'center' }}>
          Contact your manager if you need access.
        </div>
      </div>
    </div>
  )
}