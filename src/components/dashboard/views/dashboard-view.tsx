'use client'

import { useMetricsStore } from '@/stores/metrics-store'
import { useTenant } from '@/contexts/tenant-context'
import { MetricTile } from '../metric-tile'
import { PerformanceRadar } from '../charts/performance-radar'
import { DefectDistribution } from '../charts/defect-distribution'
import { QuarterlyTimeline } from '../quarterly-timeline'
import { calculateMetrics } from '@/lib/calculations'

export function DashboardView() {
  const { company } = useTenant()
  const { quarters } = useMetricsStore()

  if (!company || quarters.length === 0) {
    return <div>Loading...</div>
  }

  const baseline = quarters.find((q) => q.quarter.isBaseline)
  const metrics = baseline?.actual ? calculateMetrics(baseline.actual) : null

  if (!metrics || !baseline?.actual) {
    return <div>No data available</div>
  }

  // Prepare chart data for 6 quarters
  const chartQuarters = quarters.slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MetricTile
          title="First Pass Yield"
          value={metrics.firstPassYield}
          unit="%"
          target={85}
          metricKey="firstPassYield"
          quarters={chartQuarters}
          trend={metrics.firstPassYield > 45 ? 'up' : 'down'}
        />

        <MetricTile
          title="Cycle Time"
          value={baseline.actual.production.avgTimePerPod}
          unit=" hrs"
          target={24}
          metricKey="cycleTime"
          quarters={chartQuarters}
          trend={baseline.actual.production.avgTimePerPod < 50 ? 'up' : 'down'}
          isLowerBetter
        />

        <MetricTile
          title="Cost of Quality"
          value={baseline.actual.quality.costOfQuality / 1000}
          unit="K"
          target={3}
          metricKey="costOfQuality"
          quarters={chartQuarters}
          trend={baseline.actual.quality.costOfQuality < 6000 ? 'up' : 'down'}
          isLowerBetter
          prefix="$"
        />

        <MetricTile
          title="Absenteeism"
          value={metrics.absenteeismRate}
          unit="%"
          target={2.8}
          metricKey="absenteeism"
          quarters={chartQuarters}
          trend={metrics.absenteeismRate < 7 ? 'up' : 'down'}
          isLowerBetter
        />
      </div>

      {/* Visual Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceRadar quarters={quarters} />
        <DefectDistribution baseline={baseline.actual} />
      </div>

      {/* Quarterly Progress Timeline */}
      <QuarterlyTimeline quarters={quarters} />

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricTile
          title="Defects per Pod"
          value={metrics.defectsPerPod}
          unit=""
          target={3.5}
          metricKey="defectsPerPod"
          quarters={chartQuarters}
          trend={metrics.defectsPerPod < 5 ? 'up' : 'down'}
          isLowerBetter
        />

        <MetricTile
          title="Overtime Percentage"
          value={metrics.overtimePercentage}
          unit="%"
          target={5}
          metricKey="overtimePercentage"
          quarters={chartQuarters}
          trend={metrics.overtimePercentage < 10 ? 'up' : 'down'}
          isLowerBetter
        />

        <MetricTile
          title="Daily Output"
          value={baseline.actual.production.dailyPodOutput}
          unit=" pods"
          target={21}
          metricKey="dailyOutput"
          quarters={chartQuarters}
          trend={baseline.actual.production.dailyPodOutput > 15 ? 'up' : 'down'}
        />
      </div>
    </div>
  )
}