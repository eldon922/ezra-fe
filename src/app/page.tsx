'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (isAdmin) {
      router.push('/admin/dashboard')
    } else {
      router.push('/transcribe')
    }
  }, [isAuthenticated, isAdmin, router])
}