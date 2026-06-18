'use client'
import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  async function handleLogin() {
    setStatus('Trying to log in...')
    
    const res = await fetch('https://xmljewzdsqqsgselwubn.supabase.co/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbGpld3pkc3Fxc2dzZWx3dWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NzQzNjEsImV4cCI6MjA5NzE1MDM2MX0.XdKzz5sKoZ9HiBlBXSNFscdTp8ZU4dyAaOmvqkEQa60'
      },
      body: JSON.stringify({ email: email.toLowerCase(), password })
    })

    const data = await res.json()
    
    if (data.access_token) {
      const role = data.user?.user_metadata?.role
      setStatus('Login successful! Role: ' + role)
      setTimeout(() => {
        if (role === 'manager') {
          window.location.href = '/manager'
        } else {
          window.location.href = '/dashboard'
        }
      }, 1000)
    } else {
      setStatus('Login failed: ' + JSON.stringify(data))
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f8' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '340px', border: '0.5px solid #e5e5e3' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '22px', fontWeight: '600', color: '#111' }}>Newbury Floral Farms</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Sales portal</div>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '13px', color: '#111' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '13px', color: '#111' }} />
        </div>
        {status && <div style={{ fontSize: '12px', marginBottom: '12px', padding: '8px', borderRadius: '6px', background: '#f0f0ee', color: '#333' }}>{status}</div>}
        <button onClick={handleLogin} style={{ width: '100%', padding: '10px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
          Sign in
        </button>
      </div>
    </div>
  )
}