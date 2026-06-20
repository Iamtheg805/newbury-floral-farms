'use client'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', active: false },
  { label: 'Flower Availability', href: '/flowers', active: false },
  { label: 'New Order', href: '/orders', active: true },
  { label: 'My Customers', href: '/customers', active: false },
  { label: 'Quotes', href: '/quotes', active: false },
  { label: 'My Commission', href: '/commission', active: false },
]

const carriers = ['Armellini', 'Prime', 'Florida Beauty', 'Tawjo', 'Growers', 'FedEx']

type Item = { name: string; price: number; unit: string; qty: number; sub: number }
type Order = { id: string; customer: string; addr: string; phone: string; carrier: string; truck: string; items: Item[]; total: number }
type TodayOrder = { id: string; customer: string; carrier: string; truck: string; total: number; created_at: string; items: { name: string; qty: number; unit: string }[] }
type CustomerOption = { id: number; name: string; phone: string; adress: string; city: string; state: string; zip: string }
type FlowerOption = { id: number; name: string; variety: string; unit: string; price: number }

let orderCounter = 20414

function barcodePattern() {
  const pattern = [3, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1]
  return pattern.map((w, i) => `<span style="display:inline-block;width:${w}px;height:${12 + (i % 5) * 5}px;background:#111;margin-right:1px;"></span>`).join('')
}

