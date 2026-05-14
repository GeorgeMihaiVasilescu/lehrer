import Link from 'next/link'

const narrow = "'Arial Narrow', Arial, sans-serif"

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <style>{`
        .hp-nav { padding: 0.75rem 1.5rem; }
        .hp-hero { min-height: 80vh; padding: 3rem 2.5rem; }
        .hp-features { padding: 2rem 2.5rem; }
        .hp-features-grid {
          max-width: 56rem;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .hp-footer { padding: 0.6rem 1.5rem; }
        @media (max-width: 640px) {
          .hp-hero { padding: 2rem 1.25rem; }
          .hp-hero h1 { font-size: 36px !important; }
          .hp-features { padding: 1.5rem 1.25rem; }
          .hp-features-grid { grid-template-columns: 1fr !important; gap: 1.5rem; }
          .hp-footer { flex-wrap: wrap; gap: 0.4rem; }
        }
      `}</style>

      {/* Nav */}
      <nav className="hp-nav" style={{ background: '#fff', borderBottom: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: narrow, fontWeight: 400, fontSize: '0.85rem', letterSpacing: '0.18em', color: '#000' }}>
          LEHRER.LIVE
        </span>
        <Link href="/auth/login" style={{ fontFamily: narrow, fontWeight: 400, fontSize: '0.75rem', letterSpacing: '0.12em', color: '#000', textDecoration: 'none' }}>
          ANMELDEN
        </Link>
      </nav>

      {/* Hero */}
      <section
        className="hp-hero"
        style={{
          position: 'relative',
          backgroundImage: "url('/classroom.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '36rem' }}>
          <h1 style={{
            fontFamily: "'Arial Narrow', 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 400,
            fontSize: '48px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#fff',
            margin: '0 0 0.6rem',
            lineHeight: 1,
          }}>
            LEHRER
          </h1>

          <p style={{
            fontFamily: narrow,
            fontWeight: 400,
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: '2rem',
          }}>
            KI-Deutschsprachassistent — A1 bis C1
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/auth/signup" style={{ fontFamily: narrow, fontWeight: 400, fontSize: '0.8rem', letterSpacing: '0.15em', color: '#fff', textDecoration: 'none', textTransform: 'uppercase' }}>
              [ 1 ] &nbsp;LEHRKRAFT
            </Link>
            <Link href="/student" style={{ fontFamily: narrow, fontWeight: 400, fontSize: '0.8rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', textTransform: 'uppercase' }}>
              [ 2 ] &nbsp;SCHULER
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="hp-features" style={{ background: '#fff', borderTop: '1px solid #000' }}>
        <div className="hp-features-grid">
          {[
            { step: 'SCHRITT 01', title: 'SPRACHEINGABE', desc: 'Schuler sprechen frei. Whisper transkribiert in Echtzeit.' },
            { step: 'SCHRITT 02', title: 'FEHLERPROTOKOLL', desc: 'Genauigkeit, Fehler und Dauer werden pro Sitzung erfasst.' },
            { step: 'SCHRITT 03', title: 'ROBOTER-KONFIGURATION', desc: 'Lehrkrafte konfigurieren Name, Niveau und Personlichkeit.' },
          ].map((card) => (
            <div key={card.step} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontFamily: narrow, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.12em', color: '#999', textTransform: 'uppercase' }}>
                {card.step}
              </span>
              <p style={{ fontFamily: narrow, fontWeight: 400, fontSize: '0.85rem', letterSpacing: '0.1em', color: '#000', margin: 0, textTransform: 'uppercase' }}>
                {card.title}
              </p>
              <p style={{ fontFamily: narrow, fontWeight: 400, fontSize: '0.8rem', color: '#555', textTransform: 'none', letterSpacing: '0.02em', lineHeight: 1.5, margin: 0 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="hp-footer" style={{ background: '#fff', borderTop: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: narrow, fontSize: '0.6rem', color: '#aaa', letterSpacing: '0.08em' }}>LEHRER.LIVE — GPT-4O + WHISPER</span>
        <Link href="/manifesto" style={{ fontFamily: narrow, fontSize: '0.6rem', color: '#bbb', letterSpacing: '0.08em', textDecoration: 'none' }}>
          [ manifesto ]
        </Link>
        <span style={{ fontFamily: narrow, fontSize: '0.6rem', color: '#aaa', letterSpacing: '0.08em' }}>V1.0.0</span>
      </footer>
    </main>
  )
}
