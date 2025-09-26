'use client'

import { useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface AuthGuardProps {
  children: ReactNode
  requiredLevel?: 'full' | 'simple' | 'any'
}

export function AuthGuard({ children, requiredLevel = 'any' }: AuthGuardProps) {
  const [authLevel, setAuthLevel] = useState<'full' | 'simple' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        setAuthLevel('full')
      } else {
        // Check for simple password auth in localStorage
        const storedAuth = localStorage.getItem('scratchie_auth')
        if (storedAuth === 'sync2025') {
          setAuthLevel('full')
        } else if (storedAuth === 'simple2025') {
          setAuthLevel('simple')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSimpleAuth = (e: React.FormEvent) => {
    e.preventDefault()

    // Check password and set appropriate access level
    if (password === 'sync2025') {
      localStorage.setItem('scratchie_auth', 'sync2025')
      setAuthLevel('full')
      setError('')
      // Redirect to full dashboard
      window.location.href = '/'
    } else if (password === 'simple2025') {
      localStorage.setItem('scratchie_auth', 'simple2025')
      setAuthLevel('simple')
      setError('')
      // Redirect to simple dashboard
      window.location.href = '/simple'
    } else {
      setError('Invalid password')
    }
  }

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        setAuthLevel('full')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  const isAuthenticated = authLevel !== null
  const hasRequiredAccess = requiredLevel === 'any' || authLevel === requiredLevel || authLevel === 'full'

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-xl p-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/logos/scratchie-logo-black.svg"
                alt="Scratchie"
                width={150}
                height={50}
                className="h-12 w-auto"
              />
            </div>

            <div className="text-center mb-6">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-gray-900">Manufacturing Dashboard</h2>
              <p className="text-gray-600 mt-2">Enter your credentials to access the dashboard</p>
            </div>

            {/* Simple Password Auth */}
            <form onSubmit={handleSimpleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Full access: sync2025 | Simple view: simple2025
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                Or sign in with email (if configured)
              </p>

              {/* Supabase Email Auth (optional) */}
              <form onSubmit={handleSupabaseAuth} className="mt-4 space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign in with Email
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            © 2025 Scratchie. All rights reserved.
          </p>
        </div>
      </div>
    )
  }

  // Check if user has required access level
  if (!hasRequiredAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to view this dashboard.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('scratchie_auth')
              window.location.href = '/'
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}