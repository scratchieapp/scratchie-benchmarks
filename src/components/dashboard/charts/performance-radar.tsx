'use client'

import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts'
import { QuarterData, PartialQuarterData } from '@/lib/calculations'

interface Quarter {
  id: string
  isBaseline: boolean
  quarter: string
  label: string
}

interface PerformanceRadarProps {
  quarters: Array<{
    quarter: Quarter
    actual: QuarterData | null
    target: PartialQuarterData | null
  }>
}

export function PerformanceRadar({ quarters }: PerformanceRadarProps) {
  const baseline = quarters.find((q) => q.quarter.isBaseline)
  if (!baseline?.actual) return null

  const data = [
    {
      metric: 'Quality',
      current: baseline.actual.quality.percentComplete,
      target: 85,
      fullMark: 100,
    },
    {
      metric: 'Productivity',
      current: Math.min((24 / baseline.actual.production.avgTimePerPod) * 100, 100),
      target: 75,
      fullMark: 100,
    },
    {
      metric: 'Efficiency',
      current: Math.max(100 - ((baseline.actual.production.overtimeHours / (baseline.actual.workforce.fullTimeStaff * 160)) * 100), 0),
      target: 95,
      fullMark: 100,
    },
    {
      metric: 'Attendance',
      current: Math.max(100 - ((baseline.actual.workforce.sickLeaveDays / (baseline.actual.workforce.fullTimeStaff * 65)) * 100), 0),
      target: 97,
      fullMark: 100,
    },
    {
      metric: 'Cost Control',
      current: Math.max(100 - (baseline.actual.quality.costOfQuality / 20000 * 100), 0),
      target: 85,
      fullMark: 100,
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Performance Radar</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Current"
            dataKey="current"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
          />
          <Radar
            name="Target"
            dataKey="target"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.2}
          />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}