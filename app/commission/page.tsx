'use client'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', active: false },
  { label: 'Flower Availability', href: '/flowers', active: false },
  { label: 'New Order', href: '/orders', active: false },
  { label: 'My Customers', href: '/customers', active: false },
  { label: 'Quotes', href: '/quotes', active: false },
  { label: 'My Commission', href: '/commission', active: true },
]

const reps = [
  { name: 'Sarah Lee', initials: 'SL', bg: '#FAEEDA', tc: '#633806', revenue: 54200, rate: '10%', confirmed: 3822, pending: 620 },
  { name: 'Mike Kim', initials: 'MK', bg: '#F1EFE8', tc: '#444441', revenue: 48700, rate: '10%', confirmed: 3344, pending: 487 },
  { name: 'Jake Rivera', initials: 'JR', bg: '#E6F1FB', tc: '#0C447C', revenue: 42180, rate: '7%', confirmed: 2953, pending: 612 },
  { name: 'Dana Perez', initials: 'DP', bg: '#EEEDFE', tc: '#3C3489', revenue: 38900, rate: '7%', confirmed: 2723, pending: 0 },
  { name: 'Tom Walsh', initials: 'TW', bg: '#E1F5EE', tc: '#085041', revenue: 29400, rate: '7%', confirmed: 1978, pending: 360 },
]

const achievements = [
  { icon: '⭐', label: 'First $10k month', date: 'Apr 2026', earned: true, bg: '#FAEEDA' },
  { icon: '👥', label: '10 active customers', date: 'May 2026', earned: true, bg: '#EAF3DE' },
  { icon: '🔥', label: '10 day streak', date: 'Jun 2026', earned: true, bg: '#FCEBEB' },
  { icon: '🏆', label: 'Top rep of the month', date: 'Reach #1', earned: false, bg: '#FAEEDA' },
  { icon: '⚡', label: '10% tier unlocked', date: 'Hit $40k', earned: false, bg: '#E6F1FB' },
  { icon: '💰', label: 'First $5k commission', date: 'Hit $5k', earned: false, bg: '#EAF3DE' },
]

const streakDays = [true,true,true,false,true,true,true,true,true,true,true,true,true,true,true]

