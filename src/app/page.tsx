import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/context/AuthContext'

const Login = dynamic(() => import('./login/page'))
const Dashboard = dynamic(() => import('./dashboard/page'))
const AdminPortal = dynamic(() => import('./admin/page'))

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return <Login />
  }

  if (isAdmin) {
    return <AdminPortal />
  }

  return <Dashboard />
}