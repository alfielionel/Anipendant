import { type ReactNode } from 'react'

interface LoadingProps {
  fullPage?: boolean
  message?: string
}

export default function Loading({ fullPage, message }: LoadingProps) {
  const content = (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div className="loading-dots">
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
      {message && <p style={{ marginTop: '0.5rem', color: 'var(--text)' }}>{message}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        {content}
      </div>
    )
  }

  return content
}
