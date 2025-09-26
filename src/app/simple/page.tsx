'use client'

import { SimpleDashboard } from '@/components/simple/simple-dashboard'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useEffect } from 'react'
import { useMetricsStore } from '@/stores/metrics-store'

export default function SimpleDashboardPage() {
  const loadDefaultData = useMetricsStore((state) => state.loadDefaultData)

  useEffect(() => {
    loadDefaultData()
  }, [loadDefaultData])

  return (
    <AuthGuard requiredLevel="simple">
      <SimpleDashboard />
    </AuthGuard>
  )
}