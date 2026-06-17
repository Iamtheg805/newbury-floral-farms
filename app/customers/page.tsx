'use client'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', active: false },
  { label: 'Flower Availability', href: '/flowers', active: false },
  { label: 'New Order', href: '/orders', active: false },
  { label: 'My Customers', href: '/customers', active: true },
  { label: 'Quotes', href: '/quotes', active: false },
  { label: 'My Commission', href: '/commission', active: false },
]

type Customer = {
  id: number
  name: string
  email: string
  phone: string
  addr: string
  orders: number
  spent: string
  last: string
  status: 'active' | 'inactive' | 'vip'
  notes: string
  history: { id: string; date: string; items: string; total: string; status: string }[]
}

const initialCustomers: Customer[] = [
  { id: 1, name: 'Maria Gonzalez', email: 'm.gonzalez@email.com', phone: '(323) 555-0147', addr: '4821 Sunset Blvd, Los Angeles, CA 90028', orders: 7, spent: '$2,840', last: 'Jun 12', status: 'active', notes: 'Prefers morning calls. Orders every 2 weeks.', history: [{ id: 'ORD-20394', date: 'Jun 12', items: 'Roses x2 buckets, Sunflowers x3 bunches', total: '$110', status: 'shipped' }, { id: 'ORD-19801', date: 'May 28', items: 'Tulips x5 bunches', total: '$70', status: 'delivered' }] },
  { id: 2, name: 'James Thornton', email: 'j.thornton@biz.net', phone: '(714) 555-0288', addr: '390 Harbor Dr, Anaheim, CA 92805', orders: 12, spent: '$7,100', last: 'Jun 10', status: 'vip', notes: 'Large orders — always needs hydrangeas.', history: [{ id: 'ORD-20381', date: 'Jun 10', items: 'Hydrangeas x5 buckets', total: '$190', status: 'delivered' }, { id: 'ORD-19755', date: 'May 20', items: 'Lilies x3 buckets', total: '$96', status: 'delivered' }] },
  { id: 3, name: 'Priya Patel', email: 'priya.p@mailbox.org', phone: '(626) 555-0391', addr: '12 Oak Lane, Pasadena, CA 91101', orders: 4, spent: '$1,200', last: 'May 30', status: 'active', notes: '', history: [{ id: 'ORD-20100', date: 'May 30', items: 'Tulips x8 bunches', total: '$112', status: 'delivered' }] },
  { id: 4, name: 'Carlos Ruiz', email: 'c.ruiz@example.com', phone: '(213) 555-0054', addr: '88 Main St, Compton, CA 90220', orders: 2, spent: '$320', last: 'Mar 10', status: 'inactive', notes: 'Has not ordered in 3 months — needs follow up.', history: [{ id: 'ORD-17200', date: 'Mar 10', items: 'Carnations x5 bunches', total: '$60', status: 'delivered' }] },
  { id: 5, name: 'Aisha Nwosu', email: 'aisha.n@corp.io', phone: '(818) 555-0762', addr: '500 Commerce Ave, Burbank, CA 91502', orders: 19, spent: '$14,800', last: 'Jun 14', status: 'vip', notes: 'Best customer — orders every week. Always pays on time.', history: [{ id: 'ORD-20410', date: 'Jun 14', items: 'Roses x5 buckets, Tulips x10 bunches', total: '$280', status: 'processing' }, { id: 'ORD-20288', date: 'Jun 1', items: 'Hydrangeas x8 buckets', total: '$304', status: 'delivered' }] },
]

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [selected, setSelected] = useState<Customer | null>(null)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', addr: '', notes: '' })
  const [feedback, setFeedback] = useState('')

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  function addCustomer() {
    if (!newCustomer.name) { setFeedback('Please enter a name.'); return }
    const c: Customer = {
      id: Date.now(),
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      addr: newCustomer.addr,
      orders: 0,
      spent: '$0',
      last: '—',
      status: 'active',
      notes: newCustomer.notes,
      history: [],
    }
    setCustomers(prev => [...prev, c])
    setNewCustomer({ name: '', email: '', phone: '', addr: '', notes: '' })
    setShowAdd(false)
    setFeedback('✓ Customer added!')
    setTimeout(() => setFeedback(''), 3000)
  }

  function removeCustomer(id: number) {
    if (!confirm('Remove this customer?')) return
    setCustomers(prev => prev.filter(c => c.id !== id))
    setSelected(null)
  }

  function saveNote() {
    if (!selected || !newNote.trim()) return
    setCustomers(prev => prev.map(c => c.id === selected.id ? { ...c, notes: newNote } : c))
    setSelected(prev => prev ? { ...prev, notes: newNote } : null)
    setEditMode(false)
    setFeedback('✓ Note saved!')
    setTimeout(() => setFeedback(''), 3000)
  }

  function statusBadge(status: string) {
    if (status === 'vip') return { bg: '#EEEDFE', color: '#3C3489', label: 'VIP' }
    if (status === 'active') return { bg: '#EAF3DE', color: '#3B6D11', label: 'Active' }
    return { bg: '#FAEEDA', color: '#854F0B', label: 'Inactive' }
  }

  function orderStatusBadge(status: string) {
    if (status === 'delivered') return { bg: '#EAF3DE', color: '#3B6D11' }
    if (status === 'shipped' || status === 'in transit') return { bg: '#E6F1FB', color: '#185FA5' }
    return { bg: '#FAEEDA', color: '#854F0B' }
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
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>My Customers</div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1rem' }}>
          {[
            { label: 'Total customers', value: customers.length.toString() },
            { label: 'VIP customers', value: customers.filter(c => c.status === 'vip').length.toString() },
            { label: 'Need follow-up', value: customers.filter(c => c.status === 'inactive').length.toString() },
            { label: 'Total revenue', value: '$26,260' },
          ].map(m => (
            <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#111' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Search and add */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '13px', color: '#111' }} />
          <button onClick={() => setShowAdd(!showAdd)} style={{ padding: '8px 16px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>+ Add customer</button>
        </div>

        {feedback && <div style={{ marginBottom: '10px', fontSize: '12px', color: feedback.startsWith('✓') ? '#3B6D11' : '#A32D2D', background: feedback.startsWith('✓') ? '#EAF3DE' : '#FCEBEB', padding: '8px 12px', borderRadius: '8px' }}>{feedback}</div>}

        {/* Add customer form */}
        {showAdd && (
          <div style={{ background: 'white', border: '0.5px solid #185FA5', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#111', marginBottom: '12px' }}>New customer</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Full name *</label>
                <input value={newCustomer.name} onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))} placeholder="e.g. John Smith" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Email</label>
                <input value={newCustomer.email} onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Phone</label>
                <input value={newCustomer.phone} onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))} placeholder="(xxx) xxx-xxxx" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Address</label>
                <input value={newCustomer.addr} onChange={e => setNewCustomer(p => ({ ...p, addr: e.target.value }))} placeholder="Street, City, State ZIP" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
              </div>
            </div>
            <div style={{ marginTop: '8px' }}>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Notes</label>
              <input value={newCustomer.notes} onChange={e => setNewCustomer(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Prefers morning calls" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={addCustomer} style={{ padding: '8px 16px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Save customer</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: '8px 12px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Customer list */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Name', 'Email', 'Phone', 'Orders', 'Total spent', 'Status', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const badge = statusBadge(c.status)
                return (
                  <tr key={c.id} onClick={() => { setSelected(c); setNewNote(c.notes); setEditMode(false) }} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '10px 8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{c.name}</td>
                    <td style={{ padding: '10px 8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{c.email}</td>
                    <td style={{ padding: '10px 8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{c.phone}</td>
                    <td style={{ padding: '10px 8px', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{c.orders}</td>
                    <td style={{ padding: '10px 8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{c.spent}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '0.5px solid #f0f0ee' }}>
                      <span style={{ background: badge.bg, color: badge.color, padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{badge.label}</span>
                    </td>
                    <td style={{ padding: '10px 8px', borderBottom: '0.5px solid #f0f0ee' }}>
                      <button onClick={e => { e.stopPropagation(); removeCustomer(c.id) }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#A32D2D', fontSize: '11px' }}>Remove</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Customer detail */}
        {selected && (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E6F1FB', color: '#0C447C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '500' }}>
                  {selected.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: '#111' }}>{selected.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{selected.email} · {selected.phone}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <a href="/orders" style={{ padding: '7px 12px', background: '#185FA5', color: 'white', borderRadius: '8px', fontSize: '12px', textDecoration: 'none' }}>New order</a>
                <button onClick={() => setSelected(null)} style={{ padding: '7px 12px', border: '0.5px solid #e5e5e3', background: 'transparent', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', color: '#444' }}>Close</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1rem' }}>
              {[
                { label: 'Total spent', value: selected.spent },
                { label: 'Total orders', value: selected.orders.toString() },
                { label: 'Last order', value: selected.last },
              ].map(m => (
                <div key={m.label} style={{ background: '#f9f9f8', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>{m.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#111' }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Address</div>
              <div style={{ fontSize: '12px', color: '#111' }}>{selected.addr}</div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>Notes</div>
                <button onClick={() => setEditMode(!editMode)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '11px', color: '#185FA5' }}>{editMode ? 'Cancel' : 'Edit'}</button>
              </div>
              {editMode ? (
                <div>
                  <textarea value={newNote} onChange={e => setNewNote(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '0.5px solid #185FA5', fontSize: '12px', color: '#111', height: '80px', resize: 'vertical' }} />
                  <button onClick={saveNote} style={{ marginTop: '6px', padding: '6px 12px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Save note</button>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: selected.notes ? '#111' : '#aaa', background: '#f9f9f8', padding: '8px 12px', borderRadius: '8px' }}>
                  {selected.notes || 'No notes yet. Click Edit to add one.'}
                </div>
              )}
            </div>

            {/* Order history */}
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Order history</div>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Order #', 'Date', 'Items', 'Total', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selected.history.map(o => {
                  const sb = orderStatusBadge(o.status)
                  return (
                    <tr key={o.id}>
                      <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '10px', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{o.id}</td>
                      <td style={{ padding: '8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{o.date}</td>
                      <td style={{ padding: '8px', color: '#666', fontSize: '11px', borderBottom: '0.5px solid #f0f0ee' }}>{o.items}</td>
                      <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{o.total}</td>
                      <td style={{ padding: '8px', borderBottom: '0.5px solid #f0f0ee' }}>
                        <span style={{ background: sb.bg, color: sb.color, padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{o.status}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}