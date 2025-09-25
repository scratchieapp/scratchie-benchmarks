'use client'

import { useMetricsStore } from '@/stores/metrics-store'
import { useTenant } from '@/contexts/tenant-context'
import { LineChart, Line, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { calculateMetrics } from '@/lib/calculations'
import { formatCurrency, formatPercentage } from '@/lib/utils'

export function PerformanceView() {
  const { company } = useTenant()
  const { quarters } = useMetricsStore()

  if (!company || quarters.length === 0) {
    return <div>Loading...</div>
  }

  const baseline = quarters.find((q) => q.quarter.isBaseline)
  if (!baseline?.actual) return <div>No baseline data available</div>

  // Prepare trend data for all quarters
  const trendData = quarters.map((q) => {
    const data = q.actual || q.target
    if (!data) return null

    const metrics = q.actual ? calculateMetrics(q.actual) : null

    return {
      quarter: q.quarter.quarter,
      type: q.actual ? 'Actual' : 'Target',
      costOfQuality: data.quality?.costOfQuality || 0,
      defects: data.quality?.totalDefects || 0,
      cycleTime: data.production?.avgTimePerPod || 0,
      overtime: data.production?.overtimeHours || 0,
      output: data.production?.dailyPodOutput || 0,
      fpy: data.quality?.percentComplete || 0,
      absenteeism: metrics?.absenteeismRate ||
        (q.target?.workforce?.sickLeaveDays && baseline.actual?.workforce ?
          (q.target.workforce.sickLeaveDays / (baseline.actual.workforce.fullTimeStaff * 65)) * 100 : 0),
    }
  }).filter((d) => d !== null)

  // Calculate improvements
  const q4Target = quarters[1]?.target
  const improvements = q4Target ? {
    cycleTime: ((baseline.actual.production.avgTimePerPod - (q4Target.production?.avgTimePerPod || 0)) /
                baseline.actual.production.avgTimePerPod * 100),
    quality: ((q4Target.quality?.percentComplete || 0) - baseline.actual.quality.percentComplete),
    overtime: ((baseline.actual.production.overtimeHours - (q4Target.production?.overtimeHours || 0)) /
               baseline.actual.production.overtimeHours * 100),
    defects: ((baseline.actual.quality.totalDefects - (q4Target.quality?.totalDefects || 0)) /
              baseline.actual.quality.totalDefects * 100),
  } : null

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cycle Time Reduction</span>
            {improvements && improvements.cycleTime > 0 ?
              <TrendingUp className="w-4 h-4 text-green-600" /> :
              <TrendingDown className="w-4 h-4 text-red-600" />}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {improvements ? formatPercentage(improvements.cycleTime) : '0%'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Target: 16% by Q2 2026</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Quality Improvement</span>
            {improvements && improvements.quality > 0 ?
              <TrendingUp className="w-4 h-4 text-green-600" /> :
              <AlertTriangle className="w-4 h-4 text-yellow-600" />}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {improvements ? `+${improvements.quality.toFixed(1)}%` : '0%'}
          </p>
          <p className="text-xs text-gray-500 mt-1">FPY Points Gained</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Overtime Reduction</span>
            {improvements && improvements.overtime > 0 ?
              <CheckCircle className="w-4 h-4 text-green-600" /> :
              <AlertTriangle className="w-4 h-4 text-yellow-600" />}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {improvements ? formatPercentage(improvements.overtime) : '0%'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Hours Saved</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Defect Reduction</span>
            {improvements && improvements.defects > 0 ?
              <TrendingUp className="w-4 h-4 text-green-600" /> :
              <TrendingDown className="w-4 h-4 text-red-600" />}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {improvements ? formatPercentage(improvements.defects) : '0%'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Defects Reduced</p>
        </div>
      </div>

      {/* Key Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost of Quality Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Cost of Quality Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="costOfQuality"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
                name="Cost of Quality ($)"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Projected savings: <strong>{formatCurrency(30000)}</strong> annually
            </p>
          </div>
        </div>

        {/* Production Efficiency */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Production Efficiency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="cycleTime" fill="#3b82f6" name="Cycle Time (hrs)" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="output"
                stroke="#10b981"
                strokeWidth={2}
                name="Daily Output"
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              Capacity increase potential: <strong>25%</strong>
            </p>
          </div>
        </div>

        {/* First Pass Yield Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">First Pass Yield Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis domain={[40, 70]} />
              <Tooltip formatter={(value: number) => formatPercentage(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="fpy"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
                name="FPY (%)"
              />
              <Area
                type="monotone"
                dataKey="fpy"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.1}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-600">Current</p>
              <p className="text-lg font-bold">49.4%</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-600">Target</p>
              <p className="text-lg font-bold">62%</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-600">Industry</p>
              <p className="text-lg font-bold">85%</p>
            </div>
          </div>
        </div>

        {/* Workforce Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Workforce Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="overtime" fill="#f59e0b" name="Overtime (hrs)" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="absenteeism"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Absenteeism (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-800">
              Labor cost savings: <strong>{formatCurrency(24000)}</strong> annually
            </p>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <p className="font-medium text-gray-900">Strong Momentum</p>
              <p className="text-sm text-gray-600">
                Overtime reduction on track to exceed Q4 target by 10%
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1" />
            <div>
              <p className="font-medium text-gray-900">Attention Required</p>
              <p className="text-sm text-gray-600">
                FPY improvement rate needs acceleration to meet Q2 2026 target
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <p className="font-medium text-gray-900">Opportunity</p>
              <p className="text-sm text-gray-600">
                Focus on tile defects could yield 40% of total quality gains
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}