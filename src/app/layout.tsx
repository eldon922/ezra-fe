'use client'

import Header from '@/components/Header';
import Providers from '@/components/Providers';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import { useEffect } from 'react';
import './globals.css';

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
        <NextTopLoader />
        <Providers>
          <Header />
          <main className="container mx-auto px-4 py-5">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