export default function Orders() {
  const [step, setStep] = useState<'add' | 'review' | 'print'>('add')
  const [batch, setBatch] = useState<Order[]>([])
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [flowerOptions, setFlowerOptions] = useState<FlowerOption[]>([])
  const [customer, setCustomer] = useState('')
  const [addr, setAddr] = useState('')
  const [phone, setPhone] = useState('')
  const [carrier, setCarrier] = useState(carriers[0])
  const [truck, setTruck] = useState('TRK-0482-W')
  const [items, setItems] = useState<Item[]>([])
  const [feedback, setFeedback] = useState('')
  const [printed, setPrinted] = useState(false)
  const [invoiceStatus, setInvoiceStatus] = useState('')
  const [todaysOrders, setTodaysOrders] = useState<TodayOrder[]>([])
  const [loadingToday, setLoadingToday] = useState(true)
  const [userName, setUserName] = useState('there')
  const [userInitials, setUserInitials] = useState('?')

  function blankItem(opts: FlowerOption[]): Item {
    if (opts.length === 0) return { name: '', price: 0, unit: 'bunch', qty: 1, sub: 0 }
    const f = opts[0]
    return { name: `${f.name} (${f.variety})`, price: f.price, unit: f.unit, qty: 1, sub: f.price }
  }

  useEffect(() => {
    const name = localStorage.getItem('user_name') || 'there'
    const initials = localStorage.getItem('user_initials') || name.split(' ').map(w => w[0]).join('').toUpperCase() || '?'
    setUserName(name)
    setUserInitials(initials)

    const repId = localStorage.getItem('user_id') || ''

    fetch('/api/flowers/list')
      .then(r => r.json())
      .then(data => {
        const opts: FlowerOption[] = (data.flowers || []).map((f: { id: number; name: string; variety: string; unit: string; price: number }) => ({ id: f.id, name: f.name, variety: f.variety, unit: f.unit, price: f.price }))
        setFlowerOptions(opts)
        setItems([blankItem(opts)])
      })
      .catch(() => setFlowerOptions([]))

    if (!repId) { setLoadingToday(false); return }

    fetch(`/api/customers/list?rep_id=${repId}`)
      .then(r => r.json())
      .then(data => setCustomers(data.customers || []))
      .catch(() => setCustomers([]))

    fetch(`/api/orders/today?rep_id=${repId}`)
      .then(r => r.json())
      .then(data => {
        setTodaysOrders(data.orders || [])
        setLoadingToday(false)
      })
      .catch(() => setLoadingToday(false))
  }, [step])

  function handleCustomerChange(name: string) {
    setCustomer(name)
    const found = customers.find(c => c.name === name)
    if (found) {
      const fullAddr = [found.adress, found.city, found.state].filter(Boolean).join(', ') + (found.zip ? ` ${found.zip}` : '')
      setAddr(fullAddr)
      setPhone(found.phone || '')
    }
  }

  function handleItemChange(index: number, field: string, value: string) {
    const updated = [...items]
    if (field === 'name') {
      const flower = flowerOptions.find(f => `${f.name} (${f.variety})` === value)!
      updated[index] = { ...updated[index], name: value, price: flower.price, unit: flower.unit, sub: flower.price * updated[index].qty }
    } else if (field === 'qty') {
      const qty = parseInt(value) || 1
      updated[index] = { ...updated[index], qty, sub: updated[index].price * qty }
    } else if (field === 'price') {
      const price = parseFloat(value) || 0
      updated[index] = { ...updated[index], price, sub: price * updated[index].qty }
    }
    setItems(updated)
  }

  function addItem() {
    setItems([...items, blankItem(flowerOptions)])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  const total = items.reduce((s, i) => s + i.sub, 0)
  const commission = total * 0.07

  function addToBatch() {
    if (!customer) { setFeedback('Please select a customer first.'); return }
    orderCounter++
    const order: Order = { id: `ORD-${orderCounter}`, customer, addr, phone, carrier, truck, items: [...items], total }
    setBatch(prev => [...prev, order])
    setFeedback(`✓ ${customer} added to batch!`)
    setCustomer(''); setAddr(''); setPhone(''); setTruck('TRK-0482-W')
    setItems([blankItem(flowerOptions)])
    setTimeout(() => setFeedback(''), 3000)
  }

  function removeFromBatch(index: number) {
    setBatch(prev => prev.filter((_, i) => i !== index))
  }

  const batchTotal = batch.reduce((s, o) => s + o.total, 0)
  const batchComm = batchTotal * 0.07

  async function saveOrders() {
    const repId = localStorage.getItem('user_id') || ''
    for (const order of batch) {
      try {
        const res = await fetch('/api/orders/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_number: order.id,
            customer_name: order.customer,
            carrier: order.carrier,
            truck_id: order.truck,
            total: order.total,
            rep_id: repId,
            items: order.items.map(it => ({
              name: it.name,
              qty: it.qty,
              price: it.price,
              sub: it.sub,
              unit: it.unit,
            })),
          }),
        })
        await res.json()
      } catch (e) {
        console.log('Save error:', e)
      }
    }
  }

  async function createInvoices() {
    try {
      setInvoiceStatus('Creating QuickBooks invoices...')
      const response = await fetch('/api/quickbooks/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: batch }),
      })
      const result = await response.json()
      if (result.success) {
        setInvoiceStatus(`✓ ${result.invoices} QuickBooks invoice${result.invoices > 1 ? 's' : ''} created!`)
      } else {
        setInvoiceStatus('QuickBooks not connected — invoices skipped.')
      }
    } catch {
      setInvoiceStatus('Could not create invoices — check QuickBooks connection.')
    }
  }

  function buildLabelHTML(labelOrders: { id: string; customer: string; addr: string; phone: string; carrier: string; truck: string; items: { name: string; qty: number }[] }[]) {
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const repName = localStorage.getItem('user_name') || 'Rep'

    const labelsHTML = labelOrders.map(o => `
      <div style="width:4in;height:6in;padding:0.2in;font-family:monospace;font-size:9px;color:#111;page-break-after:always;box-sizing:border-box;">
        <div style="display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:12px;">
          <div>
            <div style="font-weight:bold;font-size:12px;">NEWBURY FLORAL FARMS</div>
            <div>1200 Harbor Blvd, Oxnard CA 93033</div>
            <div>(805) 555-0100</div>
            <div>dispatch@newburyfloral.com</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:bold;font-size:28px;color:#111;">${o.carrier}</div>
            <div style="font-size:11px;">${o.truck}</div>
            <div style="font-size:10px;">Rep: ${repName}</div>
          </div>
        </div>
        <div style="font-size:9px;color:#888;margin-bottom:4px;letter-spacing:0.05em;">SHIP TO</div>
        <div style="font-weight:bold;font-size:26px;margin-bottom:10px;letter-spacing:0.02em;line-height:1.2;">${o.customer}</div>
        <div style="margin-bottom:14px;line-height:1.7;font-size:14px;">
          <div>${o.addr}</div>
          <div>${o.phone}</div>
        </div>
        <div style="font-size:8px;color:#888;margin-bottom:4px;">ITEMS</div>
        <div style="border-top:0.5px solid #ddd;padding-top:4px;margin-bottom:10px;">
          ${o.items.map(it => `
            <div style="display:flex;justify-content:space-between;line-height:2;font-size:11px;">
              <span>${it.name} x ${it.qty}</span>
            </div>
          `).join('')}
        </div>
        <div style="border-top:2px solid #111;padding-top:8px;text-align:center;">
          <div style="display:flex;justify-content:center;align-items:flex-end;height:40px;gap:1px;margin-bottom:5px;">
            ${barcodePattern()}
          </div>
          <div style="font-size:10px;display:flex;justify-content:space-between;">
            <span>${o.id}</span><span>${date}</span>
          </div>
        </div>
      </div>
    `).join('')

    return `<!DOCTYPE html>
<html>
<head>
<title>Newbury Floral Farms — Labels</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: white; }
@page { size: 4in 6in; margin: 0; }
</style>
</head>
<body>${labelsHTML}</body>
</html>`
  }

  function printLabels() {
    const labelOrders = batch.map(o => ({ id: o.id, customer: o.customer, addr: o.addr, phone: o.phone, carrier: o.carrier, truck: o.truck, items: o.items.map(it => ({ name: it.name, qty: it.qty })) }))
    const fullHTML = buildLabelHTML(labelOrders)
    const blob = new Blob([fullHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url)
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => { printWindow.print() }, 500)
      }
    }
    setPrinted(true)
  }

  function reprintLabel(o: TodayOrder) {
    const found = customers.find(c => c.name === o.customer)
    const fullAddr = found ? [found.adress, found.city, found.state].filter(Boolean).join(', ') + (found.zip ? ` ${found.zip}` : '') : 'Address on file'
    const labelOrder = {
      id: o.id,
      customer: o.customer,
      addr: fullAddr,
      phone: found?.phone || '',
      carrier: o.carrier,
      truck: o.truck,
      items: o.items.map(it => ({ name: it.name, qty: it.qty })),
    }
    const fullHTML = buildLabelHTML([labelOrder])
    const blob = new Blob([fullHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url)
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => { printWindow.print() }, 500)
      }
    }
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

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
          {(['add', 'review', 'print'] as const).map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: step === s ? '#185FA5' : i < ['add', 'review', 'print'].indexOf(step) ? '#3B6D11' : '#888', fontWeight: step === s ? '500' : '400' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: step === s ? '#185FA5' : i < ['add', 'review', 'print'].indexOf(step) ? '#3B6D11' : '#f0f0ee', color: step === s || i < ['add', 'review', 'print'].indexOf(step) ? 'white' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '500' }}>{i + 1}</div>
                {s === 'add' ? 'Add orders' : s === 'review' ? 'Review batch' : 'Print labels'}
              </div>
              {i < 2 && <div style={{ width: '40px', height: '1px', background: '#e5e5e3', margin: '0 8px' }} />}
            </div>
          ))}
        </div>

        {/* Today's orders — reprint panel */}
        {step === 'add' && !loadingToday && todaysOrders.length > 0 && (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Today&apos;s orders — reprint a label if needed
            </div>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '10px' }}>This list resets at midnight — only today&apos;s orders can be reprinted here.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
              {todaysOrders.map(o => (
                <div key={o.id} style={{ background: '#f9f9f8', borderRadius: '8px', padding: '10px', border: '0.5px solid #e5e5e3' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>{o.customer}</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>{new Date(o.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                  </div>
                  <div style={{ fontSize: '10px', color: '#888', fontFamily: 'monospace', marginBottom: '6px' }}>{o.id} · {o.carrier}</div>
                  <button onClick={() => reprintLabel(o)} style={{ width: '100%', padding: '6px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    🖨️ Reprint label
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1 - Add orders */}
        {step === 'add' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Customer</div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Select customer</label>
                {customers.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#888', background: '#f9f9f8', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                    No customers yet. <a href="/customers" style={{ color: '#185FA5' }}>Add one first →</a>
                  </div>
                ) : (
                  <select value={customer} onChange={e => handleCustomerChange(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', marginBottom: '10px', color: '#111' }}>
                    <option value=''>— choose customer —</option>
                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Address</label>
                    <input value={addr} onChange={e => setAddr(e.target.value)} placeholder="Auto-filled" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Phone</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Auto-filled" style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Items</div>
                {flowerOptions.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#888', background: '#f9f9f8', padding: '10px', borderRadius: '8px' }}>
                    No flowers in inventory yet. Ask your manager to add some.
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 55px 80px 70px 24px', gap: '5px', paddingBottom: '6px', borderBottom: '0.5px solid #f0f0ee', marginBottom: '8px' }}>
                      {['Flower', 'Qty', 'Price/unit', 'Subtotal', ''].map(h => <div key={h} style={{ fontSize: '10px', fontWeight: '500', color: '#888' }}>{h}</div>)}
                    </div>
                    {items.map((item, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 55px 80px 70px 24px', gap: '5px', marginBottom: '6px', alignItems: 'center' }}>
                        <select value={item.name} onChange={e => handleItemChange(i, 'name', e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }}>
                          {flowerOptions.map(f => <option key={f.id}>{f.name} ({f.variety})</option>)}
                        </select>
                        <input type="number" value={item.qty} min={1} onChange={e => handleItemChange(i, 'qty', e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }} />
                        <input type="number" value={item.price} min={0} step={0.01} onChange={e => handleItemChange(i, 'price', e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }} />
                        <input value={`$${item.sub.toFixed(2)}`} readOnly style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#666', background: '#f9f9f8' }} />
                        <button onClick={() => removeItem(i)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: '#888' }}>×</button>
                      </div>
                    ))}
                    <button onClick={addItem} style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '6px', border: '0.5px solid #e5e5e3', background: 'transparent', cursor: 'pointer', color: '#444', marginTop: '4px' }}>+ Add item</button>
                  </>
                )}
              </div>

              <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Logistics</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Carrier</label>
                    <select value={carrier} onChange={e => setCarrier(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }}>
                      {carriers.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Truck / Route ID</label>
                    <input value={truck} onChange={e => setTruck(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', color: '#111' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>Order total: <span style={{ color: '#185FA5' }}>${total.toFixed(2)}</span></div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Commission (7%): <span style={{ color: '#3B6D11' }}>${commission.toFixed(2)}</span></div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={addToBatch} style={{ padding: '8px 16px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>+ Add to batch</button>
                    <button onClick={() => { setCustomer(''); setAddr(''); setPhone(''); setItems([blankItem(flowerOptions)]) }} style={{ padding: '8px 12px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Clear</button>
                  </div>
                </div>
                {feedback && <div style={{ marginTop: '8px', fontSize: '11px', color: feedback.startsWith('✓') ? '#3B6D11' : '#A32D2D' }}>{feedback}</div>}
              </div>
            </div>

            {/* Batch panel */}
            <div style={{ width: '260px', flexShrink: 0 }}>
              <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', position: 'sticky', top: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>Today&apos;s batch</div>
                  <div style={{ background: '#185FA5', color: 'white', borderRadius: '99px', fontSize: '11px', fontWeight: '500', padding: '2px 8px' }}>{batch.length}</div>
                </div>
                {batch.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: '#888', fontSize: '12px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>🛒</div>
                    No orders yet.<br />Add orders on the left.
                  </div>
                ) : (
                  <>
                    {batch.map((o, i) => (
                      <div key={o.id} style={{ background: '#f9f9f8', borderRadius: '8px', padding: '10px', marginBottom: '8px', border: '0.5px solid #e5e5e3' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>{o.customer}</div>
                          <button onClick={() => removeFromBatch(i)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: '#888' }}>×</button>
                        </div>
                        <div style={{ fontSize: '10px', color: '#888', fontFamily: 'monospace', marginBottom: '4px' }}>{o.id}</div>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>{o.items.map(it => `${it.name} ×${it.qty}`).join(', ')}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', fontWeight: '500', color: '#185FA5' }}>${o.total.toFixed(2)}</span>
                          <span style={{ fontSize: '10px', color: '#888' }}>{o.carrier}</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: '0.5px solid #e5e5e3', paddingTop: '10px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                        <span>Batch total</span><span style={{ fontWeight: '500', color: '#185FA5' }}>${batchTotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '10px' }}>
                        <span>Commission</span><span style={{ color: '#3B6D11' }}>${batchComm.toFixed(2)}</span>
                      </div>
                      <button onClick={() => setStep('review')} style={{ width: '100%', padding: '9px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                        Review & finalize →
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 - Review */}
        {step === 'review' && (
          <div>
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Review batch — {batch.length} orders</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1rem' }}>
              {[
                { label: 'Total orders', value: batch.length.toString() },
                { label: 'Batch total', value: `$${batchTotal.toFixed(2)}` },
                { label: 'Commission (7%)', value: `$${batchComm.toFixed(2)}` },
              ].map(m => (
                <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#111' }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Order #', 'Customer', 'Items', 'Total', 'Carrier', ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {batch.map((o, i) => (
                    <tr key={o.id}>
                      <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '10px', borderBottom: '0.5px solid #f0f0ee', color: '#111' }}>{o.id}</td>
                      <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{o.customer}</td>
                      <td style={{ padding: '8px', color: '#666', fontSize: '11px', borderBottom: '0.5px solid #f0f0ee' }}>{o.items.map(it => `${it.name} ×${it.qty}`).join(', ')}</td>
                      <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>${o.total.toFixed(2)}</td>
                      <td style={{ padding: '8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{o.carrier}</td>
                      <td style={{ padding: '8px', borderBottom: '0.5px solid #f0f0ee' }}>
                        <button onClick={() => removeFromBatch(i)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#A32D2D', fontSize: '11px' }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => setStep('print')} style={{ padding: '9px 18px', background: '#3B6D11', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                Finalize & print all labels →
              </button>
              <button onClick={() => setStep('add')} style={{ padding: '9px 14px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 - Print */}
        {step === 'print' && (
          <div>
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Labels ready to print</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1rem' }}>
              {[
                { label: 'Labels to print', value: batch.length.toString() },
                { label: 'Batch total', value: `$${batchTotal.toFixed(2)}` },
                { label: 'Commission earned', value: `$${batchComm.toFixed(2)}` },
              ].map(m => (
                <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#111' }}>{m.value}</div>
                </div>
              ))}
            </div>

            {invoiceStatus && (
              <div style={{ marginBottom: '1rem', background: invoiceStatus.startsWith('✓') ? '#EAF3DE' : '#f9f9f8', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: invoiceStatus.startsWith('✓') ? '#3B6D11' : '#666' }}>
                {invoiceStatus}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
              {!printed ? (
                <button onClick={() => { saveOrders(); createInvoices(); printLabels() }} style={{ padding: '9px 18px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  🖨️ Print all {batch.length} labels
                </button>
              ) : (
                <div style={{ background: '#EAF3DE', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#3B6D11' }}>
                  ✓ {batch.length} labels sent to printer!
                </div>
              )}
              <button onClick={() => { setBatch([]); setStep('add'); setPrinted(false); setInvoiceStatus('') }} style={{ padding: '9px 14px', background: '#3B6D11', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                ✓ Done — start new batch
              </button>
            </div>

            {/* Label previews on screen */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {batch.map(o => (
                <div key={o.id} style={{ background: 'white', border: '1.5px solid #ccc', borderRadius: '4px', padding: '14px', fontFamily: 'monospace', fontSize: '8px', color: '#111' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #111', paddingBottom: '8px', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '11px' }}>NEWBURY FLORAL FARMS</div>
                      <div>1200 Harbor Blvd, Oxnard CA 93033</div>
                      <div>(805) 555-0100</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#111' }}>{o.carrier}</div>
                      <div>{o.truck}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '7px', color: '#888', marginBottom: '3px', letterSpacing: '0.05em' }}>SHIP TO</div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '6px', letterSpacing: '0.02em' }}>{o.customer}</div>
                  <div style={{ marginBottom: '8px', lineHeight: '1.6' }}>
                    <div>{o.addr}</div>
                    <div>{o.phone}</div>
                  </div>
                  <div style={{ fontSize: '7px', color: '#888', marginBottom: '3px' }}>ITEMS</div>
                  <div style={{ borderTop: '0.5px solid #ddd', paddingTop: '3px', marginBottom: '6px' }}>
                    {o.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', lineHeight: '1.8' }}>
                        <span>{it.name} x {it.qty}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1.5px solid #111', paddingTop: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '6px', color: '#aaa', marginBottom: '4px' }}>(barcode prints on actual label)</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px' }}>
                      <span>{o.id}</span>
                      <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}