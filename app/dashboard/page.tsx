'use client'

export default function Dashboard() {
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'Flower Availability', href: '/flowers', active: false },
    { label: 'New Order', href: '/orders', active: false },
    { label: 'My Customers', href: '/customers', active: false },
    { label: 'Quotes', href: '/quotes', active: false },
    { label: 'My Commission', href: '/commission', active: false },
  ]

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
        <a href="/" style={{ marginTop: 'auto', padding: '14px 16px', borderTop: '0.5px solid #e5e5e3', fontSize: '12px', color: '#888', cursor: 'pointer', textDecoration: 'none', display: 'block' }}>
          Sign out
        </a>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Good morning, Jake 👋</div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1rem' }}>
          {[
            { label: 'Revenue (Jun)', value: '$42,180', sub: '+18% vs last month', subColor: '#3B6D11' },
            { label: 'Open quotes', value: '6', sub: '$28,400 potential', subColor: '#666' },
            { label: 'Orders this month', value: '24', sub: 'Goal: 30', subColor: '#666' },
            { label: 'My customers', value: '18', sub: '3 need follow-up', subColor: '#666' },
          ].map(m => (
            <div key={m.label} style={{ background: '#ffffff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>{m.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#111111' }}>{m.value}</div>
              <div style={{ fontSize: '11px', color: m.subColor, marginTop: '3px' }}>{m.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>

          {/* Goal progress */}
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Goal progress — June</div>
            {[
              { label: 'Revenue', val: 42180, max: 55000, color: '#185FA5' },
              { label: 'Orders', val: 24, max: 30, color: '#3B6D11' },
              { label: 'New customers', val: 2, max: 5, color: '#854F0B' },
            ].map(g => {
              const pct = Math.round(g.val / g.max * 100)
              return (
                <div key={g.label} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: '#333' }}>
                    <span>{g.label}</span>
                    <span style={{ color: '#888' }}>{g.val.toLocaleString()} / {g.max.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '99px', background: '#f0f0ee', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: '99px', background: g.color }} />
                  </div>
                </div>
              )
            })}
            <div style={{ background: '#E6F1FB', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', color: '#0C447C', marginTop: '4px' }}>
              ⚡ Close 3 more orders avg $4,273 to unlock 10% tier — extra <strong>$1,282</strong> this month.
            </div>
          </div>

          {/* Follow up */}
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Customers needing follow-up</div>
            {[
              { name: 'Maria Gonzalez', days: '12 days ago', color: '#854F0B' },
              { name: 'James Thornton', days: '21 days ago', color: '#A32D2D' },
              { name: 'Carlos Ruiz', days: '97 days ago', color: '#A32D2D' },
            ].map(c => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid #f0f0ee' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>{c.name}</div>
                  <div style={{ fontSize: '11px', color: c.color }}>{c.days}</div>
                </div>
                <button style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', border: '0.5px solid #e5e5e3', cursor: 'pointer', background: 'transparent', color: '#333' }}>Follow up</button>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Leaderboard — June</div>
          {[
            { name: 'Sarah Lee', initials: 'SL', revenue: 54200, rate: '10%', bg: '#FAEEDA', tc: '#633806', rank: '1st' },
            { name: 'Mike Kim', initials: 'MK', revenue: 48700, rate: '10%', bg: '#F1EFE8', tc: '#444441', rank: '2nd' },
            { name: 'Jake Rivera (you)', initials: 'JR', revenue: 42180, rate: '7%', bg: '#E6F1FB', tc: '#0C447C', rank: '3rd' },
            { name: 'Dana Perez', initials: 'DP', revenue: 38900, rate: '7%', bg: '#EEEDFE', tc: '#3C3489', rank: '4th' },
            { name: 'Tom Walsh', initials: 'TW', revenue: 29400, rate: '7%', bg: '#E1F5EE', tc: '#085041', rank: '5th' },
          ].map((r, i) => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', marginBottom: '4px', background: r.name.includes('you') ? '#E6F1FB' : 'transparent' }}>
              <div style={{ width: '24px', fontSize: '12px', fontWeight: '500', color: i === 0 ? '#BA7517' : '#666' }}>{r.rank}</div>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: r.bg, color: r.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '500' }}>{r.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: r.name.includes('you') ? '#0C447C' : '#111' }}>{r.name}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>${r.revenue.toLocaleString()} · {r.rate} tier</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}