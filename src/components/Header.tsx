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
          <span className="text-xs text-muted-foreground">v{pjson.version}</span>
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
                  <Link href="/admin/system-prompts" className="text-muted-foreground hover:text-foreground">
                    System Prompts
                  </Link>
                </>
              )}
              <Button disabled={isLoading} onClick={() => {
                setIsLoading(true)
                logout()
              }}>
                Logout
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