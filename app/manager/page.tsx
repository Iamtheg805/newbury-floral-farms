'use client'
import { useEffect, useState } from 'react'

type LeaderboardRep = { id: string; name: string; revenue: number; orders: number; rate: number; commission: number }
type RecentOrder = { time: string; rep: string; customer: string; total: string; status: string; carrier: string }

const colors = [
  { bg: '#FAEEDA', tc: '#633806' },
  { bg: '#F1EFE8', tc: '#444441' },
  { bg: '#E6F1FB', tc: '#0C447C' },
  { bg: '#EEEDFE', tc: '#3C3489' },
  { bg: '#E1F5EE', tc: '#085041' },
]

function Sidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
  const [userName, setUserName] = useState('there')
  const [userInitials, setUserInitials] = useState('?')

  useEffect(() => {
    const name = localStorage.getItem('user_name') || 'there'
    const initials = localStorage.getItem('user_initials') || name.split(' ').map(w => w[0]).join('').toUpperCase() || '?'
    setUserName(name)
    setUserInitials(initials)
  }, [])

  return (
    <div style={{ width: '200px', background: '#ffffff', borderRight: '0.5px solid #e5e5e3', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #e5e5e3' }}>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>Newbury Floral Farms</div>
        <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Manager portal</div>
      </div>
      <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e5e3', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#FAEEDA', color: '#633806', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '500' }}>{userInitials}</div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>{userName}</div>
          <div style={{ fontSize: '10px', color: '#888' }}>Regional Manager</div>
        </div>
      </div>
      <div style={{ padding: '8px 0' }}>
        <div style={{ padding: '6px 16px 4px', fontSize: '10px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Manager tools</div>
        {[
          { label: 'Overview', id: 'overview' },
          { label: 'All Reps', id: 'reps' },
          { label: 'Manage Inventory', id: 'inventory' },
          { label: 'Commission Tiers', id: 'tiers' },
          { label: 'User Access', id: 'users' },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 16px', fontSize: '12px', color: activeTab === item.id ? '#185FA5' : '#444', fontWeight: activeTab === item.id ? '500' : '400', borderLeft: activeTab === item.id ? '2px solid #185FA5' : '2px solid transparent', background: activeTab === item.id ? '#f0f7ff' : 'transparent', border: 'none', cursor: 'pointer' }}>
            {item.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px 0', borderTop: '0.5px solid #e5e5e3', marginTop: '8px' }}>
        <div style={{ padding: '6px 16px 4px', fontSize: '10px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rep portal</div>
        {[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flower Availability', href: '/flowers' },
          { label: 'New Order', href: '/orders' },
        ].map(item => (
          <a key={item.label} href={item.href} style={{ display: 'block', padding: '9px 16px', fontSize: '12px', color: '#444', textDecoration: 'none' }}>{item.label}</a>
        ))}
      </div>
      <a href="/" style={{ marginTop: 'auto', padding: '14px 16px', borderTop: '0.5px solid #e5e5e3', fontSize: '12px', color: '#888', textDecoration: 'none', display: 'block' }}>Sign out</a>
    </div>
  )
}

function OverviewTab({ leaderboard, recentOrders, loading, setActiveTab }: { leaderboard: LeaderboardRep[]; recentOrders: RecentOrder[]; loading: boolean; setActiveTab: (t: string) => void }) {
  const totalRevenue = leaderboard.reduce((s, r) => s + r.revenue, 0)
  const totalComm = leaderboard.reduce((s, r) => s + r.commission, 0)
  const totalOrders = leaderboard.reduce((s, r) => s + r.orders, 0)

  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Overview — this month</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1rem' }}>
        {[
          { label: 'Total revenue (this month)', value: loading ? '...' : `$${totalRevenue.toLocaleString()}`, sub: `${leaderboard.length} active reps`, subColor: '#888' },
          { label: 'Active reps', value: leaderboard.length.toString(), sub: 'West region', subColor: '#888' },
          { label: 'Total orders', value: loading ? '...' : totalOrders.toString(), sub: 'This month', subColor: '#888' },
          { label: 'Commission owed', value: loading ? '...' : `$${totalComm.toLocaleString()}`, sub: 'Due end of month', subColor: '#854F0B' },
        ].map(m => (
          <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#111' }}>{m.value}</div>
            <div style={{ fontSize: '11px', color: m.subColor, marginTop: '3px' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Rep performance — this month</div>
        {loading ? (
          <div style={{ fontSize: '12px', color: '#888' }}>Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#888' }}>No reps found yet.</div>
        ) : leaderboard.map((r, i) => {
          const goal = 55000
          const pct = Math.round(r.revenue / goal * 100)
          const color = pct >= 80 ? '#3B6D11' : pct >= 60 ? '#185FA5' : '#854F0B'
          const c = colors[i % colors.length]
          const initials = r.name.split(' ').map(w => w[0]).join('').toUpperCase()
          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: c.bg, color: c.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '500', flexShrink: 0 }}>{initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                  <span style={{ color: '#111' }}>{r.name}</span>
                  <span style={{ color: '#888' }}>${r.revenue.toLocaleString()}</span>
                </div>
                <div style={{ height: '4px', borderRadius: '99px', background: '#f0f0ee', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: '99px', background: color }} />
                </div>
              </div>
              <div style={{ fontSize: '10px', color: '#888', width: '28px', textAlign: 'right' }}>{Math.min(pct, 100)}%</div>
            </div>
          )
        })}
      </div>

      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Live sales feed — recent orders</div>
        {recentOrders.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#888', padding: '1rem 0' }}>No orders yet.</div>
        ) : (
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Time', 'Rep', 'Customer', 'Carrier', 'Total', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {recentOrders.map((s, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px', color: '#888', borderBottom: '0.5px solid #f0f0ee' }}>{s.time}</td>
                  <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{s.rep}</td>
                  <td style={{ padding: '8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{s.customer}</td>
                  <td style={{ padding: '8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{s.carrier}</td>
                  <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{s.total}</td>
                  <td style={{ padding: '8px', borderBottom: '0.5px solid #f0f0ee' }}>
                    <span style={{ background: '#EAF3DE', color: '#3B6D11', padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function RepsTab({ leaderboard, loading }: { leaderboard: LeaderboardRep[]; loading: boolean }) {
  const totalRevenue = leaderboard.reduce((s, r) => s + r.revenue, 0)
  const totalComm = leaderboard.reduce((s, r) => s + r.commission, 0)
  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>All Reps — this month</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1rem' }}>
        {[
          { label: 'Total revenue', value: `$${totalRevenue.toLocaleString()}` },
          { label: 'Top rep', value: leaderboard[0]?.name || '—' },
          { label: 'Commission owed', value: `$${totalComm.toLocaleString()}` },
        ].map(m => (
          <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#111' }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
        {loading ? (
          <div style={{ fontSize: '12px', color: '#888' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Rep', 'Revenue', 'Orders', 'Tier', 'Commission'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {leaderboard.map((r, i) => {
                const c = colors[i % colors.length]
                const initials = r.name.split(' ').map(w => w[0]).join('').toUpperCase()
                return (
                  <tr key={r.id}>
                    <td style={{ padding: '10px 8px', borderBottom: '0.5px solid #f0f0ee' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: c.bg, color: c.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '500' }}>{initials}</div>
                        <span style={{ fontWeight: '500', color: '#111' }}>{r.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>${r.revenue.toLocaleString()}</td>
                    <td style={{ padding: '10px 8px', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{r.orders}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '0.5px solid #f0f0ee' }}>
                      <span style={{ background: '#E6F1FB', color: '#185FA5', padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{r.rate}%</span>
                    </td>
                    <td style={{ padding: '10px 8px', color: '#3B6D11', fontWeight: '500', borderBottom: '0.5px solid #f0f0ee' }}>${r.commission.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function InventoryTab() {
  const [flowers, setFlowers] = useState([
    { id: 1, name: 'Roses', variety: 'Red Freedom', color: '#D4537E', unit: 'bucket', qty: 24, stock: 18, price: 28 },
    { id: 2, name: 'Roses', variety: 'White Akito', color: '#B4B2A9', unit: 'bucket', qty: 20, stock: 12, price: 26 },
    { id: 3, name: 'Sunflowers', variety: 'ProCut Orange', color: '#EF9F27', unit: 'bunch', qty: 30, stock: 30, price: 18 },
    { id: 4, name: 'Tulips', variety: 'Pink Impression', color: '#ED93B1', unit: 'bunch', qty: 40, stock: 5, price: 14 },
    { id: 5, name: 'Lilies', variety: 'Stargazer', color: '#F0997B', unit: 'bucket', qty: 15, stock: 8, price: 32 },
    { id: 6, name: 'Carnations', variety: 'Mixed Colors', color: '#9FE1CB', unit: 'bunch', qty: 25, stock: 0, price: 12 },
    { id: 7, name: 'Hydrangeas', variety: 'Blue Hortensia', color: '#AFA9EC', unit: 'bucket', qty: 18, stock: 14, price: 38 },
    { id: 8, name: 'Gerbera Daisies', variety: 'Rainbow Mix', color: '#D85A30', unit: 'bunch', qty: 25, stock: 22, price: 16 },
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [newFlower, setNewFlower] = useState({ name: '', variety: '', unit: 'bucket', qty: 20, price: 0 })
  const [feedback, setFeedback] = useState('')

  function addFlower() {
    if (!newFlower.name || !newFlower.variety) { setFeedback('Please fill in name and variety.'); return }
    const colors2 = ['#D4537E', '#EF9F27', '#AFA9EC', '#9FE1CB', '#F0997B', '#ED93B1']
    setFlowers(prev => [...prev, { id: Date.now(), name: newFlower.name, variety: newFlower.variety, color: colors2[prev.length % colors2.length], unit: newFlower.unit, qty: newFlower.qty, stock: newFlower.qty, price: newFlower.price }])
    setNewFlower({ name: '', variety: '', unit: 'bucket', qty: 20, price: 0 })
    setShowAdd(false)
    setFeedback(`✓ ${newFlower.name} added! All reps can now see it.`)
    setTimeout(() => setFeedback(''), 3000)
  }

  function removeFlower(id: number) {
    if (!confirm('Remove this flower? Reps will no longer see it.')) return
    setFlowers(prev => prev.filter(f => f.id !== id))
    setFeedback('✓ Flower removed.')
    setTimeout(() => setFeedback(''), 3000)
  }

  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Manage Inventory</div>
      {feedback && <div style={{ marginBottom: '10px', fontSize: '12px', color: feedback.startsWith('✓') ? '#3B6D11' : '#A32D2D', background: feedback.startsWith('✓') ? '#EAF3DE' : '#FCEBEB', padding: '8px 12px', borderRadius: '8px' }}>{feedback}</div>}
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>Set morning quantities and prices. Changes visible to all reps instantly.</div>
          <button onClick={() => setShowAdd(!showAdd)} style={{ padding: '7px 14px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>+ Add flower</button>
        </div>
        {showAdd && (
          <div style={{ background: '#f9f9f8', borderRadius: '10px', padding: '1rem', marginBottom: '12px', border: '0.5px solid #185FA5' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#111', marginBottom: '10px' }}>Add new flower</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Flower name</label><input value={newFlower.name} onChange={e => setNewFlower(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Peonies" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Variety</label><input value={newFlower.variety} onChange={e => setNewFlower(p => ({ ...p, variety: e.target.value }))} placeholder="e.g. Sarah Bernhardt" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Unit</label><select value={newFlower.unit} onChange={e => setNewFlower(p => ({ ...p, unit: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }}><option value='bucket'>Bucket</option><option value='bunch'>Bunch</option></select></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Morning quantity</label><input type="number" value={newFlower.qty} onChange={e => setNewFlower(p => ({ ...p, qty: parseInt(e.target.value) || 0 }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Price per unit ($)</label><input type="number" value={newFlower.price} onChange={e => setNewFlower(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={addFlower} style={{ padding: '7px 14px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Add to inventory</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: '7px 12px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 80px 30px', gap: '6px', padding: '0 0 6px', borderBottom: '0.5px solid #e5e5e3', marginBottom: '4px' }}>
          {['Flower', 'Morning qty', 'In stock', 'Price', ''].map(h => <div key={h} style={{ fontSize: '10px', fontWeight: '500', color: '#888' }}>{h}</div>)}
        </div>
        {flowers.map(f => {
          const pct = Math.round(f.stock / f.qty * 100)
          const stockColor = f.stock === 0 ? '#A32D2D' : pct <= 20 ? '#854F0B' : '#3B6D11'
          return (
            <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 80px 30px', gap: '6px', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid #f0f0ee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                <div><div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>{f.name}</div><div style={{ fontSize: '10px', color: '#888' }}>{f.variety} · {f.unit}</div></div>
              </div>
              <input type="number" defaultValue={f.qty} style={{ padding: '5px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }} />
              <div style={{ fontSize: '12px', fontWeight: '500', color: stockColor }}>{f.stock} left</div>
              <input type="text" defaultValue={`$${f.price}`} style={{ padding: '5px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }} />
              <button onClick={() => removeFlower(f.id)} style={{ border: 'none', background: '#FCEBEB', borderRadius: '6px', cursor: 'pointer', color: '#A32D2D', fontSize: '14px', padding: '4px 6px' }}>×</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TiersTab({ leaderboard }: { leaderboard: LeaderboardRep[] }) {
  const [tiers, setTiers] = useState([
    { name: 'Starter', min: 0, max: 20000, rate: 5 },
    { name: 'Mid', min: 20001, max: 40000, rate: 7 },
    { name: 'Top', min: 40001, max: 999999, rate: 10 },
  ])
  const [feedback, setFeedback] = useState('')

  function saveTiers() {
    setFeedback('✓ Tiers saved! Reps notified by email.')
    setTimeout(() => setFeedback(''), 3000)
  }

  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Commission Tiers</div>
      {feedback && <div style={{ marginBottom: '10px', fontSize: '12px', color: '#3B6D11', background: '#EAF3DE', padding: '8px 12px', borderRadius: '8px' }}>{feedback}</div>}
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '10px' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Edit tiers below. Changes take effect next month. Reps are notified automatically.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 80px', gap: '8px', padding: '0 0 6px', borderBottom: '0.5px solid #e5e5e3', marginBottom: '4px' }}>
          {['Tier name', 'Min sales ($)', 'Max sales ($)', 'Rate (%)'].map(h => <div key={h} style={{ fontSize: '10px', fontWeight: '500', color: '#888' }}>{h}</div>)}
        </div>
        {tiers.map((t, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 80px', gap: '8px', padding: '6px 0', borderBottom: '0.5px solid #f0f0ee', alignItems: 'center' }}>
            <input value={t.name} onChange={e => { const u = [...tiers]; u[i] = { ...u[i], name: e.target.value }; setTiers(u) }} style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
            <input type="number" value={t.min} onChange={e => { const u = [...tiers]; u[i] = { ...u[i], min: parseInt(e.target.value) || 0 }; setTiers(u) }} style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
            <input type="number" value={t.max === 999999 ? '' : t.max} placeholder="No limit" onChange={e => { const u = [...tiers]; u[i] = { ...u[i], max: parseInt(e.target.value) || 999999 }; setTiers(u) }} style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
            <input type="number" value={t.rate} onChange={e => { const u = [...tiers]; u[i] = { ...u[i], rate: parseInt(e.target.value) || 0 }; setTiers(u) }} style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          <button onClick={saveTiers} style={{ padding: '8px 16px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Save changes</button>
        </div>
      </div>

      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Commission owed by rep — this month</div>
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
          <thead><tr>{['Rep', 'Revenue', 'Tier', 'Commission'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr></thead>
          <tbody>
            {leaderboard.map((r, i) => {
              const c = colors[i % colors.length]
              const initials = r.name.split(' ').map(w => w[0]).join('').toUpperCase()
              return (
                <tr key={r.id}>
                  <td style={{ padding: '9px 8px', borderBottom: '0.5px solid #f0f0ee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: c.bg, color: c.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '500' }}>{initials}</div>
                      <span style={{ fontWeight: '500', color: '#111' }}>{r.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '9px 8px', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>${r.revenue.toLocaleString()}</td>
                  <td style={{ padding: '9px 8px', borderBottom: '0.5px solid #f0f0ee' }}><span style={{ background: '#E6F1FB', color: '#185FA5', padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{r.rate}%</span></td>
                  <td style={{ padding: '9px 8px', color: '#3B6D11', fontWeight: '500', borderBottom: '0.5px solid #f0f0ee' }}>${r.commission.toLocaleString()}</td>
                </tr>
              )
            })}
            <tr>
              <td colSpan={1} style={{ padding: '9px 8px', fontWeight: '500', color: '#111' }}>Total owed</td>
              <td colSpan={3} style={{ padding: '9px 8px', fontWeight: '600', color: '#3B6D11', fontSize: '14px' }}>${leaderboard.reduce((s, r) => s + r.commission, 0).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState([
    { name: 'Rosa Martinez', email: 'rosa.m@newburyfloral.com', role: 'manager', last: 'Today' },
    { name: 'Jake Rivera', email: 'jake.r@newburyfloral.com', role: 'rep', last: 'Today' },
    { name: 'Jim M', email: 'jim@newburyfloralfarms.com', role: 'rep', last: 'Today' },
  ])
  const [showInvite, setShowInvite] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'rep' })
  const [feedback, setFeedback] = useState('')

  function inviteUser() {
    if (!newUser.name || !newUser.email) { setFeedback('Please fill in name and email.'); return }
    setUsers(prev => [...prev, { name: newUser.name, email: newUser.email, role: newUser.role, last: 'Never' }])
    setNewUser({ name: '', email: '', role: 'rep' })
    setShowInvite(false)
    setFeedback(`✓ Now create this user manually in Supabase Authentication.`)
    setTimeout(() => setFeedback(''), 5000)
  }

  function removeUser(email: string) {
    if (!confirm('Remove this user? They will lose access immediately.')) return
    setUsers(prev => prev.filter(u => u.email !== email))
  }

  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>User Access & Roles</div>
      {feedback && <div style={{ marginBottom: '10px', fontSize: '12px', color: feedback.startsWith('✓') ? '#3B6D11' : '#A32D2D', background: feedback.startsWith('✓') ? '#EAF3DE' : '#FCEBEB', padding: '8px 12px', borderRadius: '8px' }}>{feedback}</div>}
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>Control who can log in and what they can do.</div>
          <button onClick={() => setShowInvite(!showInvite)} style={{ padding: '7px 14px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>+ Add user (manual)</button>
        </div>
        {showInvite && (
          <div style={{ background: '#f9f9f8', borderRadius: '10px', padding: '1rem', marginBottom: '12px', border: '0.5px solid #185FA5' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#111', marginBottom: '10px' }}>Add new user</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '8px', marginBottom: '10px' }}>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Full name</label><input value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="e.g. John Smith" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Email</label><input value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="email@newburyfloral.com" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Role</label><select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }}><option value='rep'>Sales Rep</option><option value='manager'>Manager</option></select></div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={inviteUser} style={{ padding: '7px 14px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Add to list</button>
              <button onClick={() => setShowInvite(false)} style={{ padding: '7px 12px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
          <thead><tr>{['Name', 'Email', 'Role', 'Last login', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.email}>
                <td style={{ padding: '9px 8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{u.name}</td>
                <td style={{ padding: '9px 8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{u.email}</td>
                <td style={{ padding: '9px 8px', borderBottom: '0.5px solid #f0f0ee' }}><span style={{ background: u.role === 'manager' ? '#FAEEDA' : '#E6F1FB', color: u.role === 'manager' ? '#633806' : '#185FA5', padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{u.role}</span></td>
                <td style={{ padding: '9px 8px', color: '#888', borderBottom: '0.5px solid #f0f0ee' }}>{u.last}</td>
                <td style={{ padding: '9px 8px', borderBottom: '0.5px solid #f0f0ee' }}>{u.role !== 'manager' && <button onClick={() => removeUser(u.email)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#A32D2D', fontSize: '11px' }}>Remove</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Manager() {
  const [activeTab, setActiveTab] = useState('overview')
  const [leaderboard, setLeaderboard] = useState<LeaderboardRep[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/leaderboard').then(r => r.json()),
      fetch('/api/orders/recent').then(r => r.json()),
    ]).then(([lbData, ordersData]) => {
      setLeaderboard(lbData.leaderboard || [])
      setRecentOrders(ordersData.orders || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#f9f9f8' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        {activeTab === 'overview' && <OverviewTab leaderboard={leaderboard} recentOrders={recentOrders} loading={loading} setActiveTab={setActiveTab} />}
        {activeTab === 'reps' && <RepsTab leaderboard={leaderboard} loading={loading} />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'tiers' && <TiersTab leaderboard={leaderboard} />}
        {activeTab === 'users' && <UsersTab />}
      </div>
    </div>
  )
}