'use client'

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from '@/context/AuthContext'
import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <SessionProvider>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </SessionProvider>
        </ThemeProvider>
    )
} 