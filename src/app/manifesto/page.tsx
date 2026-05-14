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

export default function ManifestoPage() {
  return (
    <main style={{ background: '#fff', minHeight: '100vh', padding: '72px 5vw 88px' }}>

      {/* Manifesto text */}
      <div style={{ maxWidth: '560px', marginBottom: '64px' }}>
        <p style={{
          fontFamily: '"Times New Roman", Times, serif',
          fontSize: '0.95rem',
          color: '#111111',
          lineHeight: 2,
          margin: 0,
        }}>
          Lehrerinnen und Lehrer sollen alles absorbieren.<br />
          Gewalt. Stress. Sprachbarrieren. Überwachung. Verwaltungskollaps. Psychischer Druck.<br />
          Und trotzdem weiter unterrichten.<br />
          LEHRER wurde in dieser Realität gebaut.
        </p>
      </div>

      {/* Clean image grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px',
        marginBottom: '80px',
      }}>
        {files.map((f, i) => (
          <img
            key={i}
            src={`/lehrermanifesto/${f}`}
            alt=""
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
        ))}
      </div>

      {/* Handwritten bottom right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <p
          className={marker.className}
          style={{
            fontSize: '0.9rem',
            color: '#111111',
            transform: 'rotate(-2deg)',
            margin: 0,
          }}
        >
          the robots are coming
        </p>
      </div>

    </main>
  )
}
