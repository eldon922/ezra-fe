'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { LoadingSpinner } from './ui/spinner'
const pjson = await import('../../package.json')

export default function Header() {
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) setIsLoading(false)
  }, [isAuthenticated])

  return (
    <header className="bg-background border-b shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top bar with support info */}
        <div className="py-1 border-b border-border/50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground hidden sm:block">Ada masalah? Hubungi tim IT support kami</span>
              <span className="text-muted-foreground block sm:hidden">Support:</span>
              <a 
                href="https://wa.me/+6289618113757" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded-full transition-colors text-xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z" />
                </svg>
                <span className="hidden sm:inline">WhatsApp Support</span>
                <span className="inline sm:hidden">WA</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white px-2 py-1 rounded font-bold text-xs">
                v{pjson.version}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/ezra.jpeg"
                alt="Ezra Logo"
                width={32}
                height={32}
                className="rounded-lg shadow-sm"
              />
              <div className="block">
                <h1 className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors">
                  Ezra ASR
                </h1>
                <p className="text-xs text-muted-foreground">Automatic Speech Recognition</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            {isAuthenticated && (
              <>
                {!isAdmin ? (
                  <Link 
                    href="/dashboard" 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm"
                  >
                    <span className="text-sm">📄</span>
                    Transkrip
                  </Link>
                ) : (
                  <div className="flex items-center gap-1">
                    <Link 
                      href="/admin/dashboard" 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm"
                    >
                      <span className="text-sm">📊</span>
                      Dashboard
                    </Link>
                    <Link 
                      href="/admin/users" 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm"
                    >
                      <span className="text-sm">👥</span>
                      Users
                    </Link>
                    <Link 
                      href="/admin/transcribe-prompts" 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm"
                    >
                      <span className="text-sm">📝</span>
                      Transcribe
                    </Link>
                    <Link 
                      href="/admin/proofread-prompts" 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm"
                    >
                      <span className="text-sm">✏️</span>
                      Proofread
                    </Link>
                  </div>
                )}
                <Button 
                  disabled={isLoading} 
                  onClick={() => {
                    setIsLoading(true)
                    logout()
                  }} 
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <span>🚪</span>
                  Keluar
                  {isLoading && <LoadingSpinner className="h-4 w-4 animate-spin" />}
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          {isAuthenticated && (
            <div className="lg:hidden flex items-center gap-2">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border/50 py-3">
            <nav className="flex flex-col gap-2">
              {!isAdmin ? (
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-sm">📄</span>
                  Transkrip
                </Link>
              ) : (
                <>
                  <Link 
                    href="/admin/dashboard" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-sm">📊</span>
                    Dashboard
                  </Link>
                  <Link 
                    href="/admin/users" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-sm">👥</span>
                    Users
                  </Link>
                  <Link 
                    href="/admin/transcribe-prompts" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-sm">📝</span>
                    Transcribe
                  </Link>
                  <Link 
                    href="/admin/proofread-prompts" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-sm">✏️</span>
                    Proofread
                  </Link>
                </>
              )}
              <Button 
                disabled={isLoading} 
                onClick={() => {
                  setIsLoading(true)
                  logout()
                }} 
                variant="secondary"
                className="flex items-center gap-2 justify-start mt-2"
              >
                <span>🚪</span>
                Keluar
                {isLoading && <LoadingSpinner className="h-4 w-4 animate-spin" />}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}