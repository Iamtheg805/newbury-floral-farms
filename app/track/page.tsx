'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type TrackData = {
  order_number: string
  customer: string
  carrier: string
  stage: string
  placed_at: string
  packed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  items: { flower_name: string; quantity: number; unit: string }[]
}

type Settings = { name: string; phone: string; email: string }

const STAGES = [
  { key: 'placed', label: 'Order Placed', icon: '📋', verb: 'Order placed' },
  { key: 'packed', label: 'Packed', icon: '📦', verb: 'Order packed and ready' },
  { key: 'out_for_delivery', label: 'Out to Logistics', icon: '🚚', verb: 'Departed for logistics partner' },
  { key: 'delivered', label: 'Delivered to Logistics', icon: '✓', verb: 'Delivered to logistics partner' },
]

const HOW_IT_WORKS = [
  { icon: '📋', title: 'You place your order', desc: 'Your sales rep enters your order and it\u2019s confirmed on our end.' },
  { icon: '✂️', title: 'We cut, pack & prepare', desc: 'Your flowers are freshly packed and staged for shipment.' },
  { icon: '🚚', title: 'Handed off for delivery', desc: 'Your order is delivered to our logistics partner and on its way to you.' },
]

const FAQS = [
  {
    q: 'Where is my order?',
    a: 'Enter your order number above to see real-time status. If it shows "Delivered to Logistics," your order has left our facility and is in your carrier\u2019s hands for final delivery.',
  },
  {
    q: 'Why is my tracking information missing or hasn\u2019t updated?',
    a: 'Tracking updates as your order moves through each stage of our process. If it hasn\u2019t changed in a while, it may simply still be in that stage \u2014 feel free to reach out to your sales rep for a status check.',
  },
  {
    q: 'My order number isn\u2019t working \u2014 what do I do?',
    a: 'Double-check the order number from your invoice or confirmation (it looks like ORD-XXXXX). If it still doesn\u2019t work, contact your sales rep and we\u2019ll look it up for you.',
  },
  {
    q: 'How do I place a new order?',
    a: 'Reach out to your usual sales rep directly, or contact us using the information below \u2014 we\u2019d love to get your next order started.',
  },
]

