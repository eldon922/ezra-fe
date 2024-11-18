import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const { isAuthenticated, isAdmin, logout } = useAuth()

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">Ezra ASR</Link>
        <nav>
          {isAuthenticated && (
            <>
              <Link href="/" className="text-gray-600 hover:text-gray-800 mr-4">Dashboard</Link>
              {isAdmin && (
                <Link href="/admin" className="text-gray-600 hover:text-gray-800 mr-4">Admin</Link>
              )}
              <Button onClick={logout}>Logout</Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}