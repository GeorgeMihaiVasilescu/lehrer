import Link from 'next/link'

const textStyle = {
  fontFamily: "'Arial Narrow', Arial, sans-serif",
  fontWeight: 400,
}

export default function ManifestoPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#fff', color: '#000' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #000', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ ...textStyle, fontSize: '0.8rem', letterSpacing: '0.18em', color: '#000', textDecoration: 'none', textTransform: 'uppercase' as const }}>
          ← LEHRER.LIVE
        </Link>
        <span style={{ ...textStyle, fontSize: '0.6rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase' as const }}>
          MANIFEST
        </span>
      </nav>

      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* Header */}
        <div style={{ borderBottom: '1px solid #000', paddingBottom: '2rem', marginBottom: '3rem' }}>
          <p style={{ ...textStyle, fontSize: '0.65rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase' as const, marginBottom: '1rem' }}>
            LEHRER.LIVE — POSITIONSPAPIER — 2025
          </p>
          <h1 style={{ ...textStyle, fontSize: '2.2rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, lineHeight: 1.1, margin: 0 }}>
            DIE LAGE DER<br />LEHRKRÄFTE IN<br />DEUTSCHLAND
          </h1>
        </div>

        {/* Body text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          <section>
            <p style={{ ...textStyle, fontSize: '0.6rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase' as const, marginBottom: '0.75rem' }}>
              § 1 — AUSGANGSLAGE
            </p>
            <p style={{ fontFamily: 'Arial, sans-serif', fontWeight: 400, fontSize: '0.95rem', color: '#111', lineHeight: 1.8, textTransform: 'none' }}>
              Deutschland fehlen über 40.000 Lehrkräfte. Der Mangel betrifft alle Bundesländer,
              alle Schulformen, alle Fächer. Besonders betroffen: Deutsch als Zweitsprache,
              Fremdsprachen, Grundschulen in strukturschwachen Regionen.
              Die Situation verschärft sich jährlich.
            </p>
          </section>

          <section>
            <p style={{ ...textStyle, fontSize: '0.6rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase' as const, marginBottom: '0.75rem' }}>
              § 2 — DAS PROBLEM MIT DEM SPRECHEN
            </p>
            <p style={{ fontFamily: 'Arial, sans-serif', fontWeight: 400, fontSize: '0.95rem', color: '#111', lineHeight: 1.8, textTransform: 'none' }}>
              Sprachunterricht erfordert Konversation. Eine Lehrkraft mit 28 Schülern
              kann jedem einzelnen wenige Minuten Sprechzeit pro Stunde garantieren.
              Der Rest wartet. Fehler werden nicht korrigiert. Hemmungen wachsen.
              Am Ende des Schuljahres hat der Schüler kaum gesprochen.
            </p>
          </section>

          {/* Placeholder image block 1 */}
          <div style={{ border: '1px solid #000', padding: '0' }}>
            <div style={{ background: '#f2f2f2', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/robot.png" alt="Lehrer System" style={{ width: '80px', opacity: 0.15 }} />
            </div>
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #000' }}>
              <p style={{ ...textStyle, fontSize: '0.6rem', letterSpacing: '0.1em', color: '#999', textTransform: 'uppercase' as const, margin: 0 }}>
                ABB. 1 — LEHRER-SYSTEM IM KLASSENZIMMER (PROTOTYP)
              </p>
            </div>
          </div>

          <section>
            <p style={{ ...textStyle, fontSize: '0.6rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase' as const, marginBottom: '0.75rem' }}>
              § 3 — DIE LÖSUNG
            </p>
            <p style={{ fontFamily: 'Arial, sans-serif', fontWeight: 400, fontSize: '0.95rem', color: '#111', lineHeight: 1.8, textTransform: 'none' }}>
              LEHRER ist ein KI-Sprachassistent, der unbegrenzt Konversation anbietet.
              Kein Urteil, keine Ungeduld, kein Zeitmangel. Schüler sprechen, die Maschine
              antwortet — korrigiert, erklärt, fragt zurück. Die Lehrkraft behält die Kontrolle:
              sie konfiguriert den Assistenten, liest die Protokolle, greift ein wo nötig.
            </p>
          </section>

          {/* Placeholder image block 2 */}
          <div style={{ border: '1px solid #000', padding: '0' }}>
            <div style={{ background: '#f2f2f2', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem' }}>
              {['A1', 'B1', 'C1'].map((level) => (
                <div key={level} style={{ textAlign: 'center' }}>
                  <img src="/robot.png" alt="" style={{ width: '50px', opacity: 0.12 }} />
                  <p style={{ ...textStyle, fontSize: '0.7rem', letterSpacing: '0.1em', color: '#999', marginTop: '0.5rem', textTransform: 'uppercase' as const }}>{level}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #000' }}>
              <p style={{ ...textStyle, fontSize: '0.6rem', letterSpacing: '0.1em', color: '#999', textTransform: 'uppercase' as const, margin: 0 }}>
                ABB. 2 — KONFIGURIERBARE ROBOTER PRO SPRACHNIVEAU
              </p>
            </div>
          </div>

          <section>
            <p style={{ ...textStyle, fontSize: '0.6rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase' as const, marginBottom: '0.75rem' }}>
              § 4 — HALTUNG
            </p>
            <p style={{ fontFamily: 'Arial, sans-serif', fontWeight: 400, fontSize: '0.95rem', color: '#111', lineHeight: 1.8, textTransform: 'none' }}>
              Wir ersetzen keine Lehrkräfte. Wir geben ihnen ein Werkzeug zurück.
              Die Maschine übernimmt die Wiederholung. Die Lehrkraft übernimmt
              das Menschliche. Das ist die Aufgabenteilung, die wir für richtig halten.
            </p>
          </section>

          {/* Closing rule */}
          <div style={{ borderTop: '1px solid #000', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ ...textStyle, fontSize: '0.6rem', letterSpacing: '0.1em', color: '#999', textTransform: 'uppercase' as const, marginBottom: '0.25rem' }}>
                LEHRER.LIVE
              </p>
              <p style={{ ...textStyle, fontSize: '0.6rem', letterSpacing: '0.1em', color: '#bbb', textTransform: 'uppercase' as const }}>
                DEUTSCHLAND — 2025
              </p>
            </div>
            <Link href="/auth/signup" style={{ ...textStyle, fontSize: '0.7rem', letterSpacing: '0.12em', color: '#000', textDecoration: 'none', textTransform: 'uppercase' as const, borderBottom: '1px solid #000' }}>
              REGISTRIEREN
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}
