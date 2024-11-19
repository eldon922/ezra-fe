'use client'

import React, { createContext, useContext } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Session } from 'next-auth'

interface AuthContextType {
  isAuthenticated: boolean
  isAdmin: boolean
  session: Session | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession()

  const login = async (username: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }
    } catch (error) {
      throw new Error('Login failed')
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  const value = {
    isAuthenticated: status === 'authenticated',
    isAdmin: session?.user?.isAdmin ?? false,
    session,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}