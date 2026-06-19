'use client'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', active: false },
  { label: 'Flower Availability', href: '/flowers', active: true },
  { label: 'New Order', href: '/orders', active: false },
  { label: 'My Customers', href: '/customers', active: false },
  { label: 'Quotes', href: '/quotes', active: false },
  { label: 'My Commission', href: '/commission', active: false },
]

type Flower = { id: number; name: string; variety: string; color: string; unit: string; stems_per_unit: number; morning_qty: number; current_stock: number; price: number }
type CustomerOption = { id: number; name: string }
type LogEntry = { time: string; flower: string; qty: number; unit: string; customer: string }

export default function Flowers() {
  const [userName, setUserName] = useState('there')
  const [userInitials, setUserInitials] = useState('?')
  const [flowers, setFlowers] = useState<Flower[]>([])
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [selected, setSelected] = useState<Flower | null>(null)
  const [qty, setQty] = useState(1)
  const [customer, setCustomer] = useState('')
  const [filter, setFilter] = useState('all')
  const [log, setLog] = useState<LogEntry[]>([])
  const [feedback, setFeedback] = useState('')

  function loadFlowers() {
    setLoading(true)
    fetch('/api/flowers/list')
      .then(r => r.json())
      .then(data => {
        setFlowers(data.flowers || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    const name = localStorage.getItem('user_name') || 'there'
    const initials = localStorage.getItem('user_initials') || name.split(' ').map(w => w[0]).join('').toUpperCase() || '?'
    setUserName(name)
    setUserInitials(initials)

    const repId = localStorage.getItem('user_id') || ''
    if (repId) {
      fetch(`/api/customers/list?rep_id=${repId}`)
        .then(r => r.json())
        .then(data => {
          const list = data.customers || []
          setCustomers(list)
          if (list.length > 0) setCustomer(list[0].name)
        })
        .catch(() => setCustomers([]))
    }

    loadFlowers()
  }, [])

  function getStatus(f: Flower) {
    if (f.current_stock === 0) return 'out'
    if (f.current_stock / f.morning_qty <= 0.2) return 'low'
    return 'ok'
  }

  async function doSell() {
    if (!selected) return
    if (qty > selected.current_stock) {
      setFeedback(`Not enough stock. Only ${selected.current_stock} available.`)
      return
    }
    if (!customer) {
      setFeedback('Please select a customer.')
      return
    }
    try {
      const res = await fetch('/api/flowers/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, qty }),
      })
      const data = await res.json()
      if (data.success) {
        const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        setLog(prev => [{ time, flower: `${selected.name} (${selected.variety})`, qty, unit: selected.unit, customer }, ...prev])
        setFeedback(`✓ ${qty} ${selected.unit}${qty > 1 ? 's' : ''} sold to ${customer}. Stock: ${data.flower.current_stock} left.`)
        setSelected(data.flower)
        loadFlowers()
      } else {
        setFeedback('Could not update stock: ' + data.error)
      }
    } catch {
      setFeedback('Could not update stock.')
    }
  }

  const filtered = flowers.filter(f => {
    if (filter === 'bucket') return f.unit === 'bucket'
    if (filter === 'bunch') return f.unit === 'bunch'
    if (filter === 'instock') return f.current_stock > 0 && getStatus(f) === 'ok'
    if (filter === 'low') return getStatus(f) === 'low'
    if (filter === 'out') return f.current_stock === 0
    return true
  })

  const inStock = flowers.filter(f => f.current_stock > 0).length
  const low = flowers.filter(f => getStatus(f) === 'low').length
  const out = flowers.filter(f => f.current_stock === 0).length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#f9f9f8' }}>

      {/* Sidebar */}
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
            <a key={item.label} href={item.href} style={{ display: 'block', padding: '9px 16px', fontSize: '12px', color: item.active ? '#185FA5' : '#444', fontWeight: item.active ? '500' : '400', borderLeft: item.active ? '2px solid #185FA5' : '2px solid transparent', background: item.active ? '#f0f7ff' : 'transparent', textDecoration: 'none' }}>
              {item.label}
            </a>
          ))}
        </div>
        <a href="/" style={{ marginTop: 'auto', padding: '14px 16px', borderTop: '0.5px solid #e5e5e3', fontSize: '12px', color: '#888', textDecoration: 'none', display: 'block' }}>Sign out</a>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: '18px', fontWeight: '500', color: '#111' }}>Flower Availability</div>
          <div style={{ fontSize: '11px', color: '#888' }}>
            <span style={{ color: '#3B6D11' }}>{inStock} in stock</span> &nbsp;·&nbsp;
            <span style={{ color: '#854F0B' }}>{low} low</span> &nbsp;·&nbsp;
            <span style={{ color: '#A32D2D' }}>{out} sold out</span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {['all', 'bucket', 'bunch', 'instock', 'low', 'out'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '99px', border: '0.5px solid #e5e5e3', background: filter === f ? '#185FA5' : 'white', color: filter === f ? 'white' : '#444', cursor: 'pointer' }}>
              {f === 'all' ? 'All' : f === 'instock' ? 'In stock' : f === 'low' ? 'Low stock' : f === 'out' ? 'Sold out' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
            </button>
          ))}
        </div>

        {/* Sell panel */}
        {selected && (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: selected.color }} />
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{selected.name} — {selected.variety}</div>
              </div>
              <button onClick={() => { setSelected(null); setFeedback('') }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: '#888' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {[
                { label: 'Available', value: `${selected.current_stock} ${selected.unit}s` },
                { label: 'Sold today', value: `${selected.morning_qty - selected.current_stock} sold` },
                { label: 'Price', value: `$${selected.price}/${selected.unit}` },
              ].map(m => (
                <div key={m.label} style={{ background: '#f9f9f8', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>{m.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#111' }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {customers.length === 0 ? (
                <div style={{ flex: 1, fontSize: '12px', color: '#888' }}>No customers yet. <a href="/customers" style={{ color: '#185FA5' }}>Add one first →</a></div>
              ) : (
                <select value={customer} onChange={e => setCustomer(e.target.value)} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px' }}>
                  {customers.map(c => <option key={c.id}>{c.name}</option>)}
                </select>
              )}
              <input type="number" value={qty} min={1} max={selected.current_stock} onChange={e => setQty(parseInt(e.target.value) || 1)} style={{ width: '70px', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px' }} />
              <button onClick={doSell} style={{ padding: '7px 16px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                Sell & update
              </button>
            </div>
            {feedback && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: feedback.startsWith('✓') ? '#3B6D11' : '#A32D2D' }}>{feedback}</div>
            )}
          </div>
        )}

        {/* Flower grid */}
        {loading ? (
          <div style={{ fontSize: '12px', color: '#888' }}>Loading...</div>
        ) : flowers.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#888', textAlign: 'center', padding: '2rem 0' }}>No flowers added yet. Ask your manager to add inventory.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', marginBottom: '1rem' }}>
            {filtered.map(f => {
              const pct = Math.round(f.current_stock / f.morning_qty * 100)
              const s = getStatus(f)
              const barColor = f.current_stock === 0 ? '#E24B4A' : s === 'low' ? '#EF9F27' : '#639922'
              const sold = f.morning_qty - f.current_stock
              return (
                <div key={f.id} onClick={() => { setSelected(f); setFeedback(''); setQty(1) }} style={{ background: 'white', border: `0.5px solid ${selected?.id === f.id ? '#185FA5' : '#e5e5e3'}`, borderRadius: '10px', padding: '12px', cursor: 'pointer', opacity: f.current_stock === 0 ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>{f.name}</div>
                  </div>
                  <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>{f.variety} · {f.stems_per_unit} stems/{f.unit}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '600', color: '#111' }}>{f.current_stock}<span style={{ fontSize: '10px', color: '#888', marginLeft: '2px' }}>{f.unit}s</span></span>
                    <span style={{ fontSize: '10px', color: '#888' }}>{sold} sold</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '99px', background: '#f0f0ee', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ width: `${Math.max(pct, 2)}%`, height: '100%', borderRadius: '99px', background: barColor }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 6px', borderRadius: '99px', background: f.current_stock === 0 ? '#FCEBEB' : s === 'low' ? '#FAEEDA' : '#EAF3DE', color: f.current_stock === 0 ? '#A32D2D' : s === 'low' ? '#854F0B' : '#3B6D11' }}>
                      {f.current_stock === 0 ? 'Sold out' : s === 'low' ? 'Low stock' : 'In stock'}
                    </span>
                    <span style={{ fontSize: '10px', color: '#888' }}>${f.price}/{f.unit}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Sales log */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Today&apos;s sales log</div>
          {log.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#888' }}>No sales yet today. Click a flower to sell.</div>
          ) : log.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '11px', padding: '5px 0', borderBottom: '0.5px solid #f0f0ee' }}>
              <span style={{ color: '#888', width: '60px', flexShrink: 0 }}>{l.time}</span>
              <span style={{ fontWeight: '500', flex: 1, color: '#111' }}>{l.flower}</span>
              <span style={{ color: '#888' }}>{l.qty} {l.unit}s → {l.customer}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}