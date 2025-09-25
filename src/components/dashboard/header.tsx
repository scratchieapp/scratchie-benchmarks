'use client'

import Image from 'next/image'
import { useTenant } from '@/contexts/tenant-context'
import { useMetricsStore } from '@/stores/metrics-store'
import { calculateScratchieIndex, getScratchieIndexColor, getScratchieIndexLabel, calculateROI } from '@/lib/calculations'
import { formatCurrency, cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'

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
          <div className="text-center relative">
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-sm text-gray-500 font-medium">Scratchie Index</p>
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
            <div className={cn('rounded-xl px-8 py-4 relative', getScratchieIndexColor(scratchieIndex))}>
              <div className="absolute top-2 left-2 text-xs font-medium opacity-75">
                Baseline: 58
              </div>
              <p className="text-4xl font-bold">{scratchieIndex}</p>
              <p className="text-sm font-medium mt-1">{getScratchieIndexLabel(scratchieIndex)}</p>
              {scratchieIndex > 58 && (
                <p className="text-xs mt-1 font-semibold">+{scratchieIndex - 58} from baseline</p>
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
          </div>
        </div>
      </div>
    </div>
  )
}