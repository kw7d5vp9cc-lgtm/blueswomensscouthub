import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Chelsea Women's Scouting Hub",
  description: 'Talent ID, fixtures, reporting and recruitment workflow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
