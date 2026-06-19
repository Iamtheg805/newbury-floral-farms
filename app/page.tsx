'use client'
export default function Home() {
  function handleLogin() {
    const e = (document.getElementById('email') as HTMLInputElement).value
    const p = (document.getElementById('password') as HTMLInputElement).value
    if (!e || !p) { alert('Enter email and password'); return }
    fetch('https://xmljewzdsqqsgselwubn.supabase.co/auth/v1/token?grant_type=password', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbGpld3pkc3Fxc2dzZWx3dWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NzQzNjEsImV4cCI6MjA5NzE1MDM2MX0.XdKzz5sKoZ9HiBlBXSNFscdTp8ZU4dyAaOmvqkEQa60' }, body: JSON.stringify({ email: e.toLowerCase(), password: p }) })
      .then(r => r.json())
      .then(d => {
        if (d.access_token) {
          const role = d.user?.user_metadata?.role || 'rep'
          const name = d.user?.user_metadata?.full_name || e.split('@')[0]
          const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase()
          localStorage.setItem('user_name', name)
          localStorage.setItem('user_initials', initials)
          localStorage.setItem('user_role', role)
          localStorage.setItem('user_id', d.user?.id || '')
          window.location.href = role === 'manager' ? '/manager' : '/dashboard'
        } else {
          alert('Invalid email or password')
        }
      })
      .catch(err => alert('Error: ' + err.message))
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f8' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '340px', border: '0.5px solid #e5e5e3', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#111' }}>Newbury Floral Farms</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Sales portal — sign in to continue</div>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Email address</label>
          <input id="email" type="email" placeholder="your@email.com" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '13px', color: '#111', outline: 'none' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Password</label>
          <input id="password" type="password" placeholder="••••••••" onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '13px', color: '#111', outline: 'none' }} />
        </div>
        <button type="button" onClick={handleLogin} style={{ width: '100%', padding: '10px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
          Sign in
        </button>
        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '14px', textAlign: 'center' }}>
          Contact your manager if you need access.
        </div>
      </div>
    </div>
  )
}