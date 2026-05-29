import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Baseball Command Center',
  description: 'Live MLB highlights, scores, leaders, and baseball social feed.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
