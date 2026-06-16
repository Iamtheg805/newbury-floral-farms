'use client'
import { useState } from 'react'

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '200px', background: '#f8f8f8', borderRight: '1px solid #eee', padding: '1rem 0' }}>
        <div style={{ padding: '0 1rem 1rem', fontWeight: '500', fontSize: '14px', borderBottom: '1px solid #eee', marginBottom: '0.5rem' }}>
          Newbury Floral Farms
        </div>
        <div style={{ padding: '10px 1rem', fontSize: '13px', color: '#185FA5', fontWeight: '500', borderLeft: '2px solid #185FA5' }}>Dashboard</div>
        <div style={{ padding: '10px 1rem', fontSize: '13px', color: '#666' }}>Flower Availability</div>
        <div style={{ padding: '10px 1rem', fontSize: '13px', color: '#666' }}>New Order</div>
        <div style={{ padding: '10px 1rem', fontSize: '13px', color: '#666' }}>My Customers</div>
        <div style={{ padding: '10px 1rem', fontSize: '13px', color: '#666' }}>Quotes</div>
        <div style={{ padding: '10px 1rem', fontSize: '13px', color: '#666' }}>My Commission</div>
      </div>
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '1rem' }}>Good morning, Jake</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1rem' }}>
          <div style={{ background: '#f8f8f8', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Revenue (Jun)</div>
            <div style={{ fontSize: '22px', fontWeight: '500' }}>$42,180</div>
            <div style={{ fontSize: '11px', color: '#3B6D11', marginTop: '2px' }}>+18% vs last month</div>
          </div>
          <div style={{ background: '#f8f8f8', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Open quotes</div>
            <div style={{ fontSize: '22px', fontWeight: '500' }}>6</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>$28,400 potential</div>
          </div>
          <div style={{ background: '#f8f8f8', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Orders this month</div>
            <div style={{ fontSize: '22px', fontWeight: '500' }}>24</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Goal: 30</div>
          </div>
          <div style={{ background: '#f8f8f8', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>My customers</div>
            <div style={{ fontSize: '22px', fontWeight: '500' }}>18</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>3 need follow-up</div>
          </div>
        </div>
        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Customers needing follow-up</div>
          {['Maria Gonzalez', 'James Thornton', 'Carlos Ruiz'].map(name => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: '13px', fontWeight: '500' }}>{name}</div>
              <button style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', background: 'transparent' }}>Follow up</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}