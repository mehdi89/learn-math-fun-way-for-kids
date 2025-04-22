import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Learn math fun way',
  description: 'Learn Addition, Subsctraction, Multiplication and Division',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
