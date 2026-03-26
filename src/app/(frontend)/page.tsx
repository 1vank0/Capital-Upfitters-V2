import React from 'react'

/**
 * Minimal frontend root page.
 * The static Phase 1 site is served separately.
 * This page confirms the CMS API is running.
 */
export default function HomePage() {
  return (
    <div
      style={{
        maxWidth: 600,
        margin: '80px auto',
        padding: '0 24px',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Capital Upfitters CMS
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>
        Payload CMS backend is running.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a
          href="/admin"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#203055',
            color: '#fff',
            borderRadius: 9999,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Open Admin Panel
        </a>
        <a
          href="/api/public/services"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#f3f4f6',
            color: '#111827',
            borderRadius: 9999,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Test Services API
        </a>
      </div>
    </div>
  )
}
