'use client'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', active: false },
  { label: 'Flower Availability', href: '/flowers', active: false },
  { label: 'New Order', href: '/orders', active: false },
  { label: 'My Customers', href: '/customers', active: false },
  { label: 'Quotes', href: '/quotes', active: true },
  { label: 'My Commission', href: '/commission', active: false },
]

type Quote = {
  id: string
  customer: string
  email: string
  items: string
  value: number
  status: 'open' | 'sent' | 'accepted' | 'declined'
  date: string
  notes: string
}

const initialQuotes: Quote[] = [
  { id: 'QT-1041', customer: 'Aisha Nwosu', email: 'aisha.n@corp.io', items: 'Roses x20 buckets, Hydrangeas x10 buckets', value: 940, status: 'sent', date: 'Jun 14', notes: 'Waiting on confirmation' },
  { id: 'QT-1038', customer: 'James Thornton', email: 'j.thornton@biz.net', items: 'Hydrangeas x10 buckets', value: 380, status: 'open', date: 'Jun 12', notes: '' },
  { id: 'QT-1035', customer: 'Maria Gonzalez', email: 'm.gonzalez@email.com', items: 'Sunflowers x15 bunches, Tulips x10 bunches', value: 410, status: 'accepted', date: 'Jun 10', notes: 'Convert to order' },
  { id: 'QT-1030', customer: 'Priya Patel', email: 'priya.p@mailbox.org', items: 'Lilies x4 buckets', value: 128, status: 'accepted', date: 'Jun 5', notes: '' },
  { id: 'QT-1028', customer: 'Carlos Ruiz', email: 'c.ruiz@example.com', items: 'Carnations x20 bunches', value: 240, status: 'open', date: 'Jun 3', notes: 'Follow up needed' },
  { id: 'QT-1022', customer: 'Aisha Nwosu', email: 'aisha.n@corp.io', items: 'Gerbera Daisies x15 bunches', value: 240, status: 'declined', date: 'May 28', notes: 'Price too high — try again next month' },
]

const flowerOptions = [
  { name: 'Roses (Red Freedom)', price: 28, unit: 'bucket' },
  { name: 'Roses (White Akito)', price: 26, unit: 'bucket' },
  { name: 'Sunflowers', price: 18, unit: 'bunch' },
  { name: 'Tulips', price: 14, unit: 'bunch' },
  { name: 'Lilies', price: 32, unit: 'bucket' },
  { name: 'Hydrangeas', price: 38, unit: 'bucket' },
  { name: 'Gerbera Daisies', price: 16, unit: 'bunch' },
  { name: 'Alstroemeria', price: 11, unit: 'bunch' },
]

const customers = ['Maria Gonzalez', 'James Thornton', 'Priya Patel', 'Carlos Ruiz', 'Aisha Nwosu']

