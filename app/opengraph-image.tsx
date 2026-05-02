import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PureMatch — Registro Digital de Linaje Canino'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#061b0e',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Logo circle */}
        <div style={{
          width: 120, height: 120,
          borderRadius: '50%',
          background: '#fed488',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 56,
        }}>
          🐾
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 64, fontWeight: 700, color: '#ffffff', letterSpacing: '-1px' }}>
            PureMatch
          </span>
          <span style={{ fontSize: 22, color: '#fed488', letterSpacing: '4px', textTransform: 'uppercase' }}>
            Registro Digital de Linaje Canino
          </span>
        </div>

        <div style={{
          marginTop: 16,
          background: 'rgba(254,212,136,0.15)',
          border: '1px solid rgba(254,212,136,0.4)',
          borderRadius: 40,
          padding: '10px 28px',
        }}>
          <span style={{ fontSize: 16, color: '#fed488', letterSpacing: '2px' }}>
            SOLO PERFILES VERIFICADOS · CHILE
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
