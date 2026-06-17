'use client'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', active: false },
  { label: 'Flower Availability', href: '/flowers', active: false },
  { label: 'New Order', href: '/orders', active: true },
  { label: 'My Customers', href: '/customers', active: false },
  { label: 'Quotes', href: '/quotes', active: false },
  { label: 'My Commission', href: '/commission', active: false },
]

const customerData: { [key: string]: { addr: string; phone: string } } = {
  'Maria Gonzalez': { addr: '4821 Sunset Blvd, Los Angeles, CA 90028', phone: '(323) 555-0147' },
  'James Thornton': { addr: '390 Harbor Dr, Anaheim, CA 92805', phone: '(714) 555-0288' },
  'Priya Patel': { addr: '12 Oak Lane, Pasadena, CA 91101', phone: '(626) 555-0391' },
  'Carlos Ruiz': { addr: '88 Main St, Compton, CA 90220', phone: '(213) 555-0054' },
  'Aisha Nwosu': { addr: '500 Commerce Ave, Burbank, CA 91502', phone: '(818) 555-0762' },
}

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

const carriers = ['Armellini', 'Prime', 'Florida Beauty', 'Tawjo', 'Growers', 'FedEx']

type Item = { name: string; price: number; unit: string; qty: number; sub: number }
type Order = { id: string; customer: string; addr: string; phone: string; carrier: string; truck: string; items: Item[]; total: number }

let orderCounter = 20412

export default function Orders() {
  const [step, setStep] = useState<'add' | 'review' | 'print'>('add')
  const [batch, setBatch] = useState<Order[]>([])
  const [customer, setCustomer] = useState('')
  const [addr, setAddr] = useState('')
  const [phone, setPhone] = useState('')
  const [carrier, setCarrier] = useState(carriers[0])
  const [truck, setTruck] = useState('TRK-0482-W')
  const [items, setItems] = useState([{ name: flowerOptions[0].name, price: flowerOptions[0].price, unit: flowerOptions[0].unit, qty: 1, sub: flowerOptions[0].price }])
  const [feedback, setFeedback] = useState('')
  const [printed, setPrinted] = useState(false)

  function handleCustomerChange(name: string) {
    setCustomer(name)
    if (customerData[name]) {
      setAddr(customerData[name].addr)
      setPhone(customerData[name].phone)
    }
  }

  function handleItemChange(index: number, field: string, value: string) {
    const updated = [...items]
    if (field === 'name') {
      const flower = flowerOptions.find(f => f.name === value)!
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
    setItems([...items, { name: flowerOptions[0].name, price: flowerOptions[0].price, unit: flowerOptions[0].unit, qty: 1, sub: flowerOptions[0].price }])
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
    setItems([{ name: flowerOptions[0].name, price: flowerOptions[0].price, unit: flowerOptions[0].unit, qty: 1, sub: flowerOptions[0].price }])
    setTimeout(() => setFeedback(''), 3000)
  }

  function removeFromBatch(index: number) {
    setBatch(prev => prev.filter((_, i) => i !== index))
  }

  const batchTotal = batch.reduce((s, o) => s + o.total, 0)
  const batchComm = batchTotal * 0.07

  function printLabels() {
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    
    const labelsHTML = batch.map(o => `
      <div style="width:4in;height:6in;padding:0.2in;font-family:monospace;font-size:9px;color:#111;page-break-after:always;box-sizing:border-box;border:1px solid #eee;">
        <div style="display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:8px;">
          <div>
            <div style="font-weight:bold;font-size:12px;">NEWBURY FLORAL FARMS</div>
            <div>1200 Harbor Blvd, Oxnard CA 93033</div>
            <div>(805) 555-0100</div>
            <div>dispatch@newburyfloral.com</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:bold;font-size:28px;color:#111;">${o.carrier}</div>
            <div style="font-size:11px;">${o.truck}</div>
            <div style="font-size:10px;">Rep: Jake Rivera</div>
          </div>
        </div>
        <div style="font-size:8px;color:#888;margin-bottom:3px;">SHIP TO</div>
        <div style="font-weight:bold;font-size:18px;margin-bottom:4px;">${o.customer}</div>
        <div style="margin-bottom:10px;line-height:1.6;font-size:11px;">
          <div>${o.addr}</div>
          <div>${o.phone}</div>
        </div>
        <div style="font-size:8px;color:#888;margin-bottom:4px;">ITEMS</div>
        <div style="border-top:0.5px solid #ddd;padding-top:4px;margin-bottom:10px;">
          ${o.items.map(it => `
            <div style="display:flex;justify-content:space-between;line-height:2;font-size:11px;">
              <span>${it.name} x ${it.qty}</span>
              <span>$${it.sub.toFixed(2)}</span>
            </div>
          `).join('')}
          <div style="display:flex;justify-content:space-between;font-weight:bold;border-top:0.5px solid #ddd;padding-top:3px;margin-top:3px;font-size:12px;">
            <span>Total</span><span>$${o.total.toFixed(2)}</span>
          </div>
        </div>
        <div style="border-top:2px solid #111;padding-top:8px;">
          <div style="display:flex;justify-content:space-between;font-size:10px;">
            <span>${o.id}</span><span>${date}</span>
          </div>
        </div>
      </div>
    `).join('')

    const fullHTML = `<!DOCTYPE html>
<html>
<head>
<title>Labels</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: white; }
@page { size: 4in 6in; margin: 0; }
</style>
</head>
<body>${labelsHTML}</body>
</html>`

    const blob = new Blob([fullHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url)
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
    }
    setPrinted(true)
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

        {/* STEP 1 - Add orders */}
        {step === 'add' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Customer</div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Select customer</label>
                <select value={customer} onChange={e => handleCustomerChange(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', marginBottom: '10px', color: '#111' }}>
                  <option value=''>— choose customer —</option>
                  {Object.keys(customerData).map(c => <option key={c}>{c}</option>)}
                </select>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 55px 80px 70px 24px', gap: '5px', paddingBottom: '6px', borderBottom: '0.5px solid #f0f0ee', marginBottom: '8px' }}>
                  {['Flower', 'Qty', 'Price/unit', 'Subtotal', ''].map(h => <div key={h} style={{ fontSize: '10px', fontWeight: '500', color: '#888' }}>{h}</div>)}
                </div>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 55px 80px 70px 24px', gap: '5px', marginBottom: '6px', alignItems: 'center' }}>
                    <select value={item.name} onChange={e => handleItemChange(i, 'name', e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }}>
                      {flowerOptions.map(f => <option key={f.name}>{f.name}</option>)}
                    </select>
                    <input type="number" value={item.qty} min={1} onChange={e => handleItemChange(i, 'qty', e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }} />
                    <input type="number" value={item.price} min={0} step={0.01} onChange={e => handleItemChange(i, 'price', e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }} />
                    <input value={`$${item.sub.toFixed(2)}`} readOnly style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#666', background: '#f9f9f8' }} />
                    <button onClick={() => removeItem(i)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: '#888' }}>×</button>
                  </div>
                ))}
                <button onClick={addItem} style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '6px', border: '0.5px solid #e5e5e3', background: 'transparent', cursor: 'pointer', color: '#444', marginTop: '4px' }}>+ Add item</button>
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
                    <button onClick={() => { setCustomer(''); setAddr(''); setPhone(''); setItems([{ name: flowerOptions[0].name, price: flowerOptions[0].price, unit: flowerOptions[0].unit, qty: 1, sub: flowerOptions[0].price }]) }} style={{ padding: '8px 12px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Clear</button>
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
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
              {!printed ? (
                <button onClick={printLabels} style={{ padding: '9px 18px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  🖨️ Print all {batch.length} labels
                </button>
              ) : (
                <div style={{ background: '#EAF3DE', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#3B6D11' }}>
                  ✓ {batch.length} labels sent to printer! {batch.length} QuickBooks invoices created.
                </div>
              )}
              <button onClick={() => { setBatch([]); setStep('add'); setPrinted(false) }} style={{ padding: '9px 14px', background: '#3B6D11', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                ✓ Done — start new batch
              </button>
            </div>

            {/* Label previews on screen */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {batch.map(o => (
                <div key={o.id} style={{ background: 'white', border: '1.5px solid #ccc', borderRadius: '4px', padding: '14px', fontFamily: 'monospace', fontSize: '8px', color: '#111' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #111', paddingBottom: '8px', marginBottom: '8px' }}>
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
                  <div style={{ fontSize: '7px', color: '#888', marginBottom: '2px' }}>SHIP TO</div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>{o.customer}</div>
                  <div style={{ marginBottom: '6px', lineHeight: '1.6' }}>
                    <div>{o.addr}</div>
                    <div>{o.phone}</div>
                  </div>
                  <div style={{ fontSize: '7px', color: '#888', marginBottom: '3px' }}>ITEMS</div>
                  <div style={{ borderTop: '0.5px solid #ddd', paddingTop: '3px', marginBottom: '6px' }}>
                    {o.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', lineHeight: '1.8' }}>
                        <span>{it.name} x {it.qty}</span>
                        <span>${it.sub.toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '0.5px solid #ddd', paddingTop: '2px', marginTop: '2px' }}>
                      <span>Total</span><span>${o.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ borderTop: '1.5px solid #111', paddingTop: '6px' }}>
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