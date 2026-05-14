'use client'

import { useState, useEffect } from 'react'
import { Permanent_Marker } from 'next/font/google'

const marker = Permanent_Marker({ subsets: ['latin'], weight: '400' })

const sys = 'Arial, Helvetica, sans-serif'

const items = [
  { f: '3FC9735D-2021-4A0B-95AE-38B58A9DD230.png',     label: 'LEHRER · 01' },
  { f: '987739C7-B014-47BE-B96C-B6AB18E08F8A.png',     label: 'LEHRER · 02' },
  { f: 'A565766A-57E2-4DE1-9C99-1834BF5978D3.png',     label: 'LEHRER · 03' },
  { f: 'DE6CF1EB-72E9-42AE-8771-39E2692F0F2F.png',     label: 'LEHRER · 04' },
  { f: '56839BCC-FD5B-4BFC-848A-DC6E6F5D712C.png',     label: 'LEHRER · 05' },
  { f: '7C847780-931B-48C7-86F2-0ADD34D8326E.png',     label: 'LEHRER · 06' },
  { f: '6BB77C06-3CF5-4CB0-9DC1-2D2745A1DD07.png',     label: 'LEHRER · 07' },
  { f: 'B79752B3-970E-4E3C-B0AF-3C1232217A51.png',     label: 'LEHRER · 08' },
  { f: 'A34F4781-65E9-4F3F-8C00-28B9CAE3A1CD.png',     label: 'LEHRER · 09' },
  { f: '1137EBF4-6F8F-4FCF-BD07-48013FCCD9B6.png',     label: 'LEHRER · 10' },
  { f: 'CD56A7E5-CCE6-40B9-B5FA-9D31E558FA45.png',     label: 'LEHRER · 11' },
  { f: '67C3F6E5-8468-4037-8DA2-DBAC308CF650.png',     label: 'LEHRER · 12' },
  { f: '016A3572-5C4E-4934-A119-8D3B9FC034F4.png',     label: 'LEHRER · 13' },
  { f: 'B6BE71F8-0582-48BD-AAC2-91260F92A325.png',     label: 'LEHRER · 14' },
  { f: '6BA6D49F-5F5D-4E33-90E6-A21761C07802.png',     label: 'LEHRER · 15' },
  { f: '00EC1D1E-4D8A-47EB-B492-3C829A2BCE4F.png',     label: 'LEHRER · 16' },
  { f: 'C88ABCFA-9C4E-4F3E-B6A6-1B23BEA04456.png',     label: 'LEHRER · 17' },
  { f: '987739C7-B014-47BE-B96C-B6AB18E08F8A%202.png', label: 'LEHRER · 18' },
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
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: sys, color: '#1a1a1a' }}>
      <style>{`
        .m-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .m-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 60px 0;
        }
        .m-hinweis-row {
          display: flex;
          gap: 36px;
          align-items: flex-start;
          margin-bottom: 56px;
        }
        .m-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 72px;
        }
        .m-grid-item {
          border: 1px solid #e0e0e0;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }
        .m-grid-item:hover { border-color: #aaa; }
        .m-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 60px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        @media (max-width: 900px) {
          .m-header-inner { padding: 14px 24px; }
          .m-body { padding: 40px 24px 0; }
          .m-footer-inner { padding: 16px 24px; }
          .m-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
        @media (max-width: 540px) {
          .m-header-inner { flex-direction: column; align-items: flex-start; gap: 4px; }
          .m-body { padding: 28px 16px 0; }
          .m-footer-inner { padding: 16px 16px; }
          .m-hinweis-row { flex-direction: column; gap: 12px; margin-bottom: 36px; }
          .m-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background: '#fff', borderBottom: '1px solid #d8d8d8', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="m-header-inner">
          <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.16em', color: '#1a1a1a' }}>
            LEHRER
          </span>
          <span style={{ fontSize: '0.62rem', color: '#aaa', letterSpacing: '0.05em' }}>
            DOK-NR.: LEHR-2025-001 · STAND: MAI 2026
          </span>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="m-body">

        {/* HINWEIS + text */}
        <div className="m-hinweis-row">
          <div style={{
            flexShrink: 0,
            border: '1px solid #1a1a1a',
            padding: '4px 10px',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: '#1a1a1a',
            marginTop: '4px',
          }}>
            HINWEIS
          </div>
          <p style={{ fontSize: '15px', color: '#1a1a1a', lineHeight: 1.8, margin: 0 }}>
            Lehrerinnen und Lehrer sollen alles absorbieren.<br />
            Gewalt. Stress. Sprachbarrieren. Überwachung. Verwaltungskollaps. Psychischer Druck.<br />
            Und trotzdem weiter unterrichten.<br />
            Lehrer wurde in dieser Realität gebaut.
          </p>
        </div>

        {/* Section label */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          borderBottom: '1px solid #d8d8d8',
          paddingBottom: '10px',
          marginBottom: '24px',
        }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.16em', color: '#1a1a1a' }}>
            DOKUMENTATION
          </span>
          <span style={{ fontSize: '0.62rem', color: '#aaa', letterSpacing: '0.1em' }}>
            18 ABBILDUNGEN
          </span>
        </div>

        {/* Image grid */}
        <div className="m-grid">
          {items.map((item, i) => (
            <div key={i} className="m-grid-item" onClick={() => setSelected(i)}>
              <img
                src={`/lehrermanifesto/${item.f}`}
                alt=""
                style={{ display: 'block', width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div style={{
                padding: '6px 10px',
                fontSize: '0.58rem',
                color: '#bbb',
                letterSpacing: '0.08em',
                borderTop: '1px solid #e8e8e8',
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #d8d8d8' }}>
        <div className="m-footer-inner">
          <span style={{ fontSize: '0.62rem', color: '#ccc', letterSpacing: '0.06em' }}>
            lehrer.live
          </span>
          <p
            className={marker.className}
            style={{
              fontSize: '0.9rem',
              color: '#333',
              transform: 'rotate(-2deg)',
              transformOrigin: 'right bottom',
              margin: 0,
            }}
          >
            the robots are coming
          </p>
        </div>
      </footer>

      {/* ── LIGHTBOX ── */}
      {selected !== null && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            cursor: 'pointer',
          }}
        >
          <img
            src={`/lehrermanifesto/${items[selected].f}`}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '88vw',
              maxHeight: '88vh',
              objectFit: 'contain',
              cursor: 'default',
            }}
          />
        </div>
      )}
    </div>
  )
}
