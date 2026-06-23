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

type Item = { flowerId: string; name: string; price: number; unit: string; qty: number; sub: number }
type Order = { id: string; customer: string; addr: string; phone: string; carrier: string; truck: string; items: Item[]; itemsSubtotal: number; ccFee: number; total: number }
type TodayOrder = { db_id: number; id: string; customer: string; carrier: string; truck: string; total: number; created_at: string; items: { name: string; qty: number; unit: string }[] }
type CustomerOption = { id: number; name: string; phone: string; adress: string; city: string; state: string; zip: string; charges_cc_fee: boolean }
type FlowerOption = { id: number; name: string; variety: string; unit: string; price: number }
type CompanySettings = { name: string; address: string; city: string; state: string; zip: string; phone: string; email: string }

let orderCounter = 20414
const CC_FEE_RATE = 0.0299

const CODE128_TABLE = [
  "212222","222122","222221","121223","121322","131222","122213","122312","132212","221213",
  "221312","231212","112232","122132","122231","113222","123122","123221","223211","221132",
  "221231","213212","223112","312131","311222","321122","321221","312212","322112","322211",
  "212123","212321","232121","111323","131123","131321","112313","132113","132311","211313",
  "231113","231311","112133","112331","132131","113123","113321","133121","313121","211331",
  "231131","213113","213311","213131","311123","311321","331121","312113","312311","332111",
  "314111","221411","431111","111224","111422","121124","121421","141122","141221","112214",
  "112412","122114","122411","142112","142211","241211","221114","413111","241112","134111",
  "111242","121142","121241","114212","124112","124211","411212","421112","421211","212141",
  "214121","412121","111143","111341","131141","114113","114311","411113","411311","113141",
  "114131","311141","411131","211412","211214","211232","2331112",
]

function code128Bars(text: string) {
  const values = [104]
  for (const ch of text) values.push(ch.charCodeAt(0) - 32)
  let checksum = values[0]
  for (let i = 1; i < values.length; i++) checksum += values[i] * i
  checksum = checksum % 103
  values.push(checksum)
  values.push(106)
  const bars: { width: number; isBar: boolean }[] = []
  values.forEach(v => {
    const pattern = CODE128_TABLE[v]
    for (let i = 0; i < pattern.length; i++) bars.push({ width: parseInt(pattern[i], 10), isBar: i % 2 === 0 })
  })
  return bars
}

function barcodeHTML(orderNumber: string) {
  const bars = code128Bars(orderNumber)
  const unitPx = 1.6
  return bars.map(b => `<span style="display:inline-block;width:${b.width * unitPx}px;height:38px;background:${b.isBar ? '#111' : 'transparent'};-webkit-print-color-adjust:exact;print-color-adjust:exact;"></span>`).join('')
}

function flowerDisplayName(f: FlowerOption) {
  return f.variety && f.variety.trim() ? `${f.name} (${f.variety})` : f.name
}

