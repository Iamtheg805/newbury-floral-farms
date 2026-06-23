'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  useAuth()
  const [userName, setUserName] = useState('there')
  const [userInitials, setUserInitials] = useState('?')
  const [revenue, setRevenue] = useState<number | null>(null)
  const [orderCount, setOrderCount] = useState<number | null>(null)
  const [customerCount, setCustomerCount] = useState<number | null>(null)

  useEffect(() => {
    const name = localStorage.getItem('user_name') || 'there'
    const initials = localStorage.getItem('user_initials') || name.split(' ').map(w => w[0]).join('').toUpperCase() || '?'
    const userId = localStorage.getItem('user_id') || ''
    setUserName(name)
    setUserInitials(initials)

    if (userId) {
      fetch(`/api/stats?rep_id=${userId}`)
        .then(r => r.json())
        .then(data => {
          setRevenue(data.revenue)
          setOrderCount(data.orderCount)
          setCustomerCount(data.customers)
        })
        .catch(() => { setRevenue(0); setOrderCount(0); setCustomerCount(0) })
    } else {
      setRevenue(0); setOrderCount(0); setCustomerCount(0)
    }
  }, [])

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'Flower Availability', href: '/flowers', active: false },
    { label: 'New Order', href: '/orders', active: false },
    { label: 'My Customers', href: '/customers', active: false },
    { label: 'Quotes', href: '/quotes', active: false },
    { label: 'My Commission', href: '/commission', active: false },
  ]

  const firstName = userName.split(' ')[0]
  const commission = (revenue || 0) * 0.07
  const revenueGoal = 55000
  const orderGoal = 30

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
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '1rem' }}>Good morning, {firstName} 👋</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1rem' }}>
          {[
            { label: 'Revenue (this month)', value: revenue === null ? '...' : `$${revenue.toLocaleString()}`, sub: `Goal: $${revenueGoal.toLocaleString()}`, subColor: '#666' },
            { label: 'Commission earned', value: revenue === null ? '...' : `$${Math.round(commission).toLocaleString()}`, sub: '7% of revenue', subColor: '#3B6D11' },
            { label: 'Orders this month', value: orderCount === null ? '...' : orderCount.toString(), sub: `Goal: ${orderGoal}`, subColor: '#666' },
            { label: 'Customers served', value: customerCount === null ? '...' : customerCount.toString(), sub: 'Unique this month', subColor: '#666' },
          ].map(m => (
            <div key={m.label} style={{ background: '#ffffff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>{m.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#111111' }}>{m.value}</div>
              <div style={{ fontSize: '11px', color: m.subColor, marginTop: '3px' }}>{m.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Goal progress -- this month</div>
            {[
              { label: 'Revenue', val: revenue || 0, max: revenueGoal, color: '#185FA5' },
              { label: 'Orders', val: orderCount || 0, max: orderGoal, color: '#3B6D11' },
            ].map(g => {
              const pct = Math.round(g.val / g.max * 100)
              return (
                <div key={g.label} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: '#333' }}>
                    <span>{g.label}</span>
                    <span style={{ color: '#888' }}>{g.val.toLocaleString()} / {g.max.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '99px', background: '#f0f0ee', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: '99px', background: g.color }} />
                  </div>
                </div>
              )
            })}
            {revenue !== null && revenue < revenueGoal && (
              <div style={{ background: '#E6F1FB', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', color: '#0C447C', marginTop: '4px' }}>
                You need <strong>${(revenueGoal - revenue).toLocaleString()}</strong> more to hit your monthly goal!
              </div>
            )}
            {revenue !== null && revenue >= revenueGoal && (
              <div style={{ background: '#EAF3DE', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', color: '#3B6D11', marginTop: '4px' }}>
                You hit your monthly revenue goal!
              </div>
            )}
          </div>
          <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Quick actions</div>
            {[
              { label: 'Add new order', href: '/orders', color: '#185FA5', bg: '#E6F1FB' },
              { label: 'View my customers', href: '/customers', color: '#3B6D11', bg: '#EAF3DE' },
              { label: 'Create a quote', href: '/quotes', color: '#854F0B', bg: '#FAEEDA' },
              { label: 'My commission', href: '/commission', color: '#3C3489', bg: '#EEEDFE' },
            ].map(a => (
              <a key={a.label} href={a.href} style={{ display: 'block', padding: '10px 12px', borderRadius: '8px', marginBottom: '6px', background: a.bg, color: a.color, textDecoration: 'none', fontSize: '12px', fontWeight: '500' }}>{a.label}</a>
            ))}
          </div>
        </div>
        <div style={{ background: 'white', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>This month at a glance</div>
          {revenue === 0 && orderCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#888' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌸</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#111', marginBottom: '4px' }}>No orders yet this month</div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Start adding orders to see your stats here.</div>
              <a href="/orders" style={{ padding: '8px 16px', background: '#185FA5', color: 'white', borderRadius: '8px', fontSize: '12px', textDecoration: 'none' }}>Add first order</a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { label: 'Total revenue', value: `$${(revenue || 0).toLocaleString()}` },
                { label: 'Commission at 7%', value: `$${Math.round(commission).toLocaleString()}` },
                { label: 'Orders placed', value: (orderCount || 0).toString() },
              ].map(m => (
                <div key={m.label} style={{ background: '#f9f9f8', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#111' }}>{m.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}