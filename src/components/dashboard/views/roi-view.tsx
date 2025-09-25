'use client'

import { useState } from 'react'
import { useMetricsStore } from '@/stores/metrics-store'
import { useTenant } from '@/contexts/tenant-context'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
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
    { category: 'Quality Savings', value: roi.qualitySavings, color: '#10b981' },
    { category: 'Overtime Reduction', value: roi.overtimeSavings, color: '#3b82f6' },
    { category: 'Productivity Gains', value: roi.productivityGains, color: '#f59e0b' },
    { category: 'Absenteeism Savings', value: roi.absenteeismSavings, color: '#8b5cf6' },
  ] : []

  // Benchmark comparison data
  const benchmarkData = [
    {
      metric: 'First Pass Yield',
      sync: 49.4,
      industry: 85,
      worldClass: 95,
    },
    {
      metric: 'Cycle Time',
      sync: 45,
      industry: 32,
      worldClass: 24,
    },
    {
      metric: 'Defects/Pod',
      sync: 4.95,
      industry: 3.5,
      worldClass: 2,
    },
    {
      metric: 'Absenteeism',
      sync: 6.4,
      industry: 2.8,
      worldClass: 2.0,
    },
  ]

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
                  label={({ value }) => formatCurrency(value as number)}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roiBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
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
          <h3 className="text-lg font-semibold">Industry Benchmarking</h3>
          <Award className="w-5 h-5 text-yellow-600" />
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={benchmarkData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sync" fill="#ef4444" name="Sync Industries" />
            <Bar dataKey="industry" fill="#f59e0b" name="Industry Average" />
            <Bar dataKey="worldClass" fill="#10b981" name="World Class" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-red-900">Current Performance</p>
            <p className="text-xs text-red-700 mt-1">
              Significant improvement potential across all metrics
            </p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm font-medium text-yellow-900">Industry Average Gap</p>
            <p className="text-xs text-yellow-700 mt-1">
              35-50% behind industry standards
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-900">World Class Potential</p>
            <p className="text-xs text-green-700 mt-1">
              2-3x improvement possible with best practices
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}