let quoteCounter = 1041

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes)
  const [filter, setFilter] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState<Quote | null>(null)
  const [newQuote, setNewQuote] = useState({ customer: '', email: '', notes: '' })
  const [items, setItems] = useState([{ name: flowerOptions[0].name, price: flowerOptions[0].price, qty: 1, sub: flowerOptions[0].price }])
  const [feedback, setFeedback] = useState('')

  function handleItemChange(index: number, field: string, value: string) {
    const updated = [...items]
    if (field === 'name') {
      const flower = flowerOptions.find(f => f.name === value)!
      updated[index] = { ...updated[index], name: value, price: flower.price, sub: flower.price * updated[index].qty }
    } else if (field === 'qty') {
      const qty = parseInt(value) || 1
      updated[index] = { ...updated[index], qty, sub: updated[index].price * qty }
    }
    setItems(updated)
  }

  function addItem() {
    setItems([...items, { name: flowerOptions[0].name, price: flowerOptions[0].price, qty: 1, sub: flowerOptions[0].price }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  const total = items.reduce((s, i) => s + i.sub, 0)

  function saveQuote() {
    if (!newQuote.customer) { setFeedback('Please select a customer.'); return }
    quoteCounter++
    const q: Quote = {
      id: `QT-${quoteCounter}`,
      customer: newQuote.customer,
      email: customers.includes(newQuote.customer) ? '' : '',
      items: items.map(it => `${it.name} x${it.qty}`).join(', '),
      value: total,
      status: 'open',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      notes: newQuote.notes,
    }
    setQuotes(prev => [q, ...prev])
    setShowNew(false)
    setNewQuote({ customer: '', email: '', notes: '' })
    setItems([{ name: flowerOptions[0].name, price: flowerOptions[0].price, qty: 1, sub: flowerOptions[0].price }])
    setFeedback('✓ Quote created!')
    setTimeout(() => setFeedback(''), 3000)
  }

  function sendQuote(id: string) {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: 'sent' } : q))
    setSelected(prev => prev?.id === id ? { ...prev, status: 'sent' } : prev)
    setFeedback('✓ Quote sent to customer!')
    setTimeout(() => setFeedback(''), 3000)
  }

  function convertToOrder(id: string) {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: 'accepted' } : q))
    setFeedback('✓ Quote accepted! Go to New Order to create the order.')
    setTimeout(() => setFeedback(''), 4000)
  }

  function deleteQuote(id: string) {
    if (!confirm('Delete this quote?')) return
    setQuotes(prev => prev.filter(q => q.id !== id))
    setSelected(null)
  }

  const filtered = quotes.filter(q => filter === 'all' || q.status === filter)

  const totalValue = quotes.filter(q => q.status === 'open' || q.status === 'sent').reduce((s, q) => s + q.value, 0)
  const accepted = quotes.filter(q => q.status === 'accepted').length
  const convRate = Math.round(accepted / quotes.length * 100)

  function statusBadge(status: string) {
    if (status === 'accepted') return { bg: '#EAF3DE', color: '#3B6D11', label: 'Accepted' }
    if (status === 'sent') return { bg: '#E6F1FB', color: '#185FA5', label: 'Sent' }
    if (status === 'declined') return { bg: '#FCEBEB', color: '#A32D2D', label: 'Declined' }
    return { bg: '#FAEEDA', color: '#854F0B', label: 'Open' }
  }

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
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Quotes & Invoices</div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1rem' }}>
          {[
            { label: 'Open quotes', value: quotes.filter(q => q.status === 'open' || q.status === 'sent').length.toString() },
            { label: 'Potential value', value: `$${totalValue.toLocaleString()}` },
            { label: 'Accepted (Jun)', value: accepted.toString() },
            { label: 'Conversion rate', value: `${convRate}%` },
          ].map(m => (
            <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#111' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {feedback && <div style={{ marginBottom: '10px', fontSize: '12px', color: feedback.startsWith('✓') ? '#3B6D11' : '#A32D2D', background: feedback.startsWith('✓') ? '#EAF3DE' : '#FCEBEB', padding: '8px 12px', borderRadius: '8px' }}>{feedback}</div>}

        {/* Filters and new button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['all', 'open', 'sent', 'accepted', 'declined'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '99px', border: '0.5px solid #e5e5e3', background: filter === f ? '#185FA5' : 'white', color: filter === f ? 'white' : '#444', cursor: 'pointer' }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setShowNew(!showNew)} style={{ padding: '8px 16px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>+ New quote</button>
        </div>

        {/* New quote form */}
        {showNew && (
          <div style={{ background: 'white', border: '0.5px solid #185FA5', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#111', marginBottom: '12px' }}>New quote</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Customer</label>
                <select value={newQuote.customer} onChange={e => setNewQuote(p => ({ ...p, customer: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }}>
                  <option value=''>— choose —</option>
                  {customers.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Notes</label>
                <input value={newQuote.notes} onChange={e => setNewQuote(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
              </div>
            </div>

            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 70px 24px', gap: '5px', paddingBottom: '6px', borderBottom: '0.5px solid #f0f0ee', marginBottom: '8px' }}>
              {['Flower', 'Qty', 'Subtotal', ''].map(h => <div key={h} style={{ fontSize: '10px', fontWeight: '500', color: '#888' }}>{h}</div>)}
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 70px 24px', gap: '5px', marginBottom: '6px', alignItems: 'center' }}>
                <select value={item.name} onChange={e => handleItemChange(i, 'name', e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }}>
                  {flowerOptions.map(f => <option key={f.name}>{f.name}</option>)}
                </select>
                <input type="number" value={item.qty} min={1} onChange={e => handleItemChange(i, 'qty', e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }} />
                <input value={`$${item.sub.toFixed(2)}`} readOnly style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#666', background: '#f9f9f8' }} />
                <button onClick={() => removeItem(i)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: '#888' }}>×</button>
              </div>
            ))}
            <button onClick={addItem} style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '6px', border: '0.5px solid #e5e5e3', background: 'transparent', cursor: 'pointer', color: '#444', marginBottom: '10px' }}>+ Add item</button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>Total: <span style={{ color: '#185FA5' }}>${total.toFixed(2)}</span></div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={saveQuote} style={{ padding: '8px 16px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Save quote</button>
                <button onClick={() => setShowNew(false)} style={{ padding: '8px 12px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Quotes table */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Quote #', 'Customer', 'Items', 'Value', 'Date', 'Status', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => {
                const badge = statusBadge(q.status)
                return (
                  <tr key={q.id} onClick={() => setSelected(q)} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '9px 8px', fontFamily: 'monospace', fontSize: '10px', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{q.id}</td>
                    <td style={{ padding: '9px 8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{q.customer}</td>
                    <td style={{ padding: '9px 8px', color: '#666', fontSize: '11px', borderBottom: '0.5px solid #f0f0ee' }}>{q.items}</td>
                    <td style={{ padding: '9px 8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>${q.value.toLocaleString()}</td>
                    <td style={{ padding: '9px 8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{q.date}</td>
                    <td style={{ padding: '9px 8px', borderBottom: '0.5px solid #f0f0ee' }}>
                      <span style={{ background: badge.bg, color: badge.color, padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{badge.label}</span>
                    </td>
                    <td style={{ padding: '9px 8px', borderBottom: '0.5px solid #f0f0ee' }}>
                      <button onClick={e => { e.stopPropagation(); deleteQuote(q.id) }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#A32D2D', fontSize: '11px' }}>Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Quote detail */}
        {selected && (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '500', color: '#111', marginBottom: '2px' }}>{selected.id} — {selected.customer}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>Created {selected.date} · {selected.items}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ padding: '6px 12px', border: '0.5px solid #e5e5e3', background: 'transparent', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', color: '#444' }}>Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1rem' }}>
              {[
                { label: 'Quote value', value: `$${selected.value.toLocaleString()}` },
                { label: 'Commission (7%)', value: `$${Math.round(selected.value * 0.07).toLocaleString()}` },
                { label: 'Status', value: statusBadge(selected.status).label },
              ].map(m => (
                <div key={m.label} style={{ background: '#f9f9f8', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>{m.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#111' }}>{m.value}</div>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div style={{ background: '#f9f9f8', borderRadius: '8px', padding: '10px', marginBottom: '1rem', fontSize: '12px', color: '#444' }}>
                <span style={{ color: '#888', marginRight: '6px' }}>Notes:</span>{selected.notes}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              {selected.status === 'open' && (
                <button onClick={() => sendQuote(selected.id)} style={{ padding: '8px 16px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  📧 Send to customer
                </button>
              )}
              {(selected.status === 'open' || selected.status === 'sent') && (
                <button onClick={() => convertToOrder(selected.id)} style={{ padding: '8px 16px', background: '#3B6D11', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  ✓ Mark as accepted
                </button>
              )}
              <a href="/orders" style={{ padding: '8px 16px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', textDecoration: 'none' }}>
                Convert to order →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}