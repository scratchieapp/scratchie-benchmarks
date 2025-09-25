'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Company } from '@/types'
import { syncIndustriesConfig } from '@/config/sync-industries'

interface TenantContextType {
  company: Company | null
  loading: boolean
  error: string | null
  refreshCompany: () => Promise<void>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({
  children,
  initialCompany = null
}: {
  children: React.ReactNode
  initialCompany?: Company | null
}) {
  const [company, setCompany] = useState<Company | null>(initialCompany)
  const [loading, setLoading] = useState(!initialCompany)
  const [error, setError] = useState<string | null>(null)

  const refreshCompany = async () => {
    try {
      setLoading(true)
      setError(null)

      // For now, use the default Sync Industries config
      // In production, this would fetch from Supabase based on subdomain or auth
      setCompany(syncIndustriesConfig)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company')
      console.error('Failed to load company:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialCompany) {
      refreshCompany()
    }
  }, [initialCompany])

  return (
    <TenantContext.Provider value={{ company, loading, error, refreshCompany }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}