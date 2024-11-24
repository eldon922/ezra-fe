'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header';
import Providers from '@/components/Providers';
import './globals.css';
import { signOut } from 'next-auth/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const response = await originalFetch(...args)
      
      // Only handle API routes
      if (args[0].toString().startsWith('/api/')) {
        if (response.status === 401) {
          await signOut({ redirect: false })
          router.push('/login')
        }
      }
      
      return response
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [router])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>
          <Header />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
