'use client'

import { useState, useEffect } from 'react'
import { Permanent_Marker } from 'next/font/google'

const marker = Permanent_Marker({ subsets: ['latin'], weight: '400' })

const files = [
  '3FC9735D-2021-4A0B-95AE-38B58A9DD230.png',
  '987739C7-B014-47BE-B96C-B6AB18E08F8A.png',
  'A565766A-57E2-4DE1-9C99-1834BF5978D3.png',
  'DE6CF1EB-72E9-42AE-8771-39E2692F0F2F.png',
  '56839BCC-FD5B-4BFC-848A-DC6E6F5D712C.png',
  '7C847780-931B-48C7-86F2-0ADD34D8326E.png',
  '6BB77C06-3CF5-4CB0-9DC1-2D2745A1DD07.png',
  'B79752B3-970E-4E3C-B0AF-3C1232217A51.png',
  'A34F4781-65E9-4F3F-8C00-28B9CAE3A1CD.png',
  '1137EBF4-6F8F-4FCF-BD07-48013FCCD9B6.png',
  'CD56A7E5-CCE6-40B9-B5FA-9D31E558FA45.png',
  '67C3F6E5-8468-4037-8DA2-DBAC308CF650.png',
  '016A3572-5C4E-4934-A119-8D3B9FC034F4.png',
  'B6BE71F8-0582-48BD-AAC2-91260F92A325.png',
  '6BA6D49F-5F5D-4E33-90E6-A21761C07802.png',
  '00EC1D1E-4D8A-47EB-B492-3C829A2BCE4F.png',
  'C88ABCFA-9C4E-4F3E-B6A6-1B23BEA04456.png',
  '987739C7-B014-47BE-B96C-B6AB18E08F8A%202.png',
]

const heights = [
  158, 174, 148, 167, 161, 152,
  177, 157, 165, 149, 172, 160,
  163, 147, 178, 155, 169, 153,
]

export default function ManifestoPage() {
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    if (selected === null) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selected])

  return (
    <main style={{ background: '#1a1a1a', minHeight: '100vh', padding: '72px 5vw 96px' }}>
      <style>{`
        .lb {
          background: #fffef8;
          padding: 10px;
          box-shadow: 0 0 18px 5px rgba(255,248,220,0.72);
          cursor: pointer;
          transition: box-shadow 0.28s ease, transform 0.28s ease;
          position: relative;
        }
        .lb:hover {
          box-shadow: 0 0 32px 10px rgba(255,248,220,0.98);
          transform: scale(1.05);
          z-index: 5;
        }
      `}</style>

      {/* Manifesto text */}
      <div style={{ marginBottom: '80px', paddingLeft: '40px' }}>
        <p
          className={marker.className}
          style={{
            fontSize: '1.1rem',
            color: '#888888',
            lineHeight: 2,
            margin: 0,
          }}
        >
          Lehrerinnen und Lehrer sollen alles absorbieren.<br />
          Gewalt. Stress. Sprachbarrieren. Überwachung. Verwaltungskollaps. Psychischer Druck.<br />
          Und trotzdem weiter unterrichten.<br />
          LEHRER wurde in dieser Realität gebaut.
        </p>
      </div>

      {/* Illuminated lightbox grid — 48px gap so individual glows don't bleed into each other */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '48px',
        marginBottom: '96px',
      }}>
        {files.map((f, i) => (
          <div key={i} className="lb" onClick={() => setSelected(i)}>
            <img
              src={`/lehrermanifesto/${f}`}
              alt=""
              style={{
                display: 'block',
                width: '100%',
                height: `${heights[i]}px`,
                objectFit: 'cover',
              }}
            />
          </div>
        ))}
      </div>

      {/* Handwritten bottom right — smaller, less prominent */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <p
          className={marker.className}
          style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.4)',
            transform: 'rotate(-2deg)',
            margin: 0,
          }}
        >
          the robots are coming
        </p>
      </div>

      {/* Fullscreen viewer */}
      {selected !== null && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer',
          }}
        >
          <img
            src={`/lehrermanifesto/${files[selected]}`}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '85vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              cursor: 'default',
            }}
          />
        </div>
      )}
    </main>
  )
}
