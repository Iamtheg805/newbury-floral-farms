'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../useAuth'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', active: false },
  { label: 'Flower Availability', href: '/flowers', active: false },
  { label: 'New Order', href: '/orders', active: false },
  { label: 'My Customers', href: '/customers', active: false },
  { label: 'Quotes', href: '/quotes', active: false },
  { label: 'My Commission', href: '/commission', active: true },
]

type LeaderboardRep = { id: string; name: string; revenue: number; orders: number; rate: number; commission: number }

const colors = [
  { bg: '#FAEEDA', tc: '#633806' },
  { bg: '#F1EFE8', tc: '#444441' },
  { bg: '#E6F1FB', tc: '#0C447C' },
  { bg: '#EEEDFE', tc: '#3C3489' },
  { bg: '#E1F5EE', tc: '#085041' },
]

export default function Commission() {
  const authReady = useAuth()
  const [userName, setUserName] = useState('there')
  const [userInitials, setUserInitials] = useState('?')
  const [leaderboard, setLeaderboard] = useState<LeaderboardRep[]>([])
  const [loading, setLoading] = useState(true)
  const [sliderVal, setSliderVal] = useState(4000)

  useEffect(() => {
    const name = localStorage.getItem('user_name') || 'there'
    const initials = localStorage.getItem('user_initials') || name.split(' ').map(w => w[0]).join('').toUpperCase() || '?'
    setUserName(name)
    setUserInitials(initials)
    fetch('/api/leaderboard').then(r => r.json()).then(data => { setLeaderboard(data.leaderboard || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (!authReady) return null

  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
  const myEntry = leaderboard.find(r => r.id === userId)
  const myRevenue = myEntry?.revenue || 0
  const myCommission = myEntry?.commission || 0
  const myRate = myEntry?.rate || 5

  let nextTierAt = 20000
  let nextTierRate = 7
  if (myRevenue >= 20000) { nextTierAt = 40000; nextTierRate = 10 }
  if (myRevenue >= 40000) { nextTierAt = 40000; nextTierRate = 10 }
  const remainingToNextTier = Math.max(nextTierAt - myRevenue, 0)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#f9f9f8' }}>
      <div style={{ width: '200px', background: '#ffffff', borderRight: '0.5px solid #e5e5e3', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #e5e5e3' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>Newbury Floral Farms</div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Sales portal</div>
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e5e3', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#E6F1FB', color: '#0C447C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '500' }}>{userInitials}</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>{userName}</div>
            <div style={{ fontSize: '10px', color: '#888' }}>Sales Rep</div>
          </div>
        </div>
        <div style={{ padding: '4px 0' }}>
          {navItems.map(item => (
            <a key={item.label} href={item.href} style={{ display: 'block', padding: '9px 16px', fontSize: '12px', color: item.active ? '#185FA5' : '#444', fontWeight: item.active ? '500' : '400', borderLeft: item.active ? '2px solid #185FA5' : '2px solid transparent', background: item.active ? '#f0f7ff' : 'transparent', textDecoration: 'none' }}>{item.label}</a>
          ))}
        </div>
        <a href="/scan" style={{ padding: '9px 16px', fontSize: '12px', color: '#444', textDecoration: 'none', display: 'block', borderTop: '0.5px solid #e5e5e3', marginTop: '8px' }}>Scan Station</a>
        <a href="/" style={{ marginTop: 'auto', padding: '14px 16px', borderTop: '0.5px solid #e5e5e3', fontSize: '12px', color: '#888', textDecoration: 'none', display: 'block' }}>Sign out</a>
      </div>
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>My Commission -- this month</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1rem' }}>
          {[
            { label: 'Revenue this month', value: loading ? '...' : `$${myRevenue.toLocaleString()}`, sub: 'All finalized orders', subColor: '#3B6D11' },
            { label: 'Commission earned', value: loading ? '...' : `$${myCommission.toLocaleString()}`, sub: `${myRate}% tier`, subColor: '#185FA5' },
            { label: 'Current tier', value: `${myRate}%`, sub: myRevenue >= 20000 ? (myRevenue >= 40000 ? '$40k+ range' : '$20k-$40k range') : '$0-$20k range', subColor: '#666' },
            { label: 'To next tier', value: remainingToNextTier === 0 ? 'Maxed!' : `$${remainingToNextTier.toLocaleString()}`, sub: remainingToNextTier === 0 ? `You are at ${nextTierRate}%` : `Unlocks ${nextTierRate}%`, subColor: '#854F0B' },
          ].map(m => (
            <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#111' }}>{m.value}</div>
              <div style={{ fontSize: '11px', color: m.subColor, marginTop: '3px' }}>{m.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Commission tiers -- your progress</div>
            {[
              { label: '$0-$20k', rate: '5%', min: 0, max: 20000 },
              { label: '$20k-$40k', rate: '7%', min: 20000, max: 40000 },
              { label: '$40k+', rate: '10%', min: 40000, max: 60000 },
            ].map(t => {
              const active = myRevenue >= t.min && myRevenue < t.max
              const done = myRevenue >= t.max
              const pct = done ? 100 : active ? Math.round((myRevenue - t.min) / (t.max - t.min) * 100) : 0
              const color = done ? '#3B6D11' : active ? '#185FA5' : '#854F0B'
              const status = done ? 'Done' : active ? 'You are here' : `$${(t.min - myRevenue).toLocaleString()} away`
              const statusBg = done ? '#EAF3DE' : active ? '#E6F1FB' : '#FAEEDA'
              return (
                <div key={t.label} style={{ padding: '8px', borderRadius: '8px', marginBottom: '6px', background: active ? '#E6F1FB' : 'transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: active ? '500' : '400', color: active ? '#0C447C' : '#444' }}>{t.label} · {t.rate}</span>
                    <span style={{ background: statusBg, color, padding: '1px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{status}</span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '99px', background: '#f0f0ee', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: '99px', background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Commission calculator</div>
            <div style={{ fontSize: '12px', color: '#444', marginBottom: '6px' }}>Order value: <strong style={{ color: '#111' }}>${sliderVal.toLocaleString()}</strong></div>
            <input type="range" min={500} max={20000} step={100} value={sliderVal} onChange={e => setSliderVal(parseInt(e.target.value))} style={{ width: '100%', marginBottom: '14px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { label: `At ${myRate}% (now)`, value: `$${Math.round(sliderVal * (myRate / 100)).toLocaleString()}`, color: '#185FA5' },
                { label: `At ${nextTierRate}% (next)`, value: `$${Math.round(sliderVal * (nextTierRate / 100)).toLocaleString()}`, color: '#3B6D11' },
                { label: 'Difference', value: `+$${Math.round(sliderVal * ((nextTierRate - myRate) / 100)).toLocaleString()}`, color: '#854F0B' },
              ].map(m => (
                <div key={m.label} style={{ background: '#f9f9f8', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Leaderboard -- this month</div>
          {loading ? <div style={{ fontSize: '12px', color: '#888', padding: '1rem 0' }}>Loading...</div> : leaderboard.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#888', padding: '1rem 0' }}>No reps found yet.</div>
          ) : leaderboard.map((r, i) => {
            const isMe = r.id === userId
            const c = colors[i % colors.length]
            const initials = r.name.split(' ').map(w => w[0]).join('').toUpperCase()
            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', marginBottom: '4px', background: isMe ? '#E6F1FB' : 'transparent' }}>
                <div style={{ width: '22px', fontSize: '12px', fontWeight: '500', color: i === 0 ? '#BA7517' : i === 1 ? '#888' : '#666' }}>{i + 1}</div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: c.bg, color: c.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '500' }}>{initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: isMe ? '#0C447C' : '#111' }}>{r.name}{isMe ? ' (you)' : ''}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>${r.revenue.toLocaleString()} · {r.rate}% tier</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#3B6D11' }}>${r.commission.toLocaleString()}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}