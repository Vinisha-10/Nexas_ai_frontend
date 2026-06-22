import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nexus AI - Enterprise Intelligence Workspace',
  description: 'A complete AI workspace where teams collaborate, analyze datasets, build visual automated workflows, and query documents with advanced RAG systems.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
