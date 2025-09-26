'use client'

import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardTabs } from '@/components/dashboard/tabs'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useEffect } from 'react'
import { useMetricsStore } from '@/stores/metrics-store'

export default function DashboardPage() {
  const loadDefaultData = useMetricsStore((state) => state.loadDefaultData)

  useEffect(() => {
    loadDefaultData()
  }, [loadDefaultData])

  return (
    <AuthGuard requiredLevel="full">
      <div className="min-h-screen p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <DashboardHeader />
          <DashboardTabs />
        </div>
      </div>
    </AuthGuard>
  )
}