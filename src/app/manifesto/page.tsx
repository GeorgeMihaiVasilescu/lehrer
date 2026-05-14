import { Permanent_Marker } from 'next/font/google'

const marker = Permanent_Marker({ subsets: ['latin'], weight: '400' })

// CSS concrete wall: SVG fractal noise grain tiled over a layered grey gradient
const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.38'/%3E%3C/svg%3E")`

// Each photo: file (URL-encoded), left (% of container), top (px), width (px), rotation (deg)
const photos = [
  // — row 1 —
  { f: '3FC9735D-2021-4A0B-95AE-38B58A9DD230.png',     l: '3%',  t: 20,   w: 148, r: -1.5 },
  { f: '987739C7-B014-47BE-B96C-B6AB18E08F8A.png',     l: '22%', t: 5,    w: 185, r:  1.2 },
  { f: 'A565766A-57E2-4DE1-9C99-1834BF5978D3.png',     l: '43%', t: 15,   w: 144, r: -2.5 },
  { f: 'DE6CF1EB-72E9-42AE-8771-39E2692F0F2F.png',     l: '66%', t: 0,    w: 208, r:  1.8 },
  // — row 2 —
  { f: '56839BCC-FD5B-4BFC-848A-DC6E6F5D712C.png',     l: '5%',  t: 330,  w: 190, r: -3.0 },
  { f: '7C847780-931B-48C7-86F2-0ADD34D8326E.png',     l: '27%', t: 315,  w: 168, r:  2.0 },
  { f: '6BB77C06-3CF5-4CB0-9DC1-2D2745A1DD07.png',     l: '52%', t: 325,  w: 140, r: -1.0 },
  { f: 'B79752B3-970E-4E3C-B0AF-3C1232217A51.png',     l: '72%', t: 308,  w: 180, r:  0.8 },
  // — row 3 —
  { f: 'A34F4781-65E9-4F3F-8C00-28B9CAE3A1CD.png',     l: '1%',  t: 640,  w: 162, r:  1.5 },
  { f: '1137EBF4-6F8F-4FCF-BD07-48013FCCD9B6.png',     l: '21%', t: 620,  w: 208, r: -2.0 },
  { f: 'CD56A7E5-CCE6-40B9-B5FA-9D31E558FA45.png',     l: '49%', t: 635,  w: 154, r:  2.5 },
  { f: '67C3F6E5-8468-4037-8DA2-DBAC308CF650.png',     l: '70%', t: 618,  w: 180, r: -1.5 },
  // — row 4 —
  { f: '016A3572-5C4E-4934-A119-8D3B9FC034F4.png',     l: '8%',  t: 950,  w: 184, r: -0.5 },
  { f: 'B6BE71F8-0582-48BD-AAC2-91260F92A325.png',     l: '34%', t: 935,  w: 160, r:  2.2 },
  { f: '6BA6D49F-5F5D-4E33-90E6-A21761C07802.png',     l: '57%', t: 945,  w: 218, r: -2.5 },
  // — row 5 —
  { f: '00EC1D1E-4D8A-47EB-B492-3C829A2BCE4F.png',     l: '4%',  t: 1255, w: 170, r: -1.2 },
  { f: 'C88ABCFA-9C4E-4F3E-B6A6-1B23BEA04456.png',     l: '30%', t: 1238, w: 160, r:  2.8 },
  { f: '987739C7-B014-47BE-B96C-B6AB18E08F8A%202.png', l: '69%', t: 1248, w: 145, r: -2.0 },
]

export default function ManifestoPage() {
  return (
    <main style={{
      position: 'relative',
      backgroundColor: '#808078',
      backgroundImage: [
        grain,
        `linear-gradient(160deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.04) 40%, rgba(0,0,0,0.14) 100%)`,
        `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)`,
        `linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
      ].join(', '),
      backgroundSize: '200px 200px, 100% 100%, 60px 60px, 60px 60px',
      minHeight: '100vh',
    }}>

      {/* Curator text — small, white, serif, left-aligned */}
      <div style={{ padding: '72px 6vw 56px', maxWidth: '640px' }}>
        <p style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '0.88rem',
          fontWeight: 400,
          color: '#fff',
          lineHeight: 1.9,
          letterSpacing: '0.015em',
          margin: 0,
          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        }}>
          Lehrerinnen und Lehrer sollen alles absorbieren. Gewalt. Stress. Sprachbarrieren.
          Überwachung. Verwaltungskollaps. Psychischer Druck. Und trotzdem weiter unterrichten.
          LEHRER wurde in dieser Realität gebaut.
        </p>
      </div>

      {/* Pinned photos — absolute positions within a fixed-height container */}
      <div style={{ position: 'relative', height: '1520px', margin: '0 4vw' }}>
        {photos.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.l,
              top: p.t,
              transform: `rotate(${p.r}deg)`,
              transformOrigin: 'center center',
              background: '#fff',
              // larger bottom pad mimics printed photo with white border at base
              padding: '10px 10px 30px',
              boxShadow: '2px 5px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.25)',
              lineHeight: 0,
              zIndex: i,
            }}
          >
            <img
              src={`/lehrermanifesto/${p.f}`}
              alt=""
              style={{ display: 'block', width: p.w, height: 'auto' }}
            />
          </div>
        ))}
      </div>

      {/* Handwritten bottom-right */}
      <div style={{ padding: '32px 7vw 88px', display: 'flex', justifyContent: 'flex-end' }}>
        <p
          className={marker.className}
          style={{
            fontSize: '1.75rem',
            color: '#1a1a0a',
            transform: 'rotate(-2.5deg)',
            margin: 0,
            textShadow: '0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          the robots are coming
        </p>
      </div>

    </main>
  )
}
