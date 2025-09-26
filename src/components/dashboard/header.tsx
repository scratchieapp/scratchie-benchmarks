'use client'

import Image from 'next/image'
import { useTenant } from '@/contexts/tenant-context'
import { useMetricsStore } from '@/stores/metrics-store'
import { calculateScratchieIndex, getScratchieIndexColor, getScratchieIndexLabel, calculateROI } from '@/lib/calculations'
import { formatCurrency, cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Info, LogOut } from 'lucide-react'

export function DashboardHeader() {
  const { company } = useTenant()
  const { quarters, loadDefaultData } = useMetricsStore()
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    if (quarters.length === 0) {
      loadDefaultData()
    }
  }, [quarters.length, loadDefaultData])

  if (!company) return null

  // Get baseline data for Scratchie Index
  const baseline = quarters.find(q => q.quarter.isBaseline)
  const scratchieIndex = baseline?.actual
    ? calculateScratchieIndex(baseline.actual, company.config.calculations.scratchieIndexWeights)
    : 0

  // Calculate projected ROI
  const lastQuarter = quarters[quarters.length - 1]
  const roi = baseline?.actual && lastQuarter?.target
    ? calculateROI(baseline.actual, lastQuarter.target, {
        overtimeRate: company.config.calculations.roiAssumptions.hourlyLaborRate *
                      company.config.calculations.roiAssumptions.overtimeMultiplier,
        podMargin: company.config.calculations.roiAssumptions.podProfitMargin,
        workingDays: company.config.calculations.roiAssumptions.annualWorkingDays,
        absenteeismCost: company.config.calculations.roiAssumptions.productivityLossPerAbsence *
                         company.config.calculations.roiAssumptions.annualWorkingDays
      })
    : null

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        {/* Left side - Logos and company info */}
        <div className="flex items-center gap-6">
          <Image
            src="/logos/scratchie-logo-black.svg"
            alt="Scratchie"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
          <div className="border-l pl-6">
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-gray-600 text-sm mt-1">Manufacturing Quality Excellence Dashboard</p>
            <div className="flex gap-4 mt-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Baseline: {company.baselineQuarter}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {company.subscriptionTier === 'professional' ? 'Professional' : 'Trial'} Plan
              </span>
            </div>
          </div>
        </div>

        {/* Center - Scratchie Index */}
        <div className="flex items-center gap-12">
          <div className="relative">
            {/* Title and Info */}
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Scratchie Index</p>
              <button
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                {showTooltip && (
                  <div className="absolute z-10 w-72 p-4 bg-white rounded-lg shadow-xl border border-gray-200 -top-2 left-6">
                    <p className="text-sm font-semibold mb-2">How the Scratchie Index is calculated:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Quality (30%): First pass yield, defect rates</li>
                      <li>• Productivity (25%): Cycle time, daily output</li>
                      <li>• Safety (20%): Incident rates, near misses</li>
                      <li>• Engagement (15%): Absenteeism, turnover</li>
                      <li>• Sustainability (10%): Waste, energy usage</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">Score range: 0-100 (higher is better)</p>
                  </div>
                )}
              </button>
            </div>

            {/* Score Display */}
            <div className="flex items-center gap-4">
              {/* Baseline */}
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">Baseline</p>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <p className="text-2xl font-bold text-gray-600">58</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* Current Score */}
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">Current</p>
                <div className={cn('rounded-lg px-6 py-2', getScratchieIndexColor(scratchieIndex))}>
                  <p className="text-3xl font-bold">{scratchieIndex}</p>
                  <p className="text-xs font-medium mt-1">{getScratchieIndexLabel(scratchieIndex)}</p>
                </div>
              </div>

              {/* Improvement */}
              {scratchieIndex !== 58 && (
                <div className="text-center ml-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">Change</p>
                  <div className={cn(
                    'rounded-lg px-3 py-2',
                    scratchieIndex > 58 ? 'bg-green-100' : 'bg-red-100'
                  )}>
                    <p className={cn(
                      'text-xl font-bold',
                      scratchieIndex > 58 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {scratchieIndex > 58 ? '+' : ''}{scratchieIndex - 58}
                    </p>
                    <p className="text-xs font-medium">
                      {scratchieIndex > 58 ? 'Improved' : 'Declined'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - ROI and Logo */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-500">Projected Annual ROI</p>
              <p className="text-3xl font-bold text-green-600">
                {roi ? formatCurrency(roi.total / 1000) + 'K' : '$0K'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Conservative Estimate</p>
            </div>
            <Image
              src="/logos/sync-logo.svg"
              alt={company.name}
              width={100}
              height={40}
              className="h-12 w-auto"
            />
            <button
              onClick={() => {
                localStorage.removeItem('scratchie_auth')
                window.location.href = '/'
              }}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}