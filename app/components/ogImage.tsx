import { ImageResponse } from 'next/og'

// Shared Open Graph image (1200x630) for the German and English pages,
// in the site colours (accent #f97316 on white, text #111827).
export const OG_SIZE = { width: 1200, height: 630 }

const ENVELOPE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#f97316"/><rect x="12" y="18" width="40" height="28" rx="4" fill="none" stroke="#fff" stroke-width="4"/><polyline points="13,21 32,35 51,21" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/></svg>'
)}`

export function ogImage(claim: string, checks: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          color: '#111827',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1,
            padding: '72px 80px 64px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ENVELOPE} width={112} height={112} alt="" />
            <div style={{ display: 'flex', marginLeft: 32, fontSize: 72, fontWeight: 700, color: '#f97316' }}>
              email-checken.de
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 56, fontWeight: 700, lineHeight: 1.2 }}>{claim}</div>
            <div style={{ display: 'flex', fontSize: 34, color: '#6b7280', marginTop: 20 }}>{checks}</div>
          </div>
        </div>
        <div style={{ display: 'flex', height: 24, background: '#f97316' }} />
      </div>
    ),
    OG_SIZE
  )
}
