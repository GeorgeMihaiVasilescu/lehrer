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

const cover: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }

export default function ManifestoPage() {
  return (
    <main style={{ background: '#fff', color: '#000' }}>

      {/* 1 — full width */}
      <div style={{ height: '85vh' }}>
        <img src={imgs[0]} alt="" style={cover} />
      </div>

      {/* 2 — two equal */}
      <div style={{ display: 'flex', height: '60vh' }}>
        <img src={imgs[1]} alt="" style={{ ...cover, width: '50%' }} />
        <img src={imgs[2]} alt="" style={{ ...cover, width: '50%' }} />
      </div>

      {/* 3 — wide + narrow */}
      <div style={{ display: 'flex', height: '55vh' }}>
        <img src={imgs[3]} alt="" style={{ ...cover, width: '66.666%' }} />
        <img src={imgs[4]} alt="" style={{ ...cover, width: '33.333%' }} />
      </div>

      {/* 4 — full width */}
      <div style={{ height: '75vh' }}>
        <img src={imgs[5]} alt="" style={cover} />
      </div>

      {/* 5 — three equal */}
      <div style={{ display: 'flex', height: '50vh' }}>
        <img src={imgs[6]} alt="" style={{ ...cover, width: '33.333%' }} />
        <img src={imgs[7]} alt="" style={{ ...cover, width: '33.333%' }} />
        <img src={imgs[8]} alt="" style={{ ...cover, width: '33.333%' }} />
      </div>

      {/* 6 — narrow + wide */}
      <div style={{ display: 'flex', height: '55vh' }}>
        <img src={imgs[9]}  alt="" style={{ ...cover, width: '33.333%' }} />
        <img src={imgs[10]} alt="" style={{ ...cover, width: '66.666%' }} />
      </div>

      {/* 7 — two equal */}
      <div style={{ display: 'flex', height: '60vh' }}>
        <img src={imgs[11]} alt="" style={{ ...cover, width: '50%' }} />
        <img src={imgs[12]} alt="" style={{ ...cover, width: '50%' }} />
      </div>

      {/* 8 — full width */}
      <div style={{ height: '80vh' }}>
        <img src={imgs[13]} alt="" style={cover} />
      </div>

      {/* 9 — wide + narrow */}
      <div style={{ display: 'flex', height: '55vh' }}>
        <img src={imgs[14]} alt="" style={{ ...cover, width: '66.666%' }} />
        <img src={imgs[15]} alt="" style={{ ...cover, width: '33.333%' }} />
      </div>

      {/* 10 — two equal */}
      <div style={{ display: 'flex', height: '60vh' }}>
        <img src={imgs[16]} alt="" style={{ ...cover, width: '50%' }} />
        <img src={imgs[17]} alt="" style={{ ...cover, width: '50%' }} />
      </div>

      {/* Text */}
      <div style={{ padding: '10vw 8vw 12vw', maxWidth: '900px' }}>
        <p style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(1.6rem, 3.5vw, 3rem)',
          fontWeight: 400,
          lineHeight: 1.35,
          color: '#000',
          margin: '0 0 2rem',
        }}>
          Lehrerinnen und Lehrer sollen alles absorbieren. Gewalt. Stress. Sprachbarrieren. Überwachung. Verwaltungskollaps. Psychischer Druck.
        </p>
        <p style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(1.6rem, 3.5vw, 3rem)',
          fontWeight: 400,
          lineHeight: 1.35,
          color: '#000',
          margin: '0 0 2rem',
        }}>
          Und trotzdem weiter unterrichten.
        </p>
        <p style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(1.6rem, 3.5vw, 3rem)',
          fontWeight: 400,
          lineHeight: 1.35,
          color: '#000',
          margin: 0,
        }}>
          LEHRER wurde in dieser Realität gebaut.
        </p>
      </div>

    </main>
  )
}