function fmtTime(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function TrackContent() {
  const searchParams = useSearchParams()
  const [input, setInput] = useState('')
  const [data, setData] = useState<TrackData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<Settings>({ name: 'Newbury Floral Farms', phone: '', email: '' })
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/settings/get').then(r => r.json()).then(d => { if (d.settings) setSettings(d.settings) }).catch(() => {})
    const fromUrl = searchParams.get('order')
    if (fromUrl) {
      setInput(fromUrl)
      doSearch(fromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function doSearch(orderNumber: string) {
    if (!orderNumber.trim()) return
    setLoading(true)
    setError('')
    setData(null)
    fetch(`/api/track?order_number=${encodeURIComponent(orderNumber.trim())}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setError('not_found')
        } else {
          setData(d)
        }
        setLoading(false)
      })
      .catch(() => { setError('error'); setLoading(false) })
  }

  const stageIndex = data ? STAGES.findIndex(s => s.key === data.stage) : -1
  const timestamps: Record<string, string | null> = data ? {
    placed: data.placed_at,
    packed: data.packed_at,
    out_for_delivery: data.shipped_at,
    delivered: data.delivered_at,
  } : {}

  const statusHeadline = stageIndex === 3 ? 'Delivered to Logistics' :
    stageIndex === 2 ? 'Out to Logistics' :
    stageIndex === 1 ? 'Packed & Ready' :
    'Order Received'

  const statusSub = stageIndex === 3 ? 'Your flowers have been handed off and are on their way to you.' :
    stageIndex === 2 ? `In transit with ${data?.carrier || 'your carrier'} now.` :
    stageIndex === 1 ? 'Carefully packed and staged for pickup.' :
    'We\'ve got your order and we\'re getting it ready.'

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Top bar */}
      <div style={{ borderBottom: '0.5px solid #e5e5e3', background: 'white', padding: '16px 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt={settings.name} style={{ height: '38px', width: 'auto' }} />
        </div>
      </div>

      {!data && (
        <>
          {/* Hero */}
          <div style={{ background: 'linear-gradient(180deg, #f9f9f8 0%, #ffffff 100%)', padding: '4.5rem 1.5rem 4rem', borderBottom: '0.5px solid #f0f0ee' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: '38px', fontWeight: '700', color: '#111', marginBottom: '14px', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
                Track your flowers
              </div>
              <div style={{ fontSize: '16px', color: '#666', marginBottom: '2.25rem', lineHeight: '1.5' }}>
                Enter your order number to follow its journey from our farm to your door.
              </div>
              <div style={{ display: 'flex', gap: '8px', maxWidth: '460px', margin: '0 auto' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') doSearch(input) }}
                  placeholder="Enter order number (e.g. ORD-20416)"
                  style={{ flex: 1, padding: '15px 16px', borderRadius: '10px', border: '1.5px solid #ddd', fontSize: '14px', color: '#111', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                />
                <button onClick={() => doSearch(input)} style={{ padding: '15px 26px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Track
                </button>
              </div>
              {loading && <div style={{ fontSize: '13px', color: '#888', marginTop: '1rem' }}>Looking up your order...</div>}
              {error === 'not_found' && (
                <div style={{ marginTop: '1.25rem', background: '#FCEBEB', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#A32D2D', maxWidth: '460px', margin: '1.25rem auto 0' }}>
                  We couldn&apos;t find an order with that number. Double check it and try again, or reach out to your sales rep.
                </div>
              )}
            </div>
          </div>

          {/* How it works */}
          <div style={{ padding: '4rem 1.5rem', borderBottom: '0.5px solid #f0f0ee' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#111', textAlign: 'center', marginBottom: '2.5rem', letterSpacing: '-0.01em' }}>
                How it works
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                {HOW_IT_WORKS.map((step, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>
                      {step.icon}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{step.title}</div>
                    <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.6' }}>{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div style={{ padding: '4rem 1.5rem' }}>
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#111', textAlign: 'center', marginBottom: '2rem', letterSpacing: '-0.01em' }}>
                Frequently asked questions
              </div>
              {FAQS.map((f, i) => (
                <div key={i} style={{ borderBottom: '0.5px solid #e5e5e3' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', textAlign: 'left', padding: '18px 4px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{f.q}</span>
                    <span style={{ fontSize: '18px', color: '#888', flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }}>+</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 4px 18px', fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '0.5px solid #e5e5e3', padding: '2rem 1.5rem', textAlign: 'center', background: '#f9f9f8' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#111', marginBottom: '4px' }}>{settings.name}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {settings.phone}{settings.phone && settings.email ? ' · ' : ''}{settings.email}
            </div>
            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '10px' }}>© {new Date().getFullYear()} {settings.name}. All rights reserved.</div>
          </div>
        </>
      )}

      {data && (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

          {/* Status hero */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{data.order_number}</div>
            <div style={{ fontSize: '30px', fontWeight: '700', color: '#111', letterSpacing: '-0.02em', marginBottom: '8px' }}>{statusHeadline}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>{statusSub}</div>
          </div>

          {/* Stepper card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '0.5px solid #e5e5e3', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <div style={{ position: 'absolute', top: '22px', left: '22px', right: '22px', height: '3px', background: '#eee', zIndex: 0 }}>
                <div style={{ height: '100%', background: '#3B6D11', width: `${Math.max(stageIndex, 0) / (STAGES.length - 1) * 100}%`, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                {STAGES.map((s, i) => {
                  const done = i <= stageIndex
                  const current = i === stageIndex
                  return (
                    <div key={s.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: `${100 / STAGES.length}%` }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: done ? '#3B6D11' : '#f0f0ee',
                        color: done ? 'white' : '#aaa',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px',
                        border: current ? '3px solid #185FA5' : 'none',
                        boxShadow: current ? '0 0 0 4px rgba(24,95,165,0.12)' : 'none',
                        transition: 'all 0.3s ease',
                      }}>
                        {done ? (i === STAGES.length - 1 ? '✓' : s.icon) : s.icon}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: current ? '600' : '500', color: done ? '#111' : '#aaa', textAlign: 'center', marginTop: '8px', lineHeight: '1.3' }}>{s.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Detailed timeline */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '0.5px solid #e5e5e3', marginBottom: '1rem' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>Tracking history</div>
            {STAGES.slice(0, stageIndex + 1).reverse().map((s) => (
              <div key={s.key} style={{ display: 'flex', gap: '12px', paddingBottom: '14px', marginBottom: '14px', borderBottom: '0.5px solid #f0f0ee' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EAF3DE', color: '#3B6D11', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>
                  {s.key === 'delivered' ? '✓' : s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>{s.verb}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{fmtTime(timestamps[s.key])}</div>
                </div>
              </div>
            ))}
            {stageIndex < 0 && <div style={{ fontSize: '13px', color: '#888' }}>No updates yet.</div>}
          </div>

          {/* Items */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '0.5px solid #e5e5e3', marginBottom: '1rem' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>In this order</div>
            {data.items.map((it, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < data.items.length - 1 ? '0.5px solid #f0f0ee' : 'none', fontSize: '14px' }}>
                <span style={{ color: '#111' }}>{it.flower_name}</span>
                <span style={{ color: '#888' }}>×{it.quantity}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', marginTop: '4px', fontSize: '12px', color: '#888' }}>
              <span>Carrier</span>
              <span style={{ fontWeight: '500', color: '#111' }}>{data.carrier}</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem 2rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '0.5px solid #e5e5e3' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#111', marginBottom: '4px' }}>Thank you for your business, {data.customer}!</div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '14px' }}>Ready to place your next order? Reach out to your sales rep anytime.</div>
            {settings.phone && <div style={{ fontSize: '13px', color: '#185FA5', fontWeight: '500' }}>{settings.phone}</div>}
            {settings.email && <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{settings.email}</div>}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button onClick={() => { setData(null); setInput(''); setError('') }} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
              Track a different order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Track() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f9f9f8' }} />}>
      <TrackContent />
    </Suspense>
  )
}