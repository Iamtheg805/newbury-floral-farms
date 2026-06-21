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
  { key: 'placed', label: 'Order Placed', icon: '📋' },
  { key: 'packed', label: 'Packed', icon: '📦' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '✓' },
]

function fmtTime(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function TrackContent() {
  const searchParams = useSearchParams()
  const [input, setInput] = useState('')
  const [data, setData] = useState<TrackData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<Settings>({ name: 'Newbury Floral Farms', phone: '', email: '' })

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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f9f9f8 0%, #f3f4f6 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt={settings.name} style={{ height: '64px', width: 'auto', display: 'block', margin: '0 auto 1.5rem' }} />

        {!data && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '0.5px solid #e5e5e3' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#111', textAlign: 'center', marginBottom: '6px' }}>Track Your Order</div>
            <div style={{ fontSize: '13px', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>Enter your order number to see its status</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') doSearch(input) }}
                placeholder="e.g. ORD-20416"
                style={{ flex: 1, padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e5e3', fontSize: '14px', color: '#111', outline: 'none' }}
              />
              <button onClick={() => doSearch(input)} style={{ padding: '12px 20px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                Track
              </button>
            </div>
            {loading && <div style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '1rem' }}>Looking up your order...</div>}
            {error === 'not_found' && (
              <div style={{ marginTop: '1rem', background: '#FCEBEB', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#A32D2D' }}>
                We couldn&apos;t find an order with that number. Double check it and try again, or reach out to your sales rep.
              </div>
            )}
          </div>
        )}

        {data && (
          <>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '0.5px solid #e5e5e3', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Order number</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#111', fontFamily: 'monospace' }}>{data.order_number}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Carrier</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{data.carrier}</div>
                </div>
              </div>

              {/* Stepper */}
              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
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
                        {timestamps[s.key] && (
                          <div style={{ fontSize: '9px', color: '#888', marginTop: '2px', textAlign: 'center' }}>{fmtTime(timestamps[s.key])}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{
                background: stageIndex === 3 ? '#EAF3DE' : '#E6F1FB',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '13px',
                color: stageIndex === 3 ? '#3B6D11' : '#0C447C',
                fontWeight: '500',
                textAlign: 'center',
              }}>
                {stageIndex === 3 ? '🌸 Delivered! We hope you love your flowers.' :
                 stageIndex === 2 ? '🚚 On its way to you now.' :
                 stageIndex === 1 ? '📦 Packed and ready to ship.' :
                 '📋 Your order has been received.'}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '0.5px solid #e5e5e3', marginBottom: '1rem' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>In this order</div>
              {data.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < data.items.length - 1 ? '0.5px solid #f0f0ee' : 'none', fontSize: '14px' }}>
                  <span style={{ color: '#111' }}>{it.flower_name}</span>
                  <span style={{ color: '#888' }}>×{it.quantity}</span>
                </div>
              ))}
            </div>

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
          </>
        )}
      </div>
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