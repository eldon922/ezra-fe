'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { LoadingSpinner } from './ui/spinner'
const pjson = await import('../../package.json')

export default function Header() {
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) setIsLoading(false)
  }, [isAuthenticated])

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-bold text-foreground">Ezra ASR</Link>
          <span className="text-xs text-muted-foreground bg-red-500 text-white rounded px-2 py-1">v{pjson.version}</span>
          <span className="flex flex-col text-xs text-muted-foreground">Ada masalah? Silakan hubungi tim IT support kami</span>
          <a href="https://wa.me/+6289618113757" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground bg-green-500 text-white rounded px-2 py-1 hover:bg-green-600 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z" />
            </svg>
            Hubungi via WhatsApp
          </a>
        </div>
        <nav className="flex items-center gap-4">
          {isAuthenticated && (
            <>
              {!isAdmin ? (
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>) : (
                <>
                  <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Link>
                  <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">
                    Users
                  </Link>
                  <Link href="/admin/transcribe-prompts" className="text-muted-foreground hover:text-foreground">
                    Transcribe Prompts
                  </Link>
                  <Link href="/admin/proofread-prompts" className="text-muted-foreground hover:text-foreground">
                    Proofread Prompts
                  </Link>
                </>
              )}
              <Button disabled={isLoading} onClick={() => {
                setIsLoading(true)
                logout()
              }}>
                Keluar
                {isLoading && <LoadingSpinner className="h-4 w-4 animate-spin" />}
              </Button>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}