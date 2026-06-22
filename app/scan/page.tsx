'use client'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    ZXing: {
      BrowserMultiFormatReader: new () => {
        decodeFromVideoDevice: (deviceId: undefined, videoElementId: string, callback: (result: { getText: () => string } | undefined, err: unknown) => void) => Promise<void>
        reset: () => void
      }
    }
  }
}

const STAGES = [
  { key: 'packed', label: 'Packed', icon: '📦', color: '#185FA5' },
  { key: 'out_for_delivery', label: 'Out to Logistics', icon: '🚚', color: '#854F0B' },
  { key: 'delivered', label: 'Delivered to Logistics', icon: '✓', color: '#3B6D11' },
]

type ScanLogEntry = { order_number: string; customer?: string; success: boolean; message: string; time: string }

export default function ScanStation() {
  const [userName, setUserName] = useState('there')
  const [stage, setStage] = useState('packed')
  const [scanning, setScanning] = useState(false)
  const [libraryLoaded, setLibraryLoaded] = useState(false)
  const [scanLog, setScanLog] = useState<ScanLogEntry[]>([])
  const [cameraError, setCameraError] = useState('')
  const readerRef = useRef<InstanceType<Window['ZXing']['BrowserMultiFormatReader']> | null>(null)
  const lastScanRef = useRef<{ code: string; time: number }>({ code: '', time: 0 })

  useEffect(() => {
    const name = localStorage.getItem('user_name') || 'there'
    setUserName(name)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@zxing/library@0.21.3/umd/index.min.js'
    script.async = true
    script.onload = () => setLibraryLoaded(true)
    document.body.appendChild(script)
    return () => {
      if (readerRef.current) {
        try { readerRef.current.reset() } catch {}
      }
      document.body.removeChild(script)
    }
  }, [])

  async function handleScan(code: string) {
    const now = Date.now()
    if (code === lastScanRef.current.code && now - lastScanRef.current.time < 3000) return
    lastScanRef.current = { code, time: now }

    try {
      const res = await fetch('/api/orders/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: code, stage }),
      })
      const data = await res.json()
      if (data.success) {
        setScanLog(prev => [{ order_number: data.order_number, customer: data.customer, success: true, message: `Marked as ${STAGES.find(s => s.key === stage)?.label}`, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }) }, ...prev])
      } else {
        setScanLog(prev => [{ order_number: code, success: false, message: data.error || 'Could not update', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }) }, ...prev])
      }
    } catch {
      setScanLog(prev => [{ order_number: code, success: false, message: 'Network error', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }) }, ...prev])
    }
  }

  function startScanning() {
    if (!libraryLoaded || !window.ZXing) {
      setCameraError('Scanner library still loading — try again in a second.')
      return
    }
    setCameraError('')
    setScanning(true)
    const reader = new window.ZXing.BrowserMultiFormatReader()
    readerRef.current = reader
    reader.decodeFromVideoDevice(undefined, 'scan-video', (result) => {
      if (result) {
        handleScan(result.getText())
      }
    }).catch(() => {
      setCameraError('Could not access camera. Check that you allowed camera permission for this site.')
      setScanning(false)
    })
  }

  function stopScanning() {
    if (readerRef.current) {
      try { readerRef.current.reset() } catch {}
    }
    setScanning(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f8', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Top bar */}
      <div style={{ background: 'white', borderBottom: '0.5px solid #e5e5e3', padding: '12px 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="logo" style={{ height: '28px', width: 'auto' }} />
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>Scan Station</div>
        </div>
        <a href="/orders" style={{ fontSize: '12px', color: '#185FA5', textDecoration: 'none' }}>← Back to orders</a>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.25rem 1rem' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '1rem' }}>Hi {userName} — pick a stage, then scan labels to update their status.</div>

        {/* Stage selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1rem' }}>
          {STAGES.map(s => (
            <button
              key={s.key}
              onClick={() => setStage(s.key)}
              style={{
                padding: '12px 6px',
                borderRadius: '10px',
                border: stage === s.key ? `2px solid ${s.color}` : '1px solid #e5e5e3',
                background: stage === s.key ? `${s.color}15` : 'white',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: stage === s.key ? '600' : '500', color: stage === s.key ? s.color : '#444' }}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* Camera */}
        <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e5e3', padding: '1rem', marginBottom: '1rem' }}>
          {!scanning ? (
            <button onClick={startScanning} style={{ width: '100%', padding: '14px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              📷 Start scanning
            </button>
          ) : (
            <>
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#000', marginBottom: '10px' }}>
                <video id="scan-video" style={{ width: '100%', display: 'block' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '80%', height: '35%', border: '2px solid #fff', borderRadius: '8px', boxShadow: '0 0 0 999px rgba(0,0,0,0.35)' }} />
              </div>
              <button onClick={stopScanning} style={{ width: '100%', padding: '10px', background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                Stop scanning
              </button>
            </>
          )}
          {cameraError && <div style={{ marginTop: '10px', fontSize: '12px', color: '#A32D2D' }}>{cameraError}</div>}
        </div>

        {/* Scan log */}
        <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e5e3', padding: '1rem' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Scanned this session</div>
          {scanLog.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#888' }}>No scans yet — start scanning labels above.</div>
          ) : (
            scanLog.map((log, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < scanLog.length - 1 ? '0.5px solid #f0f0ee' : 'none' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#111', fontFamily: 'monospace' }}>{log.order_number}</div>
                  <div style={{ fontSize: '11px', color: log.success ? '#3B6D11' : '#A32D2D' }}>{log.message}{log.customer ? ` · ${log.customer}` : ''}</div>
                </div>
                <div style={{ fontSize: '10px', color: '#aaa' }}>{log.time}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}