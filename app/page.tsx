'use client'
import { useState } from 'react'

const ACCOUNTS: { [key: string]: { name: string; initials: string; role: string } } = {
  'jake.r@newburyfloral.com': { name: 'Jake Rivera', initials: 'JR', role: 'rep' },
  'rosa.m@newburyfloral.com': { name: 'Rosa Martinez', initials: 'RM', role: 'manager' },
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  function handleLogin() {
    const acc = ACCOUNTS[email.toLowerCase()]
    if (!acc) {
      setError('Invalid email. Please try again.')
      return
    }
    setUser(acc)
    window.location.href = '/dashboard'
  }

  if (user) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Welcome, {user.name}!</h1>
        <p>Role: {user.role}</p>
        <button onClick={() => setUser(null)}>Sign out</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '340px', border: '1px solid #eee' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '20px', fontWeight: '500' }}>Newbury Floral Farms</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Sales portal</div>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }} />
        </div>
        {error && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
        <button onClick={handleLogin} style={{ width: '100%', padding: '10px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
          Sign in
        </button>
        <div style={{ fontSize: '11px', color: '#999', marginTop: '12px', textAlign: 'center' }}>
          Try: jake.r@newburyfloral.com or rosa.m@newburyfloral.com
        </div>
      </div>
    </div>
  )
}