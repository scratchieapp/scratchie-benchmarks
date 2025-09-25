'use client'

import { useState } from 'react'
import { useMetricsStore } from '@/stores/metrics-store'
import { useTenant } from '@/contexts/tenant-context'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Calculator, Award, Edit2, Save, X } from 'lucide-react'
import { calculateROI, calculateScratchiePrice, calculatePaybackPeriod } from '@/lib/calculations'
import { formatCurrency, cn } from '@/lib/utils'

export function ROIView() {
  const { company } = useTenant()
  const { quarters } = useMetricsStore()
  const [activeUsers, setActiveUsers] = useState(108)
  const [turboRewards, setTurboRewards] = useState(20)
  const [editingAssumptions, setEditingAssumptions] = useState(false)
  const [tempAssumptions, setTempAssumptions] = useState({
    hourlyLaborRate: 35,
    overtimeMultiplier: 1.5,
    podProfitMargin: 500,
    annualWorkingDays: 250,
    productivityLossPerAbsence: 400,
    qualityIncidentCost: 1200,
  })

  if (!company || quarters.length === 0) {
    return <div>Loading...</div>
  }

  const baseline = quarters.find((q) => q.quarter.isBaseline)
  if (!baseline?.actual) return <div>No baseline data available</div>

  const lastQuarter = quarters[quarters.length - 1]
  const roi = lastQuarter?.target
    ? calculateROI(baseline.actual, lastQuarter.target, {
        overtimeRate: tempAssumptions.hourlyLaborRate * tempAssumptions.overtimeMultiplier,
        podMargin: tempAssumptions.podProfitMargin,
        workingDays: tempAssumptions.annualWorkingDays,
        absenteeismCost: tempAssumptions.productivityLossPerAbsence * tempAssumptions.annualWorkingDays,
      })
    : null

  const scratchiePrice = calculateScratchiePrice(activeUsers, turboRewards, baseline.actual.workforce.totalWorkers)
  const paybackPeriod = roi ? calculatePaybackPeriod(scratchiePrice.totalInvestment, roi.total / 12) : 0

  // ROI breakdown data
  const roiBreakdown = roi ? [
    { name: 'Quality Savings', category: 'Quality Savings', value: roi.qualitySavings, color: '#10b981' },
    { name: 'Overtime Reduction', category: 'Overtime Reduction', value: roi.overtimeSavings, color: '#3b82f6' },
    { name: 'Productivity Gains', category: 'Productivity Gains', value: roi.productivityGains, color: '#f59e0b' },
    { name: 'Absenteeism Savings', category: 'Absenteeism Savings', value: roi.absenteeismSavings, color: '#8b5cf6' },
  ] : []

  // Benchmark comparison data with improvement tracking
  const currentTarget = lastQuarter?.target

  // All metrics for the main chart (excluding defects which will be shown separately)
  const mainMetrics = [
    {
      metric: 'First Pass Yield (%)',
      baseline: 49.4,
      current: currentTarget?.quality?.percentComplete || 62,
      industry: 85,
      worldClass: 95,
      improvement: ((currentTarget?.quality?.percentComplete || 62) - 49.4).toFixed(1),
    },
    {
      metric: 'Cycle Time (hrs)',
      baseline: 45,
      current: currentTarget?.production?.avgTimePerPod || 42,
      industry: 32,
      worldClass: 24,
      improvement: (45 - (currentTarget?.production?.avgTimePerPod || 42)).toFixed(1),
    },
    {
      metric: 'Absenteeism (%)',
      baseline: 6.4,
      current: currentTarget?.workforce?.sickLeaveDays ? (currentTarget.workforce.sickLeaveDays / (baseline.actual.workforce.totalWorkers * 65)) * 100 : 5.2,
      industry: 2.8,
      worldClass: 2.0,
      improvement: (6.4 - (currentTarget?.workforce?.sickLeaveDays ? (currentTarget.workforce.sickLeaveDays / (baseline.actual.workforce.totalWorkers * 65)) * 100 : 5.2)).toFixed(1),
    },
  ]

  // Separate defects data for its own chart
  const defectsData = [
    {
      metric: 'Defects/Pod',
      baseline: 4.95,
      current: currentTarget ? (currentTarget.quality?.totalDefects || 0) / (currentTarget.quality?.podsInspected || 1) : 4.2,
      industry: 3.5,
      worldClass: 2,
      improvement: (4.95 - (currentTarget ? (currentTarget.quality?.totalDefects || 0) / (currentTarget.quality?.podsInspected || 1) : 4.2)).toFixed(2),
    },
  ]

  // Combined data for the improvement summary
  const benchmarkData = [...mainMetrics, ...defectsData]

  const handleSaveAssumptions = () => {
    setEditingAssumptions(false)
    // In a real app, this would update the company config
  }

  const handleCancelAssumptions = () => {
    setEditingAssumptions(false)
    setTempAssumptions({
      hourlyLaborRate: 35,
      overtimeMultiplier: 1.5,
      podProfitMargin: 500,
      annualWorkingDays: 250,
      productivityLossPerAbsence: 400,
      qualityIncidentCost: 1200,
    })
  }

  return (
    <div className="space-y-6">
      {/* ROI Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Return on Investment</h2>
            <p className="text-gray-600 mt-1">Projected savings and Scratchie investment analysis</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Annual ROI</p>
            <p className="text-3xl font-bold text-green-600">
              {roi ? formatCurrency(roi.total) : '$0'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {paybackPeriod > 0 ? `${paybackPeriod.toFixed(1)} month payback` : 'Immediate'}
            </p>
          </div>
        </div>

        {/* ROI Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Savings Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roiBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roiBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend formatter={(value) => value} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-4">Annual Savings Detail</h3>
            {roiBreakdown.map((item) => (
              <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total Annual Savings</span>
                <span className="text-lg font-bold text-green-600">
                  {roi ? formatCurrency(roi.total) : '$0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scratchie Pricing Calculator */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Scratchie Investment Calculator</h3>
          <Calculator className="w-5 h-5 text-blue-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Active Users Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Active Users</label>
                <span className="text-sm font-semibold text-blue-600">{activeUsers}</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                value={activeUsers}
                onChange={(e) => setActiveUsers(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50</span>
                <span>500</span>
              </div>
            </div>

            {/* Turbo Rewards Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Turbo Rewards per Worker</label>
                <span className="text-sm font-semibold text-blue-600">${turboRewards}/month</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={turboRewards}
                onChange={(e) => setTurboRewards(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$0</span>
                <span>$100</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Investment Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Cost</span>
                  <span className="font-medium">{formatCurrency(scratchiePrice.platformCost)}/year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Turbo Rewards</span>
                  <span className="font-medium">{formatCurrency(scratchiePrice.turboRewards)}/year</span>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total Investment</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(scratchiePrice.totalInvestment)}/year
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Monthly Investment</span>
                    <span className="font-medium">
                      {formatCurrency(scratchiePrice.monthlyInvestment)}/month
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-lg",
              paybackPeriod < 6 ? "bg-green-50" : paybackPeriod < 12 ? "bg-yellow-50" : "bg-red-50"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Payback Period</span>
                <span className={cn(
                  "text-lg font-bold",
                  paybackPeriod < 6 ? "text-green-600" : paybackPeriod < 12 ? "text-yellow-600" : "text-red-600"
                )}>
                  {paybackPeriod > 0 ? `${paybackPeriod.toFixed(1)} months` : 'Immediate'}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {paybackPeriod < 6 ? "Excellent ROI" :
                 paybackPeriod < 12 ? "Good ROI" :
                 "Consider optimizing targets"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Assumptions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">ROI Assumptions</h3>
          {!editingAssumptions ? (
            <button
              onClick={() => setEditingAssumptions(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAssumptions}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancelAssumptions}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(tempAssumptions).map(([key, value]) => (
            <div key={key}>
              <label className="text-sm text-gray-600">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
              {editingAssumptions ? (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setTempAssumptions({
                    ...tempAssumptions,
                    [key]: parseFloat(e.target.value)
                  })}
                  className="w-full px-3 py-1.5 mt-1 border rounded-md text-sm"
                />
              ) : (
                <p className="font-medium text-gray-900 mt-1">
                  {key.includes('Rate') || key.includes('Cost') || key.includes('Margin') ? '$' : ''}
                  {value}
                  {key.includes('Multiplier') ? 'x' : ''}
                  {key.includes('Days') ? ' days' : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Industry Benchmarking</h3>
            <p className="text-sm text-gray-600 mt-1">Baseline Q3 2024 vs Current Performance</p>
          </div>
          <Award className="w-5 h-5 text-yellow-600" />
        </div>

        {/* Baseline Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Baseline FPY</p>
            <p className="text-xl font-bold text-red-600">49.4%</p>
            <p className="text-xs text-gray-500">Q3 2024</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Current Target</p>
            <p className="text-xl font-bold text-yellow-600">62%</p>
            <p className="text-xs text-green-600">+12.6% improvement</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Industry Average</p>
            <p className="text-xl font-bold text-blue-600">85%</p>
            <p className="text-xs text-gray-500">35.6% gap</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">World Class</p>
            <p className="text-xl font-bold text-green-600">95%</p>
            <p className="text-xs text-gray-500">45.6% potential</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main metrics chart (FPY, Cycle Time, Absenteeism) */}
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={mainMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" angle={-20} textAnchor="end" height={80} />
                <YAxis label={{ value: 'Percentage / Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="baseline" fill="#ef4444" name="Baseline (Q3 2024)" />
                <Bar dataKey="current" fill="#f59e0b" name="Current Target" />
                <Bar dataKey="industry" fill="#3b82f6" name="Industry Average" />
                <Bar dataKey="worldClass" fill="#10b981" name="World Class" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Separate Defects chart */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Defects per Pod</h4>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={defectsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" hide />
                <YAxis label={{ value: 'Defects/Pod', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="baseline" fill="#ef4444" name="Baseline" />
                <Bar dataKey="current" fill="#f59e0b" name="Current" />
                <Bar dataKey="industry" fill="#3b82f6" name="Industry" />
                <Bar dataKey="worldClass" fill="#10b981" name="World Class" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-600">
                Current: <span className="font-semibold">{defectsData[0].current.toFixed(2)}</span>
              </p>
              <p className="text-xs text-green-600 font-semibold">
                {defectsData[0].improvement} improvement
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Improvement Summary from Baseline</h4>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {benchmarkData.map((item) => (
              <div key={item.metric} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600">{item.metric}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-500">{item.baseline}</span>
                  <span className="text-xs text-gray-400">→</span>
                  <span className="text-sm font-medium text-gray-900">{typeof item.current === 'number' ? item.current.toFixed(1) : item.current}</span>
                </div>
                <p className="text-xs font-semibold text-green-600 mt-1">
                  {parseFloat(item.improvement) > 0 ? '+' : ''}{item.improvement} {item.metric.includes('%') ? 'pts' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}