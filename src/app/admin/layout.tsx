'use client'

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if user is not authenticated or doesn't have admin role
    if (status === 'unauthenticated' || !session?.user?.isAdmin) {
      router.push('/login');
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // Only render children if user is authenticated and has admin role
  if (status === 'authenticated' && session?.user?.isAdmin) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
} 