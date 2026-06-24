'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../useAuth'

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
  adress: string
  city: string
  state: string
  zip: string
  status: string
  notes: string
  cc_email: string
  bcc_email: string
  charges_cc_fee: boolean
}

type CustomerOrder = { order_number: string; total: number; status: string; created_at: string }

export default function Customers() {
  const authReady = useAuth()
  const [userName, setUserName] = useState('there')
  const [userInitials, setUserInitials] = useState('?')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Customer | null>(null)
  const [history, setHistory] = useState<CustomerOrder[]>([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editContactMode, setEditContactMode] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [contactEdit, setContactEdit] = useState({ email: '', phone: '', adress: '', city: '', state: '', zip: '', cc_email: '', bcc_email: '', charges_cc_fee: false })
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', adress: '', city: '', state: '', zip: '', notes: '', cc_email: '', bcc_email: '', charges_cc_fee: false })
  const [feedback, setFeedback] = useState('')

  const repId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null

  function loadCustomers() {
    if (!repId) { setLoading(false); return }
    setLoading(true)
    fetch(`/api/customers/list?rep_id=${repId}`)
      .then(r => r.json())
      .then(data => { setCustomers(data.customers || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    const name = localStorage.getItem('user_name') || 'there'
    const initials = localStorage.getItem('user_initials') || name.split(' ').map(w => w[0]).join('').toUpperCase() || '?'
    setUserName(name)
    setUserInitials(initials)
    loadCustomers()
  }, [])

  if (!authReady) return null

  function selectCustomer(c: Customer) {
    setSelected(c)
    setNewNote(c.notes || '')
    setEditMode(false)
    setEditContactMode(false)
    setContactEdit({ email: c.email || '', phone: c.phone || '', adress: c.adress || '', city: c.city || '', state: c.state || '', zip: c.zip || '', cc_email: c.cc_email || '', bcc_email: c.bcc_email || '', charges_cc_fee: c.charges_cc_fee || false })
    setHistory([])
    fetch(`/api/customers/orders?customer_name=${encodeURIComponent(c.name)}&rep_id=${repId}`)
      .then(r => r.json())
      .then(data => setHistory(data.orders || []))
      .catch(() => setHistory([]))
  }

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  async function addCustomer() {
    if (!newCustomer.name) { setFeedback('Please enter a name.'); return }
    try {
      const res = await fetch('/api/customers/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newCustomer, rep_id: repId, status: 'active' }) })
      const data = await res.json()
      if (data.success) { setFeedback('✓ Customer added!'); setNewCustomer({ name: '', email: '', phone: '', adress: '', city: '', state: '', zip: '', notes: '', cc_email: '', bcc_email: '', charges_cc_fee: false }); setShowAdd(false); loadCustomers() }
      else setFeedback('Could not add customer: ' + data.error)
    } catch { setFeedback('Could not add customer.') }
    setTimeout(() => setFeedback(''), 3000)
  }

  async function removeCustomer(id: number) {
    if (!confirm('Remove this customer?')) return
    try {
      await fetch('/api/customers/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      setSelected(null)
      loadCustomers()
    } catch { setFeedback('Could not remove customer.') }
  }

  async function saveNote() {
    if (!selected) return
    try {
      const res = await fetch('/api/customers/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...selected, notes: newNote }) })
      const data = await res.json()
      if (data.success) { setSelected(prev => prev ? { ...prev, notes: newNote } : null); setEditMode(false); setFeedback('✓ Note saved!'); loadCustomers() }
    } catch { setFeedback('Could not save note.') }
    setTimeout(() => setFeedback(''), 3000)
  }

  async function saveContactInfo() {
    if (!selected) return
    try {
      const res = await fetch('/api/customers/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...selected, ...contactEdit }) })
      const data = await res.json()
      if (data.success) { setSelected(prev => prev ? { ...prev, ...contactEdit } : null); setEditContactMode(false); setFeedback('✓ Contact info saved!'); loadCustomers() }
      else setFeedback('Could not save: ' + data.error)
    } catch { setFeedback('Could not save contact info.') }
    setTimeout(() => setFeedback(''), 3000)
  }

  function statusBadge(status: string) {
    if (status === 'vip') return { bg: '#EEEDFE', color: '#3C3489', label: 'VIP' }
    if (status === 'inactive') return { bg: '#FAEEDA', color: '#854F0B', label: 'Inactive' }
    return { bg: '#EAF3DE', color: '#3B6D11', label: 'Active' }
  }

  const totalSpent = history.reduce((s, o) => s + (o.total || 0), 0)
  const lastOrder = history[0]?.created_at ? new Date(history[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'

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
        <a href="/" style={{ marginTop: 'auto', padding: '14px 16px', borderTop: '0.5px solid #e5e5e3', fontSize: '12px', color: '#888', textDecoration: 'none', display: 'block' }}>Sign out</a>
      </div>

      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>My Customers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1rem' }}>
          {[
            { label: 'Total customers', value: customers.length.toString() },
            { label: 'VIP customers', value: customers.filter(c => c.status === 'vip').length.toString() },
            { label: 'Need follow-up', value: customers.filter(c => c.status === 'inactive').length.toString() },
          ].map(m => (
            <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#111' }}>{m.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '13px', color: '#111' }} />
          <button onClick={() => setShowAdd(!showAdd)} style={{ padding: '8px 16px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>+ Add customer</button>
        </div>

        {feedback && <div style={{ marginBottom: '10px', fontSize: '12px', color: feedback.startsWith('✓') ? '#3B6D11' : '#A32D2D', background: feedback.startsWith('✓') ? '#EAF3DE' : '#FCEBEB', padding: '8px 12px', borderRadius: '8px' }}>{feedback}</div>}

        {showAdd && (
          <div style={{ background: 'white', border: '0.5px solid #185FA5', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#111', marginBottom: '12px' }}>New customer</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Full name *</label><input value={newCustomer.name} onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Email</label><input value={newCustomer.email} onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Phone</label><input value={newCustomer.phone} onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Address</label><input value={newCustomer.adress} onChange={e => setNewCustomer(p => ({ ...p, adress: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>City</label><input value={newCustomer.city} onChange={e => setNewCustomer(p => ({ ...p, city: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>State</label><input value={newCustomer.state} onChange={e => setNewCustomer(p => ({ ...p, state: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
                <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>ZIP</label><input value={newCustomer.zip} onChange={e => setNewCustomer(p => ({ ...p, zip: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              </div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>CC email</label><input value={newCustomer.cc_email} onChange={e => setNewCustomer(p => ({ ...p, cc_email: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>BCC email</label><input value={newCustomer.bcc_email} onChange={e => setNewCustomer(p => ({ ...p, bcc_email: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#444', cursor: 'pointer' }}>
                <input type="checkbox" checked={newCustomer.charges_cc_fee} onChange={e => setNewCustomer(p => ({ ...p, charges_cc_fee: e.target.checked }))} />
                Charges 2.99% credit card fee on every order
              </label>
            </div>
            <div style={{ marginTop: '8px' }}>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Notes</label>
              <input value={newCustomer.notes} onChange={e => setNewCustomer(p => ({ ...p, notes: e.target.value }))} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={addCustomer} style={{ padding: '8px 16px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Save customer</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: '8px 12px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
          {loading ? <div style={{ fontSize: '12px', color: '#888' }}>Loading...</div> : filtered.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#888', textAlign: 'center', padding: '1.5rem 0' }}>No customers yet.</div>
          ) : (
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Name', 'Email', 'Phone', 'City', 'Status', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const badge = statusBadge(c.status)
                  return (
                    <tr key={c.id} onClick={() => selectCustomer(c)} style={{ cursor: 'pointer' }}>
                      <td style={{ padding: '10px 8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>
                        {c.name}
                        {c.charges_cc_fee && <span style={{ marginLeft: '6px', fontSize: '9px', background: '#FAEEDA', color: '#854F0B', padding: '1px 5px', borderRadius: '99px' }}>+2.99%</span>}
                      </td>
                      <td style={{ padding: '10px 8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{c.email}</td>
                      <td style={{ padding: '10px 8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{c.phone}</td>
                      <td style={{ padding: '10px 8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{c.city}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '0.5px solid #f0f0ee' }}><span style={{ background: badge.bg, color: badge.color, padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{badge.label}</span></td>
                      <td style={{ padding: '10px 8px', borderBottom: '0.5px solid #f0f0ee' }}><button onClick={e => { e.stopPropagation(); removeCustomer(c.id) }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#A32D2D', fontSize: '11px' }}>Remove</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E6F1FB', color: '#0C447C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '500' }}>{selected.name.split(' ').map(w => w[0]).join('')}</div>
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
              {[{ label: 'Total spent', value: `$${totalSpent.toFixed(2)}` }, { label: 'Total orders', value: history.length.toString() }, { label: 'Last order', value: lastOrder }].map(m => (
                <div key={m.label} style={{ background: '#f9f9f8', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>{m.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#111' }}>{m.value}</div>
                </div>
              ))}
            </div>

            {selected.charges_cc_fee && (
              <div style={{ marginBottom: '1rem', background: '#FAEEDA', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#854F0B' }}>
                This customer is charged a 2.99% credit card fee on every order automatically.
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>Contact & invoicing info</div>
                <button onClick={() => setEditContactMode(!editContactMode)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '11px', color: '#185FA5' }}>{editContactMode ? 'Cancel' : 'Edit'}</button>
              </div>
              {editContactMode ? (
                <div style={{ background: '#f9f9f8', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div><label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '3px' }}>Email</label><input value={contactEdit.email} onChange={e => setContactEdit(p => ({ ...p, email: e.target.value }))} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
                    <div><label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '3px' }}>Phone</label><input value={contactEdit.phone} onChange={e => setContactEdit(p => ({ ...p, phone: e.target.value }))} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
                    <div><label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '3px' }}>Address</label><input value={contactEdit.adress} onChange={e => setContactEdit(p => ({ ...p, adress: e.target.value }))} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '3px' }}>City / State / ZIP</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input value={contactEdit.city} onChange={e => setContactEdit(p => ({ ...p, city: e.target.value }))} placeholder="City" style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
                        <input value={contactEdit.state} onChange={e => setContactEdit(p => ({ ...p, state: e.target.value }))} placeholder="ST" style={{ width: '50px', padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
                        <input value={contactEdit.zip} onChange={e => setContactEdit(p => ({ ...p, zip: e.target.value }))} placeholder="ZIP" style={{ width: '65px', padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
                      </div>
                    </div>
                    <div><label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '3px' }}>CC email</label><input value={contactEdit.cc_email} onChange={e => setContactEdit(p => ({ ...p, cc_email: e.target.value }))} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
                    <div><label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '3px' }}>BCC email</label><input value={contactEdit.bcc_email} onChange={e => setContactEdit(p => ({ ...p, bcc_email: e.target.value }))} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} /></div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#444', cursor: 'pointer', marginBottom: '10px' }}>
                    <input type="checkbox" checked={contactEdit.charges_cc_fee} onChange={e => setContactEdit(p => ({ ...p, charges_cc_fee: e.target.checked }))} />
                    Charges 2.99% credit card fee on every order
                  </label>
                  <button onClick={saveContactInfo} style={{ padding: '6px 12px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                </div>
              ) : (
                <div style={{ background: '#f9f9f8', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#111', lineHeight: '1.8' }}>
                  <div>{selected.adress}{selected.city ? `, ${selected.city}` : ''}{selected.state ? `, ${selected.state}` : ''} {selected.zip}</div>
                  <div style={{ color: '#666' }}>Email: {selected.email || '--'}</div>
                  <div style={{ color: '#666' }}>CC: {selected.cc_email || '--'}</div>
                  <div style={{ color: '#666' }}>BCC: {selected.bcc_email || '--'}</div>
                </div>
              )}
            </div>

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
                <div style={{ fontSize: '12px', color: selected.notes ? '#111' : '#aaa', background: '#f9f9f8', padding: '8px 12px', borderRadius: '8px' }}>{selected.notes || 'No notes yet.'}</div>
              )}
            </div>

            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Order history</div>
            {history.length === 0 ? <div style={{ fontSize: '12px', color: '#888' }}>No orders yet.</div> : (
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead><tr>{['Order #', 'Date', 'Total', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {history.map(o => (
                    <tr key={o.order_number}>
                      <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '10px', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{o.order_number}</td>
                      <td style={{ padding: '8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>${(o.total || 0).toFixed(2)}</td>
                      <td style={{ padding: '8px', borderBottom: '0.5px solid #f0f0ee' }}><span style={{ background: '#EAF3DE', color: '#3B6D11', padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '500' }}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}