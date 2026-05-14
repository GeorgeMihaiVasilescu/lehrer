import { Permanent_Marker } from 'next/font/google'

const marker = Permanent_Marker({ subsets: ['latin'], weight: '400' })

const sys = 'Arial, Helvetica, sans-serif'
const navy = '#1a1a2e'

const items = [
  { f: '3FC9735D-2021-4A0B-95AE-38B58A9DD230.png',     label: 'Lehrer · 01' },
  { f: '987739C7-B014-47BE-B96C-B6AB18E08F8A.png',     label: 'Lehrer · 02' },
  { f: 'A565766A-57E2-4DE1-9C99-1834BF5978D3.png',     label: 'Lehrer · 03' },
  { f: 'DE6CF1EB-72E9-42AE-8771-39E2692F0F2F.png',     label: 'Lehrer · 04' },
  { f: '56839BCC-FD5B-4BFC-848A-DC6E6F5D712C.png',     label: 'Lehrer · 05' },
  { f: '7C847780-931B-48C7-86F2-0ADD34D8326E.png',     label: 'Lehrer · 06' },
  { f: '6BB77C06-3CF5-4CB0-9DC1-2D2745A1DD07.png',     label: 'Lehrer · 07' },
  { f: 'B79752B3-970E-4E3C-B0AF-3C1232217A51.png',     label: 'Lehrer · 08' },
  { f: 'A34F4781-65E9-4F3F-8C00-28B9CAE3A1CD.png',     label: 'Lehrer · 09' },
  { f: '1137EBF4-6F8F-4FCF-BD07-48013FCCD9B6.png',     label: 'Lehrer · 10' },
  { f: 'CD56A7E5-CCE6-40B9-B5FA-9D31E558FA45.png',     label: 'Lehrer · 11' },
  { f: '67C3F6E5-8468-4037-8DA2-DBAC308CF650.png',     label: 'Lehrer · 12' },
  { f: '016A3572-5C4E-4934-A119-8D3B9FC034F4.png',     label: 'Lehrer · 13' },
  { f: 'B6BE71F8-0582-48BD-AAC2-91260F92A325.png',     label: 'Lehrer · 14' },
  { f: '6BA6D49F-5F5D-4E33-90E6-A21761C07802.png',     label: 'Lehrer · 15' },
  { f: '00EC1D1E-4D8A-47EB-B492-3C829A2BCE4F.png',     label: 'Lehrer · 16' },
  { f: 'C88ABCFA-9C4E-4F3E-B6A6-1B23BEA04456.png',     label: 'Lehrer · 17' },
  { f: '987739C7-B014-47BE-B96C-B6AB18E08F8A%202.png', label: 'Lehrer · 18' },
]

export default function ManifestoPage() {
  return (
    <main style={{ background: '#fff', minHeight: '100vh', fontFamily: sys, color: navy }}>

      {/* Government accent bar */}
      <div style={{ background: navy, height: '5px' }} />

      {/* Header */}
      <div style={{
        borderBottom: '1px solid #d4d4d4',
        padding: '14px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.14em', color: navy }}>
          LEHRER
        </span>
        <span style={{ fontSize: '0.7rem', color: '#999' }}>
          Dok-Nr.: LEHR-2025-001 &nbsp;·&nbsp; Stand: Mai 2026
        </span>
      </div>

      <div style={{ padding: '52px 48px 0' }}>

        {/* HINWEIS notice */}
        <div style={{ marginBottom: '52px', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, paddingTop: '2px' }}>
            <span style={{
              fontFamily: sys,
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: navy,
              background: '#eef0f6',
              padding: '3px 8px',
              display: 'inline-block',
            }}>
              HINWEIS
            </span>
          </div>
          <p style={{
            fontFamily: sys,
            fontSize: '0.9rem',
            color: navy,
            lineHeight: 2,
            margin: 0,
            maxWidth: '560px',
          }}>
            Lehrerinnen und Lehrer sollen alles absorbieren.<br />
            Gewalt. Stress. Sprachbarrieren. Überwachung. Verwaltungskollaps. Psychischer Druck.<br />
            Und trotzdem weiter unterrichten.<br />
            Lehrer wurde in dieser Realität gebaut.
          </p>
        </div>

        {/* Section divider */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          borderBottom: '1px solid #1a1a2e',
          paddingBottom: '6px',
          marginBottom: '24px',
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em' }}>DOKUMENTATION</span>
          <span style={{ fontSize: '0.65rem', color: '#999' }}>18 Abbildungen</span>
        </div>

        {/* Image grid — 1px grey borders via gap + container background trick */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px',
          background: '#cccccc',
          border: '1px solid #cccccc',
          marginBottom: '52px',
        }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <img
                src={`/lehrermanifesto/${item.f}`}
                alt=""
                style={{
                  display: 'block',
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                }}
              />
              <div style={{
                padding: '6px 8px',
                borderTop: '1px solid #e8e8e8',
                fontSize: '0.62rem',
                color: '#999',
                fontFamily: sys,
                letterSpacing: '0.04em',
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #d4d4d4',
        padding: '20px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <span style={{ fontSize: '0.65rem', color: '#bbb' }}>
          © 2026 Lehrer &nbsp;·&nbsp; Alle Rechte vorbehalten
        </span>
        <p
          className={marker.className}
          style={{
            fontSize: '0.95rem',
            color: navy,
            transform: 'rotate(-2deg)',
            margin: 0,
            transformOrigin: 'right bottom',
          }}
        >
          the robots are coming
        </p>
      </div>

    </main>
  )
}
