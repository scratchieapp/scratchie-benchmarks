'use client'

import { useMetricsStore } from '@/stores/metrics-store'
import { useTenant } from '@/contexts/tenant-context'
import { calculateScratchieIndex, getScratchieIndexColor, getScratchieIndexLabel } from '@/lib/calculations'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { TrendingUp, TrendingDown, Target, Users, Award, BarChart3, LogOut } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export function SimpleDashboard() {
  const { company } = useTenant()
  const { quarters } = useMetricsStore()

  if (!company || quarters.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const baseline = quarters.find(q => q.quarter.isBaseline)
  if (!baseline?.actual) return <div>No baseline data available</div>

  const scratchieIndex = calculateScratchieIndex(baseline.actual, company.config.calculations.scratchieIndexWeights)

  // Get current quarter data (Q4 2024 or latest)
  const currentQuarter = quarters[1]?.target || baseline.actual

  // Calculate key improvements
  const improvements = {
    fpy: (currentQuarter?.quality?.percentComplete || 49.4) - 49.4,
    cycleTime: 45 - (currentQuarter?.production?.avgTimePerPod || 45),
    defects: ((baseline.actual.quality.totalDefects - (currentQuarter?.quality?.totalDefects || baseline.actual.quality.totalDefects)) / baseline.actual.quality.totalDefects * 100),
    output: ((currentQuarter?.production?.dailyPodOutput || 19) - 19) / 19 * 100,
  }

  // Prepare trend data for simple chart
  const trendData = quarters.slice(0, 4).map(q => ({
    quarter: q.quarter.quarter,
    fpy: q.actual?.quality?.percentComplete || q.target?.quality?.percentComplete || 0,
    target: q.target?.quality?.percentComplete || 0,
  }))

  const handleLogout = () => {
    localStorage.removeItem('scratchie_auth')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/logos/scratchie-logo-black.svg"
                alt="Scratchie"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
              <div className="border-l pl-4">
                <h1 className="text-xl font-bold text-gray-900">Sync Industries</h1>
                <p className="text-sm text-gray-600">Simple Performance Dashboard</p>
              </div>
            </div>

            {/* Scratchie Index */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">Scratchie Index</p>
                <div className={cn('rounded-lg px-6 py-3', getScratchieIndexColor(scratchieIndex))}>
                  <p className="text-3xl font-bold">{scratchieIndex}</p>
                  <p className="text-xs font-medium mt-1">{getScratchieIndexLabel(scratchieIndex)}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* First Pass Yield */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">First Pass Yield</p>
              {improvements.fpy > 0 ?
                <TrendingUp className="w-4 h-4 text-green-600" /> :
                <TrendingDown className="w-4 h-4 text-red-600" />
              }
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(currentQuarter?.quality?.percentComplete || 49.4).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Baseline: 49.4%</p>
            {improvements.fpy !== 0 && (
              <p className={cn(
                "text-xs font-semibold mt-1",
                improvements.fpy > 0 ? "text-green-600" : "text-red-600"
              )}>
                {improvements.fpy > 0 ? '+' : ''}{improvements.fpy.toFixed(1)}% from baseline
              </p>
            )}
          </div>

          {/* Cycle Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Cycle Time</p>
              {improvements.cycleTime > 0 ?
                <TrendingUp className="w-4 h-4 text-green-600" /> :
                <TrendingDown className="w-4 h-4 text-red-600" />
              }
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(currentQuarter?.production?.avgTimePerPod || 45).toFixed(0)} hrs
            </p>
            <p className="text-xs text-gray-500 mt-1">Baseline: 45 hrs</p>
            {improvements.cycleTime !== 0 && (
              <p className={cn(
                "text-xs font-semibold mt-1",
                improvements.cycleTime > 0 ? "text-green-600" : "text-red-600"
              )}>
                {improvements.cycleTime > 0 ? '-' : '+'}{Math.abs(improvements.cycleTime).toFixed(0)} hrs from baseline
              </p>
            )}
          </div>

          {/* Daily Output */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Daily Output</p>
              {improvements.output > 0 ?
                <TrendingUp className="w-4 h-4 text-green-600" /> :
                <BarChart3 className="w-4 h-4 text-gray-400" />
              }
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(currentQuarter?.production?.dailyPodOutput || 19).toFixed(0)} pods
            </p>
            <p className="text-xs text-gray-500 mt-1">Baseline: 19 pods</p>
            {improvements.output !== 0 && (
              <p className={cn(
                "text-xs font-semibold mt-1",
                improvements.output > 0 ? "text-green-600" : "text-red-600"
              )}>
                {improvements.output > 0 ? '+' : ''}{improvements.output.toFixed(0)}% from baseline
              </p>
            )}
          </div>

          {/* Defect Reduction */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Defect Reduction</p>
              {improvements.defects > 0 ?
                <Award className="w-4 h-4 text-green-600" /> :
                <Target className="w-4 h-4 text-gray-400" />
              }
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {improvements.defects.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">From baseline</p>
            <p className="text-xs font-semibold text-blue-600 mt-1">
              Target: 25% reduction
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FPY Trend */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">First Pass Yield Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis domain={[40, 70]} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Line
                  type="monotone"
                  dataKey="fpy"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#10b981"
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981' }}
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Q4 2024 Target</span>
                </div>
                <span className="text-sm font-bold text-gray-900">62% FPY</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Workforce</span>
                </div>
                <span className="text-sm font-bold text-gray-900">108 Workers</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Improvement Rate</span>
                </div>
                <span className="text-sm font-bold text-gray-900">3.2% per quarter</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Industry Gap</span>
                </div>
                <span className="text-sm font-bold text-blue-600">35.6% to close</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2025 Scratchie. Manufacturing Quality Dashboard - Simple View</p>
        </div>
      </div>
    </div>
  )
}