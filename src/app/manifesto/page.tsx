const imgs = [
  '00EC1D1E-4D8A-47EB-B492-3C829A2BCE4F.png',
  '016A3572-5C4E-4934-A119-8D3B9FC034F4.png',
  '1137EBF4-6F8F-4FCF-BD07-48013FCCD9B6.png',
  '3FC9735D-2021-4A0B-95AE-38B58A9DD230.png',
  '56839BCC-FD5B-4BFC-848A-DC6E6F5D712C.png',
  '67C3F6E5-8468-4037-8DA2-DBAC308CF650.png',
  '6BA6D49F-5F5D-4E33-90E6-A21761C07802.png',
  '6BB77C06-3CF5-4CB0-9DC1-2D2745A1DD07.png',
  '7C847780-931B-48C7-86F2-0ADD34D8326E.png',
  '987739C7-B014-47BE-B96C-B6AB18E08F8A%202.png',
  '987739C7-B014-47BE-B96C-B6AB18E08F8A.png',
  'A34F4781-65E9-4F3F-8C00-28B9CAE3A1CD.png',
  'A565766A-57E2-4DE1-9C99-1834BF5978D3.png',
  'B6BE71F8-0582-48BD-AAC2-91260F92A325.png',
  'B79752B3-970E-4E3C-B0AF-3C1232217A51.png',
  'C88ABCFA-9C4E-4F3E-B6A6-1B23BEA04456.png',
  'CD56A7E5-CCE6-40B9-B5FA-9D31E558FA45.png',
  'DE6CF1EB-72E9-42AE-8771-39E2692F0F2F.png',
].map(f => `/lehrermanifesto/${f}`)

const serif = 'Georgia, "Times New Roman", serif'

const screen: React.CSSProperties = {
  minHeight: '100vh',
  background: '#000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export default function ManifestoPage() {
  return (
    <main style={{ background: '#000' }}>

      {/* Opening text screen */}
      <div style={{ ...screen, padding: '8vw 12vw' }}>
        <div style={{ maxWidth: '820px', width: '100%' }}>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(1.5rem, 3vw, 2.6rem)',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.45,
            margin: '0 0 2.5rem',
          }}>
            Lehrerinnen und Lehrer sollen alles absorbieren.
          </p>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(1.5rem, 3vw, 2.6rem)',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.45,
            margin: '0 0 2.5rem',
          }}>
            Gewalt. Stress. Sprachbarrieren. Überwachung. Verwaltungskollaps. Psychischer Druck.
          </p>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(1.5rem, 3vw, 2.6rem)',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.45,
            margin: '0 0 2.5rem',
          }}>
            Und trotzdem weiter unterrichten.
          </p>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(1.5rem, 3vw, 2.6rem)',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.45,
            margin: 0,
          }}>
            LEHRER wurde in dieser Realität gebaut.
          </p>
        </div>
      </div>

      {/* One image per screen */}
      {imgs.map((src, i) => (
        <div key={i} style={screen}>
          <img
            src={src}
            alt=""
            style={{
              display: 'block',
              maxWidth: '80%',
              maxHeight: '80vh',
              objectFit: 'contain',
            }}
          />
        </div>
      ))}

      {/* Final screen */}
      <div style={screen}>
        <span style={{
          fontFamily: serif,
          fontSize: '0.85rem',
          letterSpacing: '0.1em',
          color: '#fff',
          fontWeight: 400,
        }}>
          lehrer.live
        </span>
      </div>

    </main>
  )
}
