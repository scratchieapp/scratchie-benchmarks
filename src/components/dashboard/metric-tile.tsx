'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import { useTenant } from '@/contexts/tenant-context'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { QuarterData, PartialQuarterData } from '@/lib/calculations'

interface Quarter {
  id: string
  quarter: string
  label: string
  isBaseline: boolean
}

interface QuarterWithData {
  quarter: Quarter
  actual: QuarterData | null
  target: PartialQuarterData | null
}

interface MetricTileProps {
  title: string
  value: number
  unit: string
  target: number
  metricKey: string
  quarters: QuarterWithData[]
  trend?: 'up' | 'down'
  isLowerBetter?: boolean
  prefix?: string
}

export function MetricTile({
  title,
  value,
  unit,
  target,
  metricKey,
  quarters,
  trend,
  isLowerBetter = false,
  prefix = '',
}: MetricTileProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const { company } = useTenant()

  // Find metric definition
  const metricDef = company?.config.metrics.find((m) => m.key === metricKey)

  // Prepare chart data
  const chartData = quarters.map((q, index) => {
    const isActual = q.actual !== null
    const isCurrent = index === 0 && q.quarter.isBaseline

    let metricValue = 0
    if (isActual && q.actual) {
      switch (metricKey) {
        case 'firstPassYield':
          metricValue = q.actual.quality?.percentComplete || 0
          break
        case 'cycleTime':
          metricValue = q.actual.production?.avgTimePerPod || 0
          break
        case 'costOfQuality':
          metricValue = (q.actual.quality?.costOfQuality || 0) / 1000
          break
        case 'absenteeism':
          const workDays = 65
          metricValue = q.actual.workforce
            ? (q.actual.workforce.sickLeaveDays / (q.actual.workforce.fullTimeStaff * workDays)) * 100
            : 0
          break
        case 'defectsPerPod':
          metricValue = q.actual.quality
            ? q.actual.quality.totalDefects / q.actual.quality.podsInspected
            : 0
          break
        case 'overtimePercentage':
          metricValue = q.actual.workforce && q.actual.production
            ? (q.actual.production.overtimeHours / (q.actual.workforce.fullTimeStaff * 160)) * 100
            : 0
          break
        case 'dailyOutput':
          metricValue = q.actual.production?.dailyPodOutput || 0
          break
      }
    } else if (q.target) {
      switch (metricKey) {
        case 'firstPassYield':
          metricValue = q.target.quality?.percentComplete || 0
          break
        case 'cycleTime':
          metricValue = q.target.production?.avgTimePerPod || 0
          break
        case 'costOfQuality':
          metricValue = (q.target.quality?.costOfQuality || 0) / 1000
          break
        case 'absenteeism':
          const baseline = quarters.find(qt => qt.quarter.isBaseline)
          const workDays = 65
          metricValue = q.target.workforce?.sickLeaveDays && baseline?.actual?.workforce
            ? (q.target.workforce.sickLeaveDays / (baseline.actual.workforce.fullTimeStaff * workDays)) * 100
            : 0
          break
        case 'defectsPerPod':
          const baselineQ = quarters.find(qt => qt.quarter.isBaseline)
          metricValue = q.target.quality?.totalDefects && baselineQ?.actual?.quality
            ? q.target.quality.totalDefects / baselineQ.actual.quality.podsInspected
            : 0
          break
        case 'overtimePercentage':
          const baselineQuarter = quarters.find(qt => qt.quarter.isBaseline)
          metricValue = q.target.production?.overtimeHours && baselineQuarter?.actual?.workforce
            ? (q.target.production.overtimeHours / (baselineQuarter.actual.workforce.fullTimeStaff * 160)) * 100
            : 0
          break
        case 'dailyOutput':
          metricValue = q.target.production?.dailyPodOutput || 0
          break
      }
    }

    return {
      quarter: q.quarter.quarter,
      value: metricValue,
      type: isActual ? 'actual' : 'target',
      isCurrent,
    }
  })

  const isPerformanceGood = isLowerBetter ? value <= target : value >= target
  const performanceColor = isPerformanceGood ? 'text-green-600' : 'text-red-600'
  const bgColor = isPerformanceGood ? 'bg-green-50' : 'bg-red-50'

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="relative">
          <Info
            className="w-4 h-4 text-gray-400 cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && metricDef && (
            <div className="absolute z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-xl -right-2 top-6">
              <h4 className="font-semibold mb-2">{metricDef.displayName}</h4>
              <p className="text-sm text-gray-600 mb-2">{metricDef.description}</p>
              <p className="text-xs text-gray-500 mb-1">
                <strong>Formula:</strong> {metricDef.formula}
              </p>
              <p className="text-xs text-blue-600">
                <strong>Impact:</strong> {metricDef.impact}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Current Value Display */}
      <div className="text-center mb-4">
        <div className={cn('inline-flex items-center gap-2', performanceColor)}>
          <span className="text-3xl font-bold">
            {prefix}{value.toFixed(1)}{unit}
          </span>
          {trend === 'up' && <TrendingUp className="w-5 h-5" />}
          {trend === 'down' && <TrendingDown className="w-5 h-5" />}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Target: {prefix}{target}{unit}
        </p>
      </div>

      {/* Column Chart */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
            <XAxis
              dataKey="quarter"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis hide />
            <Tooltip
              formatter={(value: number | string) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value as string)
                return `${prefix}${numValue.toFixed(1)}${unit}`
              }}
            />
            <ReferenceLine
              y={target}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeWidth={1.5}
            />
            <Bar dataKey="value">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.isCurrent ? '#fbbf24' :
                    entry.type === 'actual' ? '#3b82f6' :
                    '#e5e7eb'
                  }
                  stroke={entry.type === 'target' ? '#9ca3af' : 'none'}
                  strokeWidth={entry.type === 'target' ? 1 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status Indicator */}
      <div className={cn('mt-4 p-3 rounded-lg text-xs font-medium', bgColor, performanceColor)}>
        {isPerformanceGood
          ? `Meeting target (${((Math.abs(value - target) / target) * 100).toFixed(0)}% ${isLowerBetter ? 'below' : 'above'})`
          : `${((Math.abs(value - target) / target) * 100).toFixed(0)}% ${isLowerBetter ? 'above' : 'below'} target`}
      </div>
    </div>
  )
}