export default function Commission() {
  const [sliderVal, setSliderVal] = useState(4000)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#f9f9f8' }}>

      {/* Sidebar */}
      <div style={{ width: '200px', background: '#ffffff', borderRight: '0.5px solid #e5e5e3', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #e5e5e3' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>Newbury Floral Farms</div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Sales portal</div>
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e5e3', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#E6F1FB', color: '#0C447C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '500' }}>JR</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>Jake Rivera</div>
            <div style={{ fontSize: '10px', color: '#888' }}>Sales Rep</div>
          </div>
        </div>
        <div style={{ padding: '4px 0' }}>
          {navItems.map(item => (
            <a key={item.label} href={item.href} style={{ display: 'block', padding: '9px 16px', fontSize: '12px', color: item.active ? '#185FA5' : '#444', fontWeight: item.active ? '500' : '400', borderLeft: item.active ? '2px solid #185FA5' : '2px solid transparent', background: item.active ? '#f0f7ff' : 'transparent', textDecoration: 'none' }}>
              {item.label}
            </a>
          ))}
        </div>
        <a href="/" style={{ marginTop: 'auto', padding: '14px 16px', borderTop: '0.5px solid #e5e5e3', fontSize: '12px', color: '#888', textDecoration: 'none', display: 'block' }}>Sign out</a>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>My Commission — June</div>

        {/* Top metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1rem' }}>
          {[
            { label: 'Confirmed earned', value: '$2,953', sub: 'Paid out', subColor: '#3B6D11' },
            { label: 'Pending', value: '$1,260', sub: 'Awaiting payment', subColor: '#854F0B' },
            { label: 'Current tier', value: '7%', sub: '$20k–$40k range', subColor: '#185FA5' },
            { label: 'To next tier (10%)', value: '$12,820', sub: '+$1,282 if you hit it', subColor: '#854F0B' },
          ].map(m => (
            <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#111' }}>{m.value}</div>
              <div style={{ fontSize: '11px', color: m.subColor, marginTop: '3px' }}>{m.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>

          {/* Tier progress */}
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Commission tiers — June progress</div>
            {[
              { label: '$0–$20k', rate: '5%', pct: 100, color: '#3B6D11', status: 'Done', statusBg: '#EAF3DE', statusColor: '#3B6D11', active: false },
              { label: '$20k–$40k', rate: '7%', pct: 100, color: '#185FA5', status: 'You are here', statusBg: '#E6F1FB', statusColor: '#185FA5', active: true },
              { label: '$40k+', rate: '10%', pct: 5, color: '#854F0B', status: '$12,820 away', statusBg: '#FAEEDA', statusColor: '#854F0B', active: false },
            ].map(t => (
              <div key={t.label} style={{ padding: '8px', borderRadius: '8px', marginBottom: '6px', background: t.active ? '#E6F1FB' : 'transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: t.active ? '500' : '400', color: t.active ? '#0C447C' : '#444' }}>{t.label} · {t.rate}</span>
                  <span style={{ background: t.statusBg, color: t.statusColor, padding: '1px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{t.status}</span>
                </div>
                <div style={{ height: '5px', borderRadius: '99px', background: '#f0f0ee', overflow: 'hidden' }}>
                  <div style={{ width: `${t.pct}%`, height: '100%', borderRadius: '99px', background: t.color }} />
                </div>
              </div>
            ))}
            <div style={{ background: '#E6F1FB', borderRadius: '8px', padding: '8px 10px', marginTop: '8px', fontSize: '11px', color: '#0C447C' }}>
              ⚡ Close <strong>3 more orders</strong> avg $4,273 to unlock 10% — extra <strong>$1,282</strong> this month!
            </div>
          </div>

          {/* Commission calculator */}
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Commission calculator</div>
            <div style={{ fontSize: '12px', color: '#444', marginBottom: '6px' }}>
              Order value: <strong style={{ color: '#111' }}>${sliderVal.toLocaleString()}</strong>
            </div>
            <input type="range" min={500} max={20000} step={100} value={sliderVal} onChange={e => setSliderVal(parseInt(e.target.value))} style={{ width: '100%', marginBottom: '14px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {[
                { label: 'At 7% (now)', value: `$${Math.round(sliderVal * 0.07).toLocaleString()}`, color: '#185FA5' },
                { label: 'At 10% (next)', value: `$${Math.round(sliderVal * 0.10).toLocaleString()}`, color: '#3B6D11' },
                { label: 'Difference', value: `+$${Math.round(sliderVal * 0.03).toLocaleString()}`, color: '#854F0B' },
              ].map(m => (
                <div key={m.label} style={{ background: '#f9f9f8', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>Drag the slider to see what any order is worth at your current vs next tier.</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>

          {/* Daily streak */}
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Daily sales streak</div>
            <div style={{ fontSize: '12px', color: '#444', marginBottom: '10px' }}>
              You have closed a deal <strong style={{ color: '#3B6D11' }}>9 days</strong> in a row this month 🔥
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {streakDays.map((on, i) => (
                <div key={i} style={{ width: '26px', height: '26px', borderRadius: '6px', background: i === 14 ? '#185FA5' : on ? '#EAF3DE' : '#f0f0ee', color: i === 14 ? 'white' : on ? '#3B6D11' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '500' }}>
                  {i === 14 ? '★' : i + 1}
                </div>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: '#185FA5' }}>⚡ Close one deal today to keep your streak alive!</div>
          </div>

          {/* Achievements */}
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Achievements</div>
            {achievements.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '0.5px solid #f0f0ee', opacity: a.earned ? 1 : 0.4 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>{a.label}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>{a.date}</div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 7px', borderRadius: '99px', background: a.earned ? '#EAF3DE' : '#f0f0ee', color: a.earned ? '#3B6D11' : '#888' }}>
                  {a.earned ? 'Earned' : 'Locked'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Leaderboard — West region</div>
          {reps.map((r, i) => {
            const isMe = r.name === 'Jake Rivera'
            return (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', marginBottom: '4px', background: isMe ? '#E6F1FB' : 'transparent' }}>
                <div style={{ width: '22px', fontSize: '12px', fontWeight: '500', color: i === 0 ? '#BA7517' : i === 1 ? '#888' : '#666' }}>{i + 1}</div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: r.bg, color: r.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '500' }}>{r.initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: isMe ? '#0C447C' : '#111' }}>{r.name}{isMe ? ' (you)' : ''}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>${r.revenue.toLocaleString()} · {r.rate} tier</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#3B6D11' }}>${r.confirmed.toLocaleString()}</div>
                  <div style={{ fontSize: '10px', color: '#854F0B' }}>+${r.pending.toLocaleString()} pending</div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}