export default function Orders() {
  const [step, setStep] = useState<'add' | 'review' | 'print'>('add')
  const [batch, setBatch] = useState<Order[]>([])
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [flowerOptions, setFlowerOptions] = useState<FlowerOption[]>([])
  const [customer, setCustomer] = useState('')
  const [customerChargesFee, setCustomerChargesFee] = useState(false)
  const [addr, setAddr] = useState('')
  const [phone, setPhone] = useState('')
  const [carrier, setCarrier] = useState(carriers[0])
  const [truck, setTruck] = useState('TRK-0482-W')
  const [items, setItems] = useState<Item[]>([])
  const [feedback, setFeedback] = useState('')
  const [printed, setPrinted] = useState(false)
  const [todaysOrders, setTodaysOrders] = useState<TodayOrder[]>([])
  const [loadingToday, setLoadingToday] = useState(true)
  const [userName, setUserName] = useState('there')
  const [userInitials, setUserInitials] = useState('?')
  const [settings, setSettings] = useState<CompanySettings>({ name: 'Newbury Floral Farms', address: '1200 Harbor Blvd', city: 'Oxnard', state: 'CA', zip: '93033', phone: '(805) 555-0100', email: 'dispatch@newburyfloral.com' })
  const [qtyInputs, setQtyInputs] = useState<string[]>([])
  const [priceInputs, setPriceInputs] = useState<string[]>([])

  function blankItem(opts: FlowerOption[]): Item {
    if (opts.length === 0) return { flowerId: '', name: '', price: 0, unit: 'bunch', qty: 0, sub: 0 }
    const f = opts[0]
    return { flowerId: String(f.id), name: flowerDisplayName(f), price: f.price, unit: f.unit, qty: 0, sub: 0 }
  }

  function loadTodaysOrders(repId: string) {
    fetch(`/api/orders/today?rep_id=${repId}`)
      .then(r => r.json())
      .then(data => { setTodaysOrders(data.orders || []); setLoadingToday(false) })
      .catch(() => setLoadingToday(false))
  }

  useEffect(() => {
    const name = localStorage.getItem('user_name') || 'there'
    const initials = localStorage.getItem('user_initials') || name.split(' ').map(w => w[0]).join('').toUpperCase() || '?'
    setUserName(name)
    setUserInitials(initials)
    const repId = localStorage.getItem('user_id') || ''
    fetch('/api/settings/get').then(r => r.json()).then(data => { if (data.settings) setSettings(data.settings) }).catch(() => {})
    fetch('/api/flowers/list').then(r => r.json()).then(data => {
      const opts: FlowerOption[] = (data.flowers || []).map((f: FlowerOption) => ({ id: f.id, name: f.name, variety: f.variety, unit: f.unit, price: f.price }))
      setFlowerOptions(opts)
      const blank = blankItem(opts)
      setItems([blank])
      setQtyInputs([''])
      setPriceInputs([String(blank.price || '')])
    }).catch(() => setFlowerOptions([]))
    if (!repId) { setLoadingToday(false); return }
    fetch(`/api/customers/list?rep_id=${repId}`).then(r => r.json()).then(data => setCustomers(data.customers || [])).catch(() => setCustomers([]))
    loadTodaysOrders(repId)
  }, [step])

  function handleCustomerChange(name: string) {
    setCustomer(name)
    const found = customers.find(c => c.name === name)
    if (found) {
      const fullAddr = [found.adress, found.city, found.state].filter(Boolean).join(', ') + (found.zip ? ` ${found.zip}` : '')
      setAddr(fullAddr)
      setPhone(found.phone || '')
      setCustomerChargesFee(!!found.charges_cc_fee)
    } else {
      setCustomerChargesFee(false)
    }
  }

  function handleItemChange(index: number, field: string, value: string) {
    const updatedItems = [...items]
    const updatedQty = [...qtyInputs]
    const updatedPrice = [...priceInputs]

    if (field === 'flowerId') {
      const flower = flowerOptions.find(f => String(f.id) === value)
      if (!flower) return
      const qty = parseInt(qtyInputs[index]) || 0
      updatedItems[index] = { ...updatedItems[index], flowerId: value, name: flowerDisplayName(flower), price: flower.price, unit: flower.unit, sub: flower.price * qty }
      updatedPrice[index] = String(flower.price)
    } else if (field === 'qty') {
      updatedQty[index] = value
      const qty = value === '' ? 0 : parseInt(value) || 0
      updatedItems[index] = { ...updatedItems[index], qty, sub: updatedItems[index].price * qty }
    } else if (field === 'price') {
      updatedPrice[index] = value
      const price = value === '' ? 0 : parseFloat(value) || 0
      const qty = updatedItems[index].qty
      updatedItems[index] = { ...updatedItems[index], price, sub: price * qty }
    }

    setItems(updatedItems)
    setQtyInputs(updatedQty)
    setPriceInputs(updatedPrice)
  }

  function addItem() {
    const blank = blankItem(flowerOptions)
    setItems([...items, blank])
    setQtyInputs([...qtyInputs, ''])
    setPriceInputs([...priceInputs, String(blank.price || '')])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
    setQtyInputs(qtyInputs.filter((_, i) => i !== index))
    setPriceInputs(priceInputs.filter((_, i) => i !== index))
  }

  const itemsSubtotal = items.reduce((s, i) => s + i.sub, 0)
  const ccFee = customerChargesFee ? itemsSubtotal * CC_FEE_RATE : 0
  const total = itemsSubtotal + ccFee
  const commission = itemsSubtotal * 0.07

  function addToBatch() {
    if (!customer) { setFeedback('Please select a customer first.'); return }
    orderCounter++
    const order: Order = { id: `ORD-${orderCounter}`, customer, addr, phone, carrier, truck, items: [...items], itemsSubtotal, ccFee, total }
    setBatch(prev => [...prev, order])
    setFeedback(`✓ ${customer} added to batch!`)
    setCustomer(''); setAddr(''); setPhone(''); setTruck('TRK-0482-W'); setCustomerChargesFee(false)
    const blank = blankItem(flowerOptions)
    setItems([blank])
    setQtyInputs([''])
    setPriceInputs([String(blank.price || '')])
    setTimeout(() => setFeedback(''), 3000)
  }

  function removeFromBatch(index: number) { setBatch(prev => prev.filter((_, i) => i !== index)) }

  const batchTotal = batch.reduce((s, o) => s + o.total, 0)
  const batchSubtotal = batch.reduce((s, o) => s + o.itemsSubtotal, 0)
  const batchFees = batch.reduce((s, o) => s + o.ccFee, 0)
  const batchComm = batchSubtotal * 0.07
  const totalLabels = batch.reduce((s, o) => s + o.items.length, 0)

  async function saveOrders() {
    const repId = localStorage.getItem('user_id') || ''
    for (const order of batch) {
      try {
        await fetch('/api/orders/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_number: order.id,
            customer_name: order.customer,
            carrier: order.carrier,
            truck_id: order.truck,
            total: order.total,
            cc_fee_amount: order.ccFee,
            rep_id: repId,
            items: order.items.map(it => ({ name: it.name, qty: it.qty, price: it.price, sub: it.sub, unit: it.unit })),
          }),
        })
      } catch (e) { console.log('Save error:', e) }
    }
  }

  function buildLabelHTML(labelOrders: { id: string; customer: string; addr: string; phone: string; carrier: string; truck: string; items: { name: string; qty: number }[] }[]) {
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const repName = localStorage.getItem('user_name') || 'Rep'

    const labelsHTML = labelOrders.flatMap(o => {
      const totalBoxes = o.items.length
      return o.items.map((it, boxIndex) => `
        <div style="width:4in;height:6in;padding:0.18in;font-family:monospace;font-size:9px;color:#111;page-break-after:always;box-sizing:border-box;">
          <div style="display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:10px;">
            <div>
              <div style="font-weight:bold;font-size:11px;">${settings.name.toUpperCase()}</div>
              <div>${settings.address}</div>
              <div>${settings.city}, ${settings.state} ${settings.zip}</div>
              <div>${settings.phone}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:bold;font-size:26px;color:#111;">${o.carrier}</div>
              <div style="font-size:10px;">${o.truck}</div>
              <div style="font-size:9px;">Rep: ${repName}</div>
            </div>
          </div>
          <div style="font-size:8px;color:#888;margin-bottom:3px;letter-spacing:0.05em;">SHIP TO</div>
          <div style="font-weight:bold;font-size:22px;margin-bottom:6px;letter-spacing:0.01em;line-height:1.2;">${o.customer}</div>
          <div style="margin-bottom:10px;line-height:1.6;font-size:11px;">
            <div>${o.addr}</div>
            <div>${o.phone}</div>
          </div>
          <div style="border:2px solid #111;border-radius:6px;padding:10px 12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
            <div style="flex:1;">
              <div style="font-size:8px;color:#888;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.05em;">This box contains</div>
              <div style="font-weight:bold;font-size:15px;color:#111;">${it.name}</div>
              <div style="font-size:12px;color:#444;margin-top:3px;">Quantity: ${it.qty}</div>
            </div>
            <div style="text-align:center;border-left:1.5px solid #ddd;padding-left:12px;min-width:70px;">
              <div style="font-size:8px;color:#888;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.05em;">Box</div>
              <div style="font-weight:bold;font-size:28px;color:#111;line-height:1;">${boxIndex + 1}</div>
              <div style="font-size:10px;color:#888;">of ${totalBoxes}</div>
            </div>
          </div>
          <div style="font-size:8px;color:#888;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">All boxes in this order (${totalBoxes} total)</div>
          <div style="border-top:0.5px solid #ddd;padding-top:4px;margin-bottom:10px;">
            ${o.items.map((it2, idx2) => `
              <div style="display:flex;justify-content:space-between;line-height:1.9;font-size:10px;color:${idx2 === boxIndex ? '#111' : '#888'};">
                <span>${idx2 === boxIndex ? '&gt; ' : ''}${it2.name}</span>
                <span>x ${it2.qty}</span>
              </div>
            `).join('')}
          </div>
          <div style="border-top:2px solid #111;padding-top:7px;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
            <div style="display:flex;justify-content:center;align-items:center;height:40px;margin-bottom:3px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
              ${barcodeHTML(o.id)}
            </div>
            <div style="font-size:9px;display:flex;justify-content:space-between;">
              <span>${o.id}</span><span>${date}</span>
            </div>
          </div>
        </div>
      `)
    }).join('')

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${settings.name} -- Labels</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
body { background: white; }
@page { size: 4in 6in; margin: 0; }
span { display: inline-block !important; }
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
    if (printWindow) printWindow.onload = () => setTimeout(() => { printWindow.print() }, 500)
    setPrinted(true)
  }

  function reprintLabel(o: TodayOrder) {
    const found = customers.find(c => c.name === o.customer)
    const fullAddr = found ? [found.adress, found.city, found.state].filter(Boolean).join(', ') + (found.zip ? ` ${found.zip}` : '') : 'Address on file'
    const fullHTML = buildLabelHTML([{ id: o.id, customer: o.customer, addr: fullAddr, phone: found?.phone || '', carrier: o.carrier, truck: o.truck, items: o.items.map(it => ({ name: it.name, qty: it.qty })) }])
    const blob = new Blob([fullHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url)
    if (printWindow) printWindow.onload = () => setTimeout(() => { printWindow.print() }, 500)
  }

  async function deleteOrder(o: TodayOrder) {
    if (!confirm(`Delete order ${o.id} for ${o.customer}?`)) return
    try {
      await fetch('/api/orders/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: o.db_id }) })
      loadTodaysOrders(localStorage.getItem('user_id') || '')
    } catch { alert('Could not delete order.') }
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
            <a key={item.label} href={item.href} style={{ display: 'block', padding: '9px 16px', fontSize: '12px', color: item.active ? '#185FA5' : '#444', fontWeight: item.active ? '500' : '400', borderLeft: item.active ? '2px solid #185FA5' : '2px solid transparent', background: item.active ? '#f0f7ff' : 'transparent', textDecoration: 'none' }}>{item.label}</a>
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

        {/* Today's orders */}
        {step === 'add' && !loadingToday && todaysOrders.length > 0 && (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Today&apos;s orders — reprint or remove if needed</div>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '10px' }}>This list resets at midnight.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
              {todaysOrders.map(o => (
                <div key={o.db_id} style={{ background: '#f9f9f8', borderRadius: '8px', padding: '10px', border: '0.5px solid #e5e5e3' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>{o.customer}</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>{new Date(o.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                  </div>
                  <div style={{ fontSize: '10px', color: '#888', fontFamily: 'monospace', marginBottom: '6px' }}>{o.id} · {o.carrier}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => reprintLabel(o)} style={{ flex: 1, padding: '6px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Print</button>
                    <button onClick={() => deleteOrder(o)} style={{ padding: '6px 10px', background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 'add' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              {/* Customer */}
              <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Customer</div>
                {customers.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#888', background: '#f9f9f8', padding: '10px', borderRadius: '8px' }}>No customers yet. <a href="/customers" style={{ color: '#185FA5' }}>Add one first</a></div>
                ) : (
                  <select value={customer} onChange={e => handleCustomerChange(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '0.5px solid #e5e5e3', fontSize: '12px', marginBottom: '10px', color: '#111' }}>
                    <option value=''>-- choose customer --</option>
                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}{c.charges_cc_fee ? ' (+2.99% fee)' : ''}</option>)}
                  </select>
                )}
                {customerChargesFee && (
                  <div style={{ marginBottom: '10px', background: '#FAEEDA', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: '#854F0B' }}>
                    2.99% credit card fee will be added automatically.
                  </div>
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

              {/* Items */}
              <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Items</div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>Each item = 1 box. Each box gets its own label.</div>
                {flowerOptions.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#888', background: '#f9f9f8', padding: '10px', borderRadius: '8px' }}>No flowers in inventory yet.</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 65px 85px 75px 24px', gap: '5px', paddingBottom: '6px', borderBottom: '0.5px solid #f0f0ee', marginBottom: '8px' }}>
                      {['Flower', 'Qty', 'Price/unit', 'Subtotal', ''].map(h => <div key={h} style={{ fontSize: '10px', fontWeight: '500', color: '#888' }}>{h}</div>)}
                    </div>
                    {items.map((item, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 65px 85px 75px 24px', gap: '5px', marginBottom: '6px', alignItems: 'center' }}>
                        <select value={item.flowerId} onChange={e => handleItemChange(i, 'flowerId', e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }}>
                          {flowerOptions.map(f => <option key={f.id} value={String(f.id)}>{flowerDisplayName(f)}</option>)}
                        </select>
                        <input
                          type="number"
                          value={qtyInputs[i] ?? ''}
                          min={0}
                          onChange={e => handleItemChange(i, 'qty', e.target.value)}
                          placeholder="0"
                          style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }}
                        />
                        <input
                          type="number"
                          value={priceInputs[i] ?? ''}
                          min={0}
                          step={0.01}
                          onChange={e => handleItemChange(i, 'price', e.target.value)}
                          placeholder="0.00"
                          style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#111' }}
                        />
                        <input value={`$${item.sub.toFixed(2)}`} readOnly style={{ padding: '6px', borderRadius: '6px', border: '0.5px solid #e5e5e3', fontSize: '11px', color: '#666', background: '#f9f9f8' }} />
                        <button onClick={() => removeItem(i)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: '#888' }}>x</button>
                      </div>
                    ))}
                    <button onClick={addItem} style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '6px', border: '0.5px solid #e5e5e3', background: 'transparent', cursor: 'pointer', color: '#444', marginTop: '4px' }}>+ Add item (box)</button>
                  </>
                )}
              </div>

              {/* Logistics */}
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

              {/* Totals */}
              <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Items subtotal: <span style={{ color: '#111' }}>${itemsSubtotal.toFixed(2)}</span></div>
                    {customerChargesFee && <div style={{ fontSize: '12px', color: '#854F0B', marginTop: '2px' }}>+ CC fee (2.99%): ${ccFee.toFixed(2)}</div>}
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#111', marginTop: '2px' }}>Order total: <span style={{ color: '#185FA5' }}>${total.toFixed(2)}</span></div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Commission (7%): <span style={{ color: '#3B6D11' }}>${commission.toFixed(2)}</span> · <span style={{ color: '#185FA5' }}>{items.length} box{items.length !== 1 ? 'es' : ''}</span></div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={addToBatch} style={{ padding: '8px 16px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>+ Add to batch</button>
                    <button onClick={() => {
                      setCustomer(''); setAddr(''); setPhone(''); setCustomerChargesFee(false)
                      const blank = blankItem(flowerOptions)
                      setItems([blank])
                      setQtyInputs([''])
                      setPriceInputs([String(blank.price || '')])
                    }} style={{ padding: '8px 12px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Clear</button>
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
                    No orders yet.
                  </div>
                ) : (
                  <>
                    {batch.map((o, i) => (
                      <div key={o.id} style={{ background: '#f9f9f8', borderRadius: '8px', padding: '10px', marginBottom: '8px', border: '0.5px solid #e5e5e3' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '500', color: '#111' }}>{o.customer}</div>
                          <button onClick={() => removeFromBatch(i)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: '#888' }}>x</button>
                        </div>
                        <div style={{ fontSize: '10px', color: '#888', fontFamily: 'monospace', marginBottom: '4px' }}>{o.id}</div>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>{o.items.map(it => `${it.name} x${it.qty}`).join(', ')}</div>
                        <div style={{ fontSize: '10px', color: '#185FA5', marginBottom: '4px' }}>{o.items.length} box{o.items.length !== 1 ? 'es' : ''} / {o.items.length} label{o.items.length !== 1 ? 's' : ''}</div>
                        {o.ccFee > 0 && <div style={{ fontSize: '10px', color: '#854F0B', marginBottom: '4px' }}>+${o.ccFee.toFixed(2)} CC fee</div>}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', fontWeight: '500', color: '#185FA5' }}>${o.total.toFixed(2)}</span>
                          <span style={{ fontSize: '10px', color: '#888' }}>{o.carrier}</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: '0.5px solid #e5e5e3', paddingTop: '10px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                        <span>Items subtotal</span><span>${batchSubtotal.toFixed(2)}</span>
                      </div>
                      {batchFees > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#854F0B', marginBottom: '4px' }}>
                          <span>CC fees</span><span>${batchFees.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                        <span>Batch total</span><span style={{ fontWeight: '500', color: '#185FA5' }}>${batchTotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '10px' }}>
                        <span>Commission</span><span style={{ color: '#3B6D11' }}>${batchComm.toFixed(2)}</span>
                      </div>
                      <button onClick={() => setStep('review')} style={{ width: '100%', padding: '9px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                        Review and finalize
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
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Review batch -- {batch.length} orders / {totalLabels} labels</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1rem' }}>
              {[
                { label: 'Total orders', value: batch.length.toString() },
                { label: 'Total labels', value: totalLabels.toString() },
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
                  <tr>{['Order #', 'Customer', 'Items (boxes)', 'CC fee', 'Total', 'Carrier', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e5e5e3' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {batch.map((o, i) => (
                    <tr key={o.id}>
                      <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '10px', borderBottom: '0.5px solid #f0f0ee', color: '#111' }}>{o.id}</td>
                      <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>{o.customer}</td>
                      <td style={{ padding: '8px', color: '#666', fontSize: '11px', borderBottom: '0.5px solid #f0f0ee' }}>{o.items.map(it => `${it.name} x${it.qty}`).join(', ')} <span style={{ color: '#185FA5' }}>({o.items.length} box{o.items.length !== 1 ? 'es' : ''})</span></td>
                      <td style={{ padding: '8px', color: '#854F0B', borderBottom: '0.5px solid #f0f0ee' }}>{o.ccFee > 0 ? `$${o.ccFee.toFixed(2)}` : '--'}</td>
                      <td style={{ padding: '8px', fontWeight: '500', color: '#111', borderBottom: '0.5px solid #f0f0ee' }}>${o.total.toFixed(2)}</td>
                      <td style={{ padding: '8px', color: '#666', borderBottom: '0.5px solid #f0f0ee' }}>{o.carrier}</td>
                      <td style={{ padding: '8px', borderBottom: '0.5px solid #f0f0ee' }}><button onClick={() => removeFromBatch(i)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#A32D2D', fontSize: '11px' }}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setStep('print')} style={{ padding: '9px 18px', background: '#3B6D11', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Finalize and print {totalLabels} labels</button>
              <button onClick={() => setStep('add')} style={{ padding: '9px 14px', background: 'transparent', color: '#444', border: '0.5px solid #e5e5e3', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Back</button>
            </div>
          </div>
        )}

        {/* STEP 3 - Print */}
        {step === 'print' && (
          <div>
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Labels ready to print</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1rem' }}>
              {[
                { label: 'Labels to print', value: totalLabels.toString() },
                { label: 'Batch total', value: `$${batchTotal.toFixed(2)}` },
                { label: 'Commission earned', value: `$${batchComm.toFixed(2)}` },
              ].map(m => (
                <div key={m.label} style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#111' }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '1rem', background: '#E6F1FB', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#0C447C' }}>
              {totalLabels} labels will print ({batch.map(o => `${o.customer}: ${o.items.length} box${o.items.length !== 1 ? 'es' : ''}`).join(', ')}). Orders go to Manager Pending Invoices.
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
              {!printed ? (
                <button onClick={() => { saveOrders(); printLabels() }} style={{ padding: '9px 18px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  Print all {totalLabels} labels
                </button>
              ) : (
                <div style={{ background: '#EAF3DE', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#3B6D11' }}>Done! {totalLabels} labels sent to printer.</div>
              )}
              <button onClick={() => { setBatch([]); setStep('add'); setPrinted(false) }} style={{ padding: '9px 14px', background: '#3B6D11', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Done -- start new batch</button>
            </div>

            {/* Label previews */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {batch.flatMap(o => o.items.map((it, boxIndex) => (
                <div key={`${o.id}-${boxIndex}`} style={{ background: 'white', border: '1.5px solid #ccc', borderRadius: '4px', padding: '10px', fontFamily: 'monospace', fontSize: '7px', color: '#111' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #111', paddingBottom: '6px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '9px' }}>{settings.name.toUpperCase()}</div>
                      <div>{settings.address}, {settings.city} {settings.state}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{o.carrier}</div>
                      <div>{o.truck}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>{o.customer}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f5', padding: '6px 8px', borderRadius: '4px', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontSize: '9px', fontWeight: 'bold' }}>{it.name}</div>
                      <div style={{ fontSize: '8px', color: '#666' }}>x{it.qty}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '8px', color: '#888' }}>Box</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{boxIndex + 1}<span style={{ fontSize: '9px', color: '#888' }}> of {o.items.length}</span></div>
                    </div>
                  </div>
                  <div style={{ fontSize: '7px', color: '#888', marginBottom: '3px' }}>All boxes:</div>
                  {o.items.map((it2, idx2) => (
                    <div key={idx2} style={{ fontSize: '7px', color: idx2 === boxIndex ? '#111' : '#aaa' }}>{idx2 === boxIndex ? '> ' : ''}{it2.name} x{it2.qty}</div>
                  ))}
                  <div style={{ borderTop: '1px solid #111', paddingTop: '4px', marginTop: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '6px', color: '#aaa', marginBottom: '2px' }}>barcode prints on actual label</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px' }}>
                      <span>{o.id}</span>
                      <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}