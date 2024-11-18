import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { ScriptProps } from 'next/script'

interface AuthContextType {
  isAuthenticated: boolean
  isAdmin: boolean
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<ScriptProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
      checkAdminStatus(storedToken)
    }
  }, [])

  const checkAdminStatus = async (token: string) => {
    try {
      const response = await axios.get('/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIsAdmin(response.data.isAdmin)
    } catch (error) {
      console.error('Failed to check admin status')
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/login', { username, password })
      const { token } = response.data
      localStorage.setItem('token', token)
      setToken(token)
      setIsAuthenticated(true)
      await checkAdminStatus(token)
    } catch (error) {
      throw new Error('Login failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setIsAuthenticated(false)
    setIsAdmin(false)
  }

  const value = {
    isAuthenticated,
    isAdmin,
    token,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}