import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Cherry Capital Web'
  const description = searchParams.get('description') || 'AI-Powered Business Tools for Northern Michigan'
  const type = searchParams.get('type') || 'default'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          backgroundColor: '#0a0a0a',
          padding: '60px',
        }}
      >
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, transparent 50%, rgba(37, 99, 235, 0.1) 100%)',
          }}
        />

        {/* Cherry icon/branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#dc2626',
              marginRight: '16px',
            }}
          />
          <span
            style={{
              fontSize: '24px',
              color: '#a1a1aa',
              fontWeight: 500,
            }}
          >
            Cherry Capital Web
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: type === 'blog' ? '56px' : '64px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '20px',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            display: 'flex',
            fontSize: '28px',
            color: '#a1a1aa',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          {description.length > 120 ? description.slice(0, 117) + '...' : description}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '20px',
              color: '#52525b',
            }}
          >
            cherrycapitalweb.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
