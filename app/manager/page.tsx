'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../useAuth'

type LeaderboardRep = { id: string; name: string; revenue: number; orders: number; rate: number; commission: number }
type RecentOrder = { time: string; rep: string; customer: string; total: string; status: string; carrier: string }
type Flower = { id: number; name: string; variety: string; color: string; unit: string; stems_per_unit: number; morning_qty: number; current_stock: number; price: number; active: boolean }
type AppUser = { id: string; full_name: string; email: string; role: string; active: boolean }
type PendingOrder = { db_id: number; order_number: string; customer: string; carrier: string; total: number; rep: string; created_at: string; items: { name: string; qty: number; unit: string; sub: number }[] }

const colors = [
  { bg: '#FAEEDA', tc: '#633806' },
  { bg: '#F1EFE8', tc: '#444441' },
  { bg: '#E6F1FB', tc: '#0C447C' },
  { bg: '#EEEDFE', tc: '#3C3489' },
  { bg: '#E1F5EE', tc: '#085041' },
]

function Sidebar({ activeTab, setActiveTab, pendingCount }: { activeTab: string; setActiveTab: (t: string) => void; pendingCount: number }) {
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
          { label: 'Pending Invoices', id: 'pending', badge: pendingCount },
          { label: 'Manage Inventory', id: 'inventory' },
          { label: 'Commission Tiers', id: 'tiers' },
          { label: 'User Access', id: 'users' },
          { label: 'Company Settings', id: 'settings' },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', padding: '9px 16px', fontSize: '12px', color: activeTab === item.id ? '#185FA5' : '#444', fontWeight: activeTab === item.id ? '500' : '400', borderLeft: activeTab === item.id ? '2px solid #185FA5' : '2px solid transparent', background: activeTab === item.id ? '#f0f7ff' : 'transparent', border: 'none', cursor: 'pointer' }}>
            <span>{item.label}</span>
            {!!item.badge && <span style={{ background: '#854F0B', color: 'white', borderRadius: '99px', fontSize: '10px', fontWeight: '500', padding: '1px 6px' }}>{item.badge}</span>}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px 0', borderTop: '0.5px solid #e5e5e3', marginTop: '8px' }}>
        <div style={{ padding: '6px 16px 4px', fontSize: '10px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rep portal</div>
        {[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flower Availability', href: '/flowers' },
          { label: 'New Order', href: '/orders' },
          { label: 'Scan Station', href: '/scan' },
        ].map(item => (
          <a key={item.label} href={item.href} style={{ display: 'block', padding: '9px 16px', fontSize: '12px', color: '#444', textDecoration: 'none' }}>{item.label}</a>
        ))}
      </div>
      <a href="/" style={{ marginTop: 'auto', padding: '14px 16px', borderTop: '0.5px solid #e5e5e3', fontSize: '12px', color: '#888', textDecoration: 'none', display: 'block' }}>Sign out</a>
    </div>
  )
}

function OverviewTab({ leaderboard, recentOrders, loading }: { leaderboard: LeaderboardRep[]; recentOrders: RecentOrder[]; loading: boolean }) {
  const totalRevenue = leaderboard.reduce((s, r) => s + r.revenue, 0)
  const totalComm = leaderboard.reduce((s, r) => s + r.commission, 0)
  const totalOrders = leaderboard.reduce((s, r) => s + r.orders, 0)

  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Overview -- this month</div>
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
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Rep performance -- this month</div>
        {loading ? <div style={{ fontSize: '12px', color: '#888' }}>Loading...</div> : leaderboard.length === 0 ? <div style={{ fontSize: '12px', color: '#888' }}>No reps found yet.</div> : leaderboard.map((r, i) => {
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
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Live sales feed -- recent orders</div>
        {recentOrders.length === 0 ? <div style={{ fontSize: '12px', color: '#888', padding: '1rem 0' }}>No orders yet.</div> : (
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead><tr>{['Time', 'Rep', 'Customer', 'Carrier', 'Total', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr></thead>
            <tbody>
              {recentOrders.map((s, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px', color: '#888', borderBottom: '0.5px solid #f0f0ee' }}>{s.time}</td>
                  <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{s.rep}</td>
                  <td style={{ padding: '8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{s.customer}</td>
                  <td style={{ padding: '8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{s.carrier}</td>
                  <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{s.total}</td>
                  <td style={{ padding: '8px', borderBottom: '0.5px solid #f0f0ee' }}><span style={{ background: '#EAF3DE', color: '#3B6D11', padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{s.status}</span></td>
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
      <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>All Reps -- this month</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1rem' }}>
        {[
          { label: 'Total revenue', value: `$${totalRevenue.toLocaleString()}` },
          { label: 'Top rep', value: leaderboard[0]?.name || '--' },
          { label: 'Commission owed', value: `$${totalComm.toLocaleString()}` },
        ].map(m => (
          <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#111' }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
        {loading ? <div style={{ fontSize: '12px', color: '#888' }}>Loading...</div> : (
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead><tr>{['Rep', 'Revenue', 'Orders', 'Tier', 'Commission'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr></thead>
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
                    <td style={{ padding: '10px 8px', borderBottom: '0.5px solid #f0f0ee' }}><span style={{ background: '#E6F1FB', color: '#185FA5', padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{r.rate}%</span></td>
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

function PendingInvoicesTab({ onCountChange }: { onCountChange: (n: number) => void }) {
  const [orders, setOrders] = useState<PendingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [feedback, setFeedback] = useState('')
  const [sending, setSending] = useState(false)

  function loadPending() {
    setLoading(true)
    fetch('/api/orders/pending').then(r => r.json()).then(data => {
      const list: PendingOrder[] = data.orders || []
      setOrders(list)
      setSelected(new Set(list.map(o => o.db_id)))
      onCountChange(list.length)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { loadPending() }, [])

  function toggle(id: number) {
    setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  function toggleAll() {
    if (selected.size === orders.length) setSelected(new Set())
    else setSelected(new Set(orders.map(o => o.db_id)))
  }

  async function removeOrder(id: number) {
    if (!confirm('Remove this order completely?')) return
    try {
      await fetch('/api/orders/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      loadPending()
    } catch { setFeedback('Could not remove order.') }
  }

  async function sendToQuickBooks() {
    if (selected.size === 0) { setFeedback('Select at least one order to send.'); return }
    setSending(true)
    setFeedback('Sending to QuickBooks...')
    try {
      const res = await fetch('/api/orders/send-to-quickbooks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_ids: Array.from(selected) }) })
      const data = await res.json()
      if (data.success) {
        let msg = `✓ ${data.invoiced} invoice${data.invoiced !== 1 ? 's' : ''} sent to QuickBooks!`
        if (data.errors?.length > 0) msg += ` (${data.errors.length} failed: ${data.errors.map((e: { order: string; message: string }) => e.order).join(', ')})`
        setFeedback(msg)
        loadPending()
      } else {
        setFeedback('Could not send: ' + data.error)
      }
    } catch { setFeedback('Could not send to QuickBooks.') }
    setSending(false)
    setTimeout(() => setFeedback(''), 8000)
  }

  const selectedTotal = orders.filter(o => selected.has(o.db_id)).reduce((s, o) => s + o.total, 0)

  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Pending Invoices</div>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '1rem' }}>New orders land here first. Review them, remove anything cancelled, then send to QuickBooks.</div>
      {feedback && <div style={{ marginBottom: '10px', fontSize: '12px', color: feedback.startsWith('✓') ? '#3B6D11' : '#A32D2D', background: feedback.startsWith('✓') ? '#EAF3DE' : '#FCEBEB', padding: '8px 12px', borderRadius: '8px' }}>{feedback}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1rem' }}>
        {[{ label: 'Orders pending', value: orders.length.toString() }, { label: 'Selected to send', value: selected.size.toString() }, { label: 'Selected total', value: `$${selectedTotal.toFixed(2)}` }].map(m => (
          <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#111' }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
        {loading ? <div style={{ fontSize: '12px', color: '#888' }}>Loading...</div> : orders.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#888', textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
            All caught up -- no pending orders to invoice.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#444', cursor: 'pointer' }}>
                <input type="checkbox" checked={selected.size === orders.length && orders.length > 0} onChange={toggleAll} />
                Select all
              </label>
              <button onClick={sendToQuickBooks} disabled={sending || selected.size === 0} style={{ padding: '8px 16px', background: sending || selected.size === 0 ? '#aaa' : '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: sending || selected.size === 0 ? 'not-allowed' : 'pointer' }}>
                {sending ? 'Sending...' : `Send ${selected.size} to QuickBooks`}
              </button>
            </div>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead><tr>{['', 'Order #', 'Customer', 'Items', 'Total', 'Rep', 'Date', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.db_id}>
                    <td style={{ padding: '8px', borderBottom: '0.5px solid #f0f0ee' }}><input type="checkbox" checked={selected.has(o.db_id)} onChange={() => toggle(o.db_id)} /></td>
                    <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '10px', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{o.order_number}</td>
                    <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{o.customer}</td>
                    <td style={{ padding: '8px', color: '#666', fontSize: '11px', borderBottom: '0.5px solid #f0f0ee' }}>{o.items.map(it => `${it.name} x${it.qty}`).join(', ')}</td>
                    <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>${o.total.toFixed(2)}</td>
                    <td style={{ padding: '8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{o.rep}</td>
                    <td style={{ padding: '8px', color: '#888', borderBottom: '0.5px solid #f0f0ee' }}>{new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td style={{ padding: '8px', borderBottom: '0.5px solid #f0f0ee' }}><button onClick={() => removeOrder(o.db_id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#A32D2D', fontSize: '11px' }}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}

function InventoryTab() {
  const [flowers, setFlowers] = useState<Flower[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newFlower, setNewFlower] = useState({ name: '', variety: '', unit: 'bucket', morning_qty: 20, price: 0 })
  const [feedback, setFeedback] = useState('')
  const [edits, setEdits] = useState<{ [key: number]: { morning_qty: number; price: number } }>({})

  function loadFlowers() {
    setLoading(true)
    fetch('/api/flowers/list').then(r => r.json()).then(data => { setFlowers(data.flowers || []); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { loadFlowers() }, [])

  async function addFlower() {
    if (!newFlower.name || !newFlower.variety) { setFeedback('Please fill in name and variety.'); return }
    const colors2 = ['#D4537E', '#EF9F27', '#AFA9EC', '#9FE1CB', '#F0997B', '#ED93B1']
    try {
      const res = await fetch('/api/flowers/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newFlower.name, variety: newFlower.variety, color: colors2[flowers.length % colors2.length], unit: newFlower.unit, stems_per_unit: 10, morning_qty: newFlower.morning_qty, current_stock: newFlower.morning_qty, price: newFlower.price }) })
      const data = await res.json()
      if (data.success) { setFeedback(`✓ ${newFlower.name} added!`); setNewFlower({ name: '', variety: '', unit: 'bucket', morning_qty: 20, price: 0 }); setShowAdd(false); loadFlowers() }
      else setFeedback('Could not add flower: ' + data.error)
    } catch { setFeedback('Could not add flower.') }
    setTimeout(() => setFeedback(''), 3000)
  }

  async function removeFlower(id: number) {
    if (!confirm('Remove this flower?')) return
    try { await fetch('/api/flowers/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); setFeedback('✓ Flower removed.'); loadFlowers() }
    catch { setFeedback('Could not remove flower.') }
    setTimeout(() => setFeedback(''), 3000)
  }

  function handleEditChange(id: number, field: 'morning_qty' | 'price', value: number, current: Flower) {
    setEdits(prev => ({ ...prev, [id]: { morning_qty: field === 'morning_qty' ? value : (prev[id]?.morning_qty ?? current.morning_qty), price: field === 'price' ? value : (prev[id]?.price ?? current.price) } }))
  }

  async function saveEdit(f: Flower) {
    const edit = edits[f.id]
    if (!edit) return
    try {
      await fetch('/api/flowers/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: f.id, name: f.name, variety: f.variety, color: f.color, unit: f.unit, stems_per_unit: f.stems_per_unit, morning_qty: edit.morning_qty, current_stock: f.current_stock, price: edit.price, active: true }) })
      setFeedback(`✓ ${f.name} updated.`); loadFlowers(); setEdits(prev => { const u = { ...prev }; delete u[f.id]; return u })
    } catch { setFeedback('Could not save changes.') }
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
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Morning quantity</label><input type="number" value={newFlower.morning_qty} onChange={e => setNewFlower(p => ({ ...p, morning_qty: parseInt(e.target.value) || 0 }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Price per unit ($)</label><input type="number" value={newFlower.price} onChange={e => setNewFlower(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={addFlower} style={{ padding: '7px 14px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Add to inventory</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: '7px 12px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
        {loading ? <div style={{ fontSize: '12px', color: '#888' }}>Loading...</div> : flowers.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#888', textAlign: 'center', padding: '1.5rem 0' }}>No flowers yet. Click &quot;+ Add flower&quot; to add your first one.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 80px 60px', gap: '6px', padding: '0 0 6px', borderBottom: '0.5px solid #e5e5e3', marginBottom: '4px' }}>
              {['Flower', 'Morning qty', 'In stock', 'Price', ''].map(h => <div key={h} style={{ fontSize: '10px', fontWeight: '500', color: '#888' }}>{h}</div>)}
            </div>
            {flowers.map(f => {
              const pct = Math.round(f.current_stock / f.morning_qty * 100)
              const stockColor = f.current_stock === 0 ? '#A32D2D' : pct <= 20 ? '#854F0B' : '#3B6D11'
              const edit = edits[f.id]
              return (
                <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 80px 60px', gap: '6px', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid #f0f0ee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                    <div><div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>{f.name}</div><div style={{ fontSize: '10px', color: '#888' }}>{f.variety} · {f.unit}</div></div>
                  </div>
                  <input type="number" value={edit?.morning_qty ?? f.morning_qty} onChange={e => handleEditChange(f.id, 'morning_qty', parseInt(e.target.value) || 0, f)} style={{ padding: '5px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }} />
                  <div style={{ fontSize: '12px', fontWeight: '500', color: stockColor }}>{f.current_stock} left</div>
                  <input type="number" value={edit?.price ?? f.price} onChange={e => handleEditChange(f.id, 'price', parseFloat(e.target.value) || 0, f)} style={{ padding: '5px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }} />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {edit && <button onClick={() => saveEdit(f)} style={{ border: 'none', background: '#EAF3DE', borderRadius: '6px', cursor: 'pointer', color: '#3B6D11', fontSize: '11px', padding: '4px 6px' }}>Save</button>}
                    <button onClick={() => removeFlower(f.id)} style={{ border: 'none', background: '#FCEBEB', borderRadius: '6px', cursor: 'pointer', color: '#A32D2D', fontSize: '11px', padding: '4px 6px' }}>Del</button>
                  </div>
                </div>
              )
            })}
          </>
        )}
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

  function saveTiers() { setFeedback('✓ Tiers saved!'); setTimeout(() => setFeedback(''), 3000) }

  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Commission Tiers</div>
      {feedback && <div style={{ marginBottom: '10px', fontSize: '12px', color: '#3B6D11', background: '#EAF3DE', padding: '8px 12px', borderRadius: '8px' }}>{feedback}</div>}
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '10px' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Edit tiers below. Changes take effect next month.</div>
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
        <button onClick={saveTiers} style={{ marginTop: '10px', padding: '8px 16px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Save changes</button>
      </div>
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Commission owed -- this month</div>
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
              <td style={{ padding: '9px 8px', fontWeight: '500', color: '#111' }}>Total owed</td>
              <td colSpan={3} style={{ padding: '9px 8px', fontWeight: '600', color: '#3B6D11', fontSize: '14px' }}>${leaderboard.reduce((s, r) => s + r.commission, 0).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'rep' })
  const [feedback, setFeedback] = useState('')
  const [tempPasswordShown, setTempPasswordShown] = useState<{ email: string; password: string } | null>(null)

  function loadUsers() {
    setLoading(true)
    fetch('/api/users/list').then(r => r.json()).then(data => { setUsers(data.users || []); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [])

  async function inviteUser() {
    if (!newUser.name || !newUser.email) { setFeedback('Please fill in name and email.'); return }
    try {
      const res = await fetch('/api/users/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) })
      const data = await res.json()
      if (data.success) { setTempPasswordShown({ email: newUser.email, password: data.tempPassword }); setNewUser({ name: '', email: '', role: 'rep' }); setShowInvite(false); loadUsers() }
      else { setFeedback('Could not create user: ' + data.error); setTimeout(() => setFeedback(''), 4000) }
    } catch { setFeedback('Could not create user.'); setTimeout(() => setFeedback(''), 4000) }
  }

  async function removeUser(id: string) {
    if (!confirm('Remove this user?')) return
    try { await fetch('/api/users/remove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); setFeedback('✓ User removed.'); loadUsers() }
    catch { setFeedback('Could not remove user.') }
    setTimeout(() => setFeedback(''), 3000)
  }

  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>User Access & Roles</div>
      {tempPasswordShown && (
        <div style={{ marginBottom: '10px', background: '#E6F1FB', border: '0.5px solid #185FA5', borderRadius: '8px', padding: '12px 14px' }}>
          <div style={{ fontSize: '12px', fontWeight: '500', color: '#0C447C', marginBottom: '6px' }}>✓ User created! Share these login details:</div>
          <div style={{ fontSize: '12px', color: '#111', fontFamily: 'monospace' }}>Email: {tempPasswordShown.email}</div>
          <div style={{ fontSize: '12px', color: '#111', fontFamily: 'monospace', marginBottom: '8px' }}>Temporary password: {tempPasswordShown.password}</div>
          <button onClick={() => setTempPasswordShown(null)} style={{ padding: '5px 10px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Got it, dismiss</button>
        </div>
      )}
      {feedback && <div style={{ marginBottom: '10px', fontSize: '12px', color: feedback.startsWith('✓') ? '#3B6D11' : '#A32D2D', background: feedback.startsWith('✓') ? '#EAF3DE' : '#FCEBEB', padding: '8px 12px', borderRadius: '8px' }}>{feedback}</div>}
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>Control who can log in and what they can do.</div>
          <button onClick={() => setShowInvite(!showInvite)} style={{ padding: '7px 14px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>+ Invite user</button>
        </div>
        {showInvite && (
          <div style={{ background: '#f9f9f8', borderRadius: '10px', padding: '1rem', marginBottom: '12px', border: '0.5px solid #185FA5' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#111', marginBottom: '10px' }}>Invite new user</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '8px', marginBottom: '10px' }}>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Full name</label><input value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="e.g. John Smith" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Email</label><input value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Role</label><select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }}><option value='rep'>Sales Rep</option><option value='manager'>Manager</option></select></div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={inviteUser} style={{ padding: '7px 14px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Create user</button>
              <button onClick={() => setShowInvite(false)} style={{ padding: '7px 12px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
        {loading ? <div style={{ fontSize: '12px', color: '#888' }}>Loading...</div> : (
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead><tr>{['Name', 'Email', 'Role', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: '9px 8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{u.full_name}</td>
                  <td style={{ padding: '9px 8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{u.email}</td>
                  <td style={{ padding: '9px 8px', borderBottom: '0.5px solid #f0f0ee' }}><span style={{ background: u.role === 'manager' ? '#FAEEDA' : '#E6F1FB', color: u.role === 'manager' ? '#633806' : '#185FA5', padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{u.role}</span></td>
                  <td style={{ padding: '9px 8px', borderBottom: '0.5px solid #f0f0ee' }}>{u.role !== 'manager' && <button onClick={() => removeUser(u.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#A32D2D', fontSize: '11px' }}>Remove</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function SettingsTab() {
  const [settings, setSettings] = useState({ name: '', address: '', city: '', state: '', zip: '', phone: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    fetch('/api/settings/get').then(r => r.json()).then(data => { if (data.settings) setSettings(data.settings); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function save() {
    try {
      const res = await fetch('/api/settings/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
      const data = await res.json()
      if (data.success) setFeedback('✓ Company info updated!')
      else setFeedback('Could not save: ' + data.error)
    } catch { setFeedback('Could not save changes.') }
    setTimeout(() => setFeedback(''), 4000)
  }

  if (loading) return <div style={{ fontSize: '12px', color: '#888' }}>Loading...</div>

  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Company Settings</div>
      {feedback && <div style={{ marginBottom: '10px', fontSize: '12px', color: feedback.startsWith('✓') ? '#3B6D11' : '#A32D2D', background: feedback.startsWith('✓') ? '#EAF3DE' : '#FCEBEB', padding: '8px 12px', borderRadius: '8px' }}>{feedback}</div>}
      <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1.25rem', maxWidth: '500px' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>This information appears on every printed shipping label.</div>
        {[
          { label: 'Company name', key: 'name' },
          { label: 'Address', key: 'address' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>{f.label}</label>
            <input value={settings[f.key as keyof typeof settings]} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '13px', color: '#111' }} />
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {[{ label: 'City', key: 'city' }, { label: 'State', key: 'state' }, { label: 'ZIP', key: 'zip' }].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>{f.label}</label>
              <input value={settings[f.key as keyof typeof settings]} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '13px', color: '#111' }} />
            </div>
          ))}
        </div>
        {[{ label: 'Phone', key: 'phone' }, { label: 'Email', key: 'email' }].map(f => (
          <div key={f.key} style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>{f.label}</label>
            <input value={settings[f.key as keyof typeof settings]} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '13px', color: '#111' }} />
          </div>
        ))}
        <button onClick={save} style={{ padding: '9px 18px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Save changes</button>
      </div>
    </div>
  )
}

export default function Manager() {
  useAuth('manager')
  const [activeTab, setActiveTab] = useState('overview')
  const [leaderboard, setLeaderboard] = useState<LeaderboardRep[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} pendingCount={pendingCount} />
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        {activeTab === 'overview' && <OverviewTab leaderboard={leaderboard} recentOrders={recentOrders} loading={loading} />}
        {activeTab === 'reps' && <RepsTab leaderboard={leaderboard} loading={loading} />}
        {activeTab === 'pending' && <PendingInvoicesTab onCountChange={setPendingCount} />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'tiers' && <TiersTab leaderboard={leaderboard} />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}