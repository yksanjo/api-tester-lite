import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'API Tester Lite - Lightweight HTTP Client',
  description: 'A lightweight Postman-like API testing tool',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="antialiased">{children}</body></html>
}
