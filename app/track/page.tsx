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
    <div style={{ minHeight: '100vh', background: '#f9f9f8', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Top bar */}
      <div style={{ borderBottom: '0.5px solid #e5e5e3', background: 'white', padding: '14px 1.5rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt={settings.name} style={{ height: '36px', width: 'auto' }} />
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>Order Tracking</div>
        </div>
      </div>

      {!data && (
        <div style={{ padding: '4rem 1.5rem' }}>
          <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#111', marginBottom: '12px', letterSpacing: '-0.02em' }}>
              Track your flowers
            </div>
            <div style={{ fontSize: '15px', color: '#666', marginBottom: '2rem', lineHeight: '1.5' }}>
              Follow your order&apos;s journey from our farm to your hands.
            </div>
            <div style={{ display: 'flex', gap: '8px', maxWidth: '440px', margin: '0 auto' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') doSearch(input) }}
                placeholder="Enter your order number (e.g. ORD-20416)"
                style={{ flex: 1, padding: '14px 16px', borderRadius: '10px', border: '1.5px solid #ddd', fontSize: '14px', color: '#111', outline: 'none' }}
              />
              <button onClick={() => doSearch(input)} style={{ padding: '14px 24px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Track
              </button>
            </div>
            {loading && <div style={{ fontSize: '13px', color: '#888', marginTop: '1rem' }}>Looking up your order...</div>}
            {error === 'not_found' && (
              <div style={{ marginTop: '1.25rem', background: '#FCEBEB', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#A32D2D', maxWidth: '440px', margin: '1.25rem auto 0' }}>
                We couldn&apos;t find an order with that number. Double check it and try again, or reach out to your sales rep.
              </div>
            )}

            {/* How it works */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '4rem', textAlign: 'center' }}>
              {STAGES.map(s => (
                <div key={s.key}>
                  <div style={{ fontSize: '26px', marginBottom: '8px' }}>{s.icon}</div>
                  <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', lineHeight: '1.3' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
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