'use client'
import { useState } from 'react'

const initialFlowers = [
  { id: 1, name: 'Roses', variety: 'Red Freedom', color: '#D4537E', unit: 'bucket', stems: 25, qty: 24, stock: 18, price: 28 },
  { id: 2, name: 'Roses', variety: 'White Akito', color: '#B4B2A9', unit: 'bucket', stems: 25, qty: 20, stock: 12, price: 26 },
  { id: 3, name: 'Sunflowers', variety: 'ProCut Orange', color: '#EF9F27', unit: 'bunch', stems: 10, qty: 30, stock: 30, price: 18 },
  { id: 4, name: 'Tulips', variety: 'Pink Impression', color: '#ED93B1', unit: 'bunch', stems: 10, qty: 40, stock: 5, price: 14 },
  { id: 5, name: 'Lilies', variety: 'Stargazer', color: '#F0997B', unit: 'bucket', stems: 10, qty: 15, stock: 8, price: 32 },
  { id: 6, name: 'Carnations', variety: 'Mixed Colors', color: '#9FE1CB', unit: 'bunch', stems: 20, qty: 25, stock: 0, price: 12 },
  { id: 7, name: 'Hydrangeas', variety: 'Blue Hortensia', color: '#AFA9EC', unit: 'bucket', stems: 5, qty: 18, stock: 14, price: 38 },
  { id: 8, name: 'Gerbera Daisies', variety: 'Rainbow Mix', color: '#D85A30', unit: 'bunch', stems: 10, qty: 25, stock: 22, price: 16 },
  { id: 9, name: 'Alstroemeria', variety: 'Yellow/Orange', color: '#FAC775', unit: 'bunch', stems: 10, qty: 20, stock: 3, price: 11 },
]

const customers = ['Maria Gonzalez', 'James Thornton', 'Priya Patel', 'Carlos Ruiz', 'Aisha Nwosu']

type Flower = typeof initialFlowers[0]
type LogEntry = { time: string; flower: string; qty: number; unit: string; customer: string }

export default function Flowers() {
  const [flowers, setFlowers] = useState(initialFlowers)
  const [selected, setSelected] = useState<Flower | null>(null)
  const [qty, setQty] = useState(1)
  const [customer, setCustomer] = useState(customers[0])
  const [filter, setFilter] = useState('all')
  const [log, setLog] = useState<LogEntry[]>([])
  const [feedback, setFeedback] = useState('')

  function getStatus(f: Flower) {
    if (f.stock === 0) return 'out'
    if (f.stock / f.qty <= 0.2) return 'low'
    return 'ok'
  }

  function doSell() {
    if (!selected) return
    if (qty > selected.stock) {
      setFeedback(`Not enough stock. Only ${selected.stock} available.`)
      return
    }
    const updated = flowers.map(f => f.id === selected.id ? { ...f, stock: f.stock - qty } : f)
    setFlowers(updated)
    const updatedSelected = updated.find(f => f.id === selected.id)!
    setSelected(updatedSelected)
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    setLog(prev => [{ time, flower: `${selected.name} (${selected.variety})`, qty, unit: selected.unit, customer }, ...prev])
    setFeedback(`✓ ${qty} ${selected.unit}${qty > 1 ? 's' : ''} sold to ${customer}. Stock: ${updatedSelected.stock} left.`)
  }

  const filtered = flowers.filter(f => {
    if (filter === 'bucket') return f.unit === 'bucket'
    if (filter === 'bunch') return f.unit === 'bunch'
    if (filter === 'instock') return f.stock > 0 && getStatus(f) === 'ok'
    if (filter === 'low') return getStatus(f) === 'low'
    if (filter === 'out') return f.stock === 0
    return true
  })

  const inStock = flowers.filter(f => f.stock > 0).length
  const low = flowers.filter(f => getStatus(f) === 'low').length
  const out = flowers.filter(f => f.stock === 0).length

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
          {[
            { label: 'Dashboard', href: '/dashboard', active: false },
            { label: 'Flower Availability', href: '/flowers', active: true },
            { label: 'New Order', href: '/orders', active: false },
            { label: 'My Customers', href: '/customers', active: false },
            { label: 'Quotes', href: '/quotes', active: false },
            { label: 'My Commission', href: '/commission', active: false },
          ].map(item => (
            <a key={item.label} href={item.href} style={{ display: 'block', padding: '9px 16px', fontSize: '12px', color: item.active ? '#185FA5' : '#444', fontWeight: item.active ? '500' : '400', borderLeft: item.active ? '2px solid #185FA5' : '2px solid transparent', background: item.active ? '#f0f7ff' : 'transparent', textDecoration: 'none' }}>
              {item.label}
            </a>
          ))}
        </div>
        <div style={{ marginTop: 'auto', padding: '14px 16px', borderTop: '0.5px solid #e5e5e3', fontSize: '12px', color: '#888', cursor: 'pointer' }}>
          Sign out
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: '18px', fontWeight: '500', color: '#111' }}>Flower Availability</div>
          <div style={{ fontSize: '11px', color: '#888' }}>
            🕕 Restocked 6:00 AM &nbsp;·&nbsp;
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
                { label: 'Available', value: `${selected.stock} ${selected.unit}s` },
                { label: 'Sold today', value: `${selected.qty - selected.stock} sold` },
                { label: 'Price', value: `$${selected.price}/${selected.unit}` },
              ].map(m => (
                <div key={m.label} style={{ background: '#f9f9f8', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>{m.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#111' }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select value={customer} onChange={e => setCustomer(e.target.value)} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px' }}>
                {customers.map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="number" value={qty} min={1} max={selected.stock} onChange={e => setQty(parseInt(e.target.value) || 1)} style={{ width: '70px', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px' }} />
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', marginBottom: '1rem' }}>
          {filtered.map(f => {
            const pct = Math.round(f.stock / f.qty * 100)
            const s = getStatus(f)
            const barColor = f.stock === 0 ? '#E24B4A' : s === 'low' ? '#EF9F27' : '#639922'
            const sold = f.qty - f.stock
            return (
              <div key={f.id} onClick={() => { setSelected(f); setFeedback(''); setQty(1) }} style={{ background: 'white', border: `0.5px solid ${selected?.id === f.id ? '#185FA5' : '#e5e5e3'}`, borderRadius: '10px', padding: '12px', cursor: 'pointer', opacity: f.stock === 0 ? 0.6 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>{f.name}</div>
                </div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>{f.variety} · {f.stems} stems/{f.unit}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '600', color: '#111' }}>{f.stock}<span style={{ fontSize: '10px', color: '#888', marginLeft: '2px' }}>{f.unit}s</span></span>
                  <span style={{ fontSize: '10px', color: '#888' }}>{sold} sold</span>
                </div>
                <div style={{ height: '4px', borderRadius: '99px', background: '#f0f0ee', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ width: `${Math.max(pct, 2)}%`, height: '100%', borderRadius: '99px', background: barColor }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 6px', borderRadius: '99px', background: f.stock === 0 ? '#FCEBEB' : s === 'low' ? '#FAEEDA' : '#EAF3DE', color: f.stock === 0 ? '#A32D2D' : s === 'low' ? '#854F0B' : '#3B6D11' }}>
                    {f.stock === 0 ? 'Sold out' : s === 'low' ? 'Low stock' : 'In stock'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#888' }}>${f.price}/{f.unit}</span>
                </div>
              </div>
            )
          })}
        </div>

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