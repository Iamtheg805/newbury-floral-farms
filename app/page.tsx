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
          alert('Got token, about to redirect, role is: ' + role)
          try {
            localStorage.setItem('user_name', d.user?.user_metadata?.full_name || e.split('@')[0])
            localStorage.setItem('user_role', role)
          } catch (storageErr) {
            alert('Storage error: ' + storageErr)
          }
          alert('About to redirect now to: ' + (role === 'manager' ? '/manager' : '/dashboard'))
          window.location.href = role === 'manager' ? '/manager' : '/dashboard'
        } else {
          alert('Invalid email or password')
        }
      })
      .catch(err => alert('Error: ' + err.message))
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f8' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '340px', border: '0.5px solid #e5e5e3' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '22px', fontWeight: 600 }}>Newbury Floral Farms</div>
          <div style={{ fontSize: '12px', color: '#888' }}>Sales portal</div>
        </div>
        <input id="email" type="email" placeholder="Email" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e5e3', marginBottom: '10px', color: '#111' }} />
        <input id="password" type="password" placeholder="Password" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e5e3', marginBottom: '16px', color: '#111' }} />
        <button type="button" onClick={handleLogin} style={{ width: '100%', padding: '10px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Sign in</button>
      </div>
    </div>
  )
}