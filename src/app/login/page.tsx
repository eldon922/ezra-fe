'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/spinner'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from '@/hooks/use-toast'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function Login() {
  const { status } = useSession()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  React.useEffect(() => {
    if (status === 'authenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div>Memuat...</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Error Autentikasi",
        description: `Gagal masuk (${result?.error})`,
      })
    } else {
      toast({
        title: "Berhasil",
        description: "Berhasil masuk!",
      })
      router.push('/')
    }

    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Toaster />
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">LOGIN</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full"
              placeholder="Masukkan username"
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              placeholder="Masukkan password"
            />
          </div>
          
          <Button 
            disabled={isLoading} 
            type="submit" 
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="h-4 w-4 animate-spin mr-2" />
                Masuk...
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
