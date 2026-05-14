import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LEHRER — KI DEUTSCHLEHRER',
  description: 'AI voice robot for German language classes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen text-white" style={{ background: '#000' }}>
        {children}
      </body>
    </html>
  )
}
