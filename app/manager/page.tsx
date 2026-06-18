'use client'
import { useState } from 'react'

const reps = [
  { name: 'Sarah Lee', initials: 'SL', bg: '#FAEEDA', tc: '#633806', revenue: 54200, orders: 31, rate: '10%', confirmed: 3822, pending: 620, goal: 55000 },
  { name: 'Mike Kim', initials: 'MK', bg: '#F1EFE8', tc: '#444441', revenue: 48700, orders: 27, rate: '10%', confirmed: 3344, pending: 487, goal: 55000 },
  { name: 'Jake Rivera', initials: 'JR', bg: '#E6F1FB', tc: '#0C447C', revenue: 42180, orders: 24, rate: '7%', confirmed: 2953, pending: 612, goal: 55000 },
  { name: 'Dana Perez', initials: 'DP', bg: '#EEEDFE', tc: '#3C3489', revenue: 38900, orders: 22, rate: '7%', confirmed: 2723, pending: 0, goal: 55000 },
  { name: 'Tom Walsh', initials: 'TW', bg: '#E1F5EE', tc: '#085041', revenue: 29400, orders: 17, rate: '7%', confirmed: 1978, pending: 360, goal: 55000 },
]

type Rep = {
  name: string
  initials: string
  bg: string
  tc: string
  revenue: number
  orders: number
  rate: string
  confirmed: number
  pending: number
  goal: number
}

const liveSales = [
  { time: '11:42 AM', rep: 'Jake Rivera', customer: 'Aisha Nwosu', flower: 'Roses x2 buckets', total: '$56', status: 'invoiced' },
  { time: '11:20 AM', rep: 'Sarah Lee', customer: 'Maria Gonzalez', flower: 'Sunflowers x5 bunches', total: '$90', status: 'invoiced' },
  { time: '10:55 AM', rep: 'Mike Kim', customer: 'James Thornton', flower: 'Hydrangeas x3 buckets', total: '$114', status: 'invoiced' },
  { time: '10:30 AM', rep: 'Dana Perez', customer: 'Priya Patel', flower: 'Tulips x8 bunches', total: '$112', status: 'pending' },
  { time: '9:15 AM', rep: 'Tom Walsh', customer: 'Carlos Ruiz', flower: 'Gerbera Daisies x4 bunches', total: '$64', status: 'invoiced' },
]

const invAlerts = [
  { flower: 'Tulips (Pink Impression)', msg: 'Only 5 bunches left — 88% sold', color: '#854F0B', icon: '⚠️' },
  { flower: 'Carnations (Mixed Colors)', msg: 'Completely sold out today', color: '#A32D2D', icon: '🚫' },
  { flower: 'Alstroemeria', msg: 'Only 3 bunches left', color: '#854F0B', icon: '⚠️' },
  { flower: 'Roses (Red Freedom)', msg: '18 buckets remaining — 25% left', color: '#3B6D11', icon: '✓' },
]

function Sidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
  return (
    <div style={{ width: '200px', background: '#ffffff', borderRight: '0.5px solid #e5e5e3', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #e5e5e3' }}>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>Newbury Floral Farms</div>
        <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Manager portal</div>
      </div>
      <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e5e3', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#FAEEDA', color: '#633806', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '500' }}>RM</div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>Rosa Martinez</div>
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

function OverviewTab({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const totalRevenue = reps.reduce((s, r) => s + r.revenue, 0)
  const totalComm = reps.reduce((s, r) => s + r.confirmed + r.pending, 0)

  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Good morning, Rosa 👋</div><a href="/api/quickbooks/connect" style={{ display: "inline-block", padding: "8px 16px", background: "#2CA01C", color: "white", borderRadius: "8px", fontSize: "12px", textDecoration: "none", fontWeight: "500", marginBottom: "1rem" }}>Connect QuickBooks</a>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1rem' }}>
        {[
          { label: 'Total revenue (Jun)', value: `$${totalRevenue.toLocaleString()}`, sub: '+22% vs May', subColor: '#3B6D11' },
          { label: 'Active reps', value: '5', sub: 'West region', subColor: '#888' },
          { label: 'Flowers sold today', value: '47 units', sub: '12 varieties', subColor: '#888' },
          { label: 'Commission owed', value: `$${totalComm.toLocaleString()}`, sub: 'Due Jun 30', subColor: '#854F0B' },
        ].map(m => (
          <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#111' }}>{m.value}</div>
            <div style={{ fontSize: '11px', color: m.subColor, marginTop: '3px' }}>{m.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Rep performance — June</div>
          {reps.map(r => {
            const pct = Math.round(r.revenue / r.goal * 100)
            const color = pct >= 80 ? '#3B6D11' : pct >= 60 ? '#185FA5' : '#854F0B'
            return (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: r.bg, color: r.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '500', flexShrink: 0 }}>{r.initials}</div>
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
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Inventory alerts</div>
          {invAlerts.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '7px 0', borderBottom: '0.5px solid #f0f0ee' }}>
              <span style={{ fontSize: '14px' }}>{a.icon}</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>{a.flower}</div>
                <div style={{ fontSize: '11px', color: a.color }}>{a.msg}</div>
              </div>
            </div>
          ))}
          <button onClick={() => setActiveTab('inventory')} style={{ marginTop: '10px', padding: '6px 12px', background: 'transparent', color: '#185FA5', border: '0.5px solid #185FA5', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}>Manage inventory →</button>
        </div>
      </div>
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Live sales feed — today</div>
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Time', 'Rep', 'Customer', 'Flower', 'Total', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {liveSales.map((s, i) => (
              <tr key={i}>
                <td style={{ padding: '8px', color: '#888', borderBottom: '0.5px solid #f0f0ee' }}>{s.time}</td>
                <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{s.rep}</td>
                <td style={{ padding: '8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{s.customer}</td>
                <td style={{ padding: '8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{s.flower}</td>
                <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{s.total}</td>
                <td style={{ padding: '8px', borderBottom: '0.5px solid #f0f0ee' }}>
                  <span style={{ background: s.status === 'invoiced' ? '#EAF3DE' : '#FAEEDA', color: s.status === 'invoiced' ? '#3B6D11' : '#854F0B', padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RepsTab() {
  const totalRevenue = reps.reduce((s, r) => s + r.revenue, 0)
  const totalComm = reps.reduce((s, r) => s + r.confirmed + r.pending, 0)
  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>All Reps — June</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1rem' }}>
        {[
          { label: 'Total revenue', value: `$${totalRevenue.toLocaleString()}`, sub: '+22% vs May', subColor: '#3B6D11' },
          { label: 'Top rep', value: 'Sarah Lee', sub: '$54,200', subColor: '#888' },
          { label: 'Commission owed', value: `$${totalComm.toLocaleString()}`, sub: 'Due Jun 30', subColor: '#854F0B' },
          { label: 'Needs attention', value: 'Tom Walsh', sub: 'Below target', subColor: '#854F0B' },
        ].map(m => (
          <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#111' }}>{m.value}</div>
            <div style={{ fontSize: '11px', color: m.subColor, marginTop: '3px' }}>{m.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Rep', 'Revenue', 'Orders', 'Tier', 'Commission', 'Goal %', 'Progress'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {reps.map(r => {
              const pct = Math.round(r.revenue / r.goal * 100)
              const color = pct >= 80 ? '#3B6D11' : pct >= 60 ? '#185FA5' : '#854F0B'
              const badgeBg = pct >= 80 ? '#EAF3DE' : pct >= 60 ? '#E6F1FB' : '#FAEEDA'
              const badgeColor = pct >= 80 ? '#3B6D11' : pct >= 60 ? '#185FA5' : '#854F0B'
              return (
                <tr key={r.name}>
                  <td style={{ padding: '10px 8px', borderBottom: '0.5px solid #f0f0ee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: r.bg, color: r.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '500' }}>{r.initials}</div>
                      <span style={{ fontWeight: '500', color: '#111' }}>{r.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>${r.revenue.toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{r.orders}</td>
                  <td style={{ padding: '10px 8px', borderBottom: '0.5px solid #f0f0ee' }}>
                    <span style={{ background: '#E6F1FB', color: '#185FA5', padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{r.rate}</span>
                  </td>
                  <td style={{ padding: '10px 8px', color: '#3B6D11', fontWeight: '500', borderBottom: '0.5px solid #f0f0ee' }}>${(r.confirmed + r.pending).toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', borderBottom: '0.5px solid #f0f0ee' }}>
                    <span style={{ background: badgeBg, color: badgeColor, padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{Math.min(pct, 100)}%</span>
                  </td>
                  <td style={{ padding: '10px 8px', borderBottom: '0.5px solid #f0f0ee', width: '120px' }}>
                    <div style={{ height: '4px', borderRadius: '99px', background: '#f0f0ee', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: '99px', background: color }} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
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
    const colors = ['#D4537E', '#EF9F27', '#AFA9EC', '#9FE1CB', '#F0997B', '#ED93B1']
    setFlowers(prev => [...prev, { id: Date.now(), name: newFlower.name, variety: newFlower.variety, color: colors[prev.length % colors.length], unit: newFlower.unit, qty: newFlower.qty, stock: newFlower.qty, price: newFlower.price }])
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

function TiersTab() {
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
          <button onClick={() => setTiers([{ name: 'Starter', min: 0, max: 20000, rate: 5 }, { name: 'Mid', min: 20001, max: 40000, rate: 7 }, { name: 'Top', min: 40001, max: 999999, rate: 10 }])} style={{ padding: '8px 12px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Reset</button>
        </div>
      </div>
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Commission owed by rep</div>
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
          <thead><tr>{['Rep', 'Revenue', 'Tier', 'Confirmed', 'Pending'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr></thead>
          <tbody>
            {reps.map(r => (
              <tr key={r.name}>
                <td style={{ padding: '9px 8px', borderBottom: '0.5px solid #f0f0ee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: r.bg, color: r.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '500' }}>{r.initials}</div>
                    <span style={{ fontWeight: '500', color: '#111' }}>{r.name}</span>
                  </div>
                </td>
                <td style={{ padding: '9px 8px', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>${r.revenue.toLocaleString()}</td>
                <td style={{ padding: '9px 8px', borderBottom: '0.5px solid #f0f0ee' }}><span style={{ background: '#E6F1FB', color: '#185FA5', padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{r.rate}</span></td>
                <td style={{ padding: '9px 8px', color: '#3B6D11', fontWeight: '500', borderBottom: '0.5px solid #f0f0ee' }}>${r.confirmed.toLocaleString()}</td>
                <td style={{ padding: '9px 8px', color: '#854F0B', borderBottom: '0.5px solid #f0f0ee' }}>${r.pending.toLocaleString()}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} style={{ padding: '9px 8px', fontWeight: '500', color: '#111' }}>Total owed</td>
              <td colSpan={2} style={{ padding: '9px 8px', fontWeight: '600', color: '#3B6D11', fontSize: '14px' }}>${reps.reduce((s, r) => s + r.confirmed + r.pending, 0).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState([
    { name: 'Rosa Martinez', email: 'rosa.m@newburyfloral.com', role: 'manager', last: 'Today 8:02 AM' },
    { name: 'Jake Rivera', email: 'jake.r@newburyfloral.com', role: 'rep', last: 'Today 9:15 AM' },
    { name: 'Sarah Lee', email: 'sarah.l@newburyfloral.com', role: 'rep', last: 'Today 8:44 AM' },
    { name: 'Mike Kim', email: 'mike.k@newburyfloral.com', role: 'rep', last: 'Today 10:01 AM' },
    { name: 'Dana Perez', email: 'dana.p@newburyfloral.com', role: 'rep', last: 'Yesterday' },
    { name: 'Tom Walsh', email: 'tom.w@newburyfloral.com', role: 'rep', last: 'Today 7:58 AM' },
  ])
  const [showInvite, setShowInvite] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'rep' })
  const [feedback, setFeedback] = useState('')

  function inviteUser() {
    if (!newUser.name || !newUser.email) { setFeedback('Please fill in name and email.'); return }
    setUsers(prev => [...prev, { name: newUser.name, email: newUser.email, role: newUser.role, last: 'Never' }])
    setNewUser({ name: '', email: '', role: 'rep' })
    setShowInvite(false)
    setFeedback(`✓ Invite sent to ${newUser.email}!`)
    setTimeout(() => setFeedback(''), 3000)
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
          <button onClick={() => setShowInvite(!showInvite)} style={{ padding: '7px 14px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>+ Invite user</button>
        </div>
        {showInvite && (
          <div style={{ background: '#f9f9f8', borderRadius: '10px', padding: '1rem', marginBottom: '12px', border: '0.5px solid #185FA5' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#111', marginBottom: '10px' }}>Invite new user</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '8px', marginBottom: '10px' }}>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Full name</label><input value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="e.g. John Smith" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Email</label><input value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="email@newburyfloral.com" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Role</label><select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }}><option value='rep'>Sales Rep</option><option value='manager'>Manager</option></select></div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={inviteUser} style={{ padding: '7px 14px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Send invite</button>
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
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Permissions by role</div>
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
          <thead><tr>{['Permission', 'Sales Rep', 'Manager'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr></thead>
          <tbody>
            {[
              ['View flower availability', true, true],
              ['Sell / reduce stock', true, true],
              ['Add or remove flowers', false, true],
              ['Edit prices & quantities', false, true],
              ['View own customers only', true, false],
              ['View all reps performance', false, true],
              ['Edit commission tiers', false, true],
              ['Manage user access', false, true],
            ].map(([label, rep, mgr]) => (
              <tr key={label as string}>
                <td style={{ padding: '8px', color: '#444', borderBottom: '0.5px solid #f0f0ee' }}>{label}</td>
                <td style={{ padding: '8px', borderBottom: '0.5px solid #f0f0ee' }}><span style={{ background: rep ? '#EAF3DE' : '#FCEBEB', color: rep ? '#3B6D11' : '#A32D2D', padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{rep ? 'Yes' : 'No'}</span></td>
                <td style={{ padding: '8px', borderBottom: '0.5px solid #f0f0ee' }}><span style={{ background: mgr ? '#EAF3DE' : '#FCEBEB', color: mgr ? '#3B6D11' : '#A32D2D', padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{mgr ? 'Yes' : 'No'}</span></td>
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#f9f9f8' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
        {activeTab === 'reps' && <RepsTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'tiers' && <TiersTab />}
        {activeTab === 'users' && <UsersTab />}
      </div>
    </div>
  )
}