'use client'

import { useState } from 'react'
import { useMetricsStore } from '@/stores/metrics-store'
import { useTenant } from '@/contexts/tenant-context'
import { Target, Edit2, Save, X, Copy, CheckCircle } from 'lucide-react'
import { formatPercentage, cn } from '@/lib/utils'
import type { PartialQuarterData } from '@/lib/calculations'

export function TargetsView() {
  const { company } = useTenant()
  const { quarters, updateTargetMetrics } = useMetricsStore()
  const [editingQuarter, setEditingQuarter] = useState<string | null>(null)
  const [tempTargets, setTempTargets] = useState<PartialQuarterData>({})

  if (!company || quarters.length === 0) {
    return <div>Loading...</div>
  }

  const baseline = quarters.find((q) => q.quarter.isBaseline)
  if (!baseline?.actual) return <div>No baseline data available</div>

  const handleEdit = (quarterId: string, currentTarget: PartialQuarterData | null) => {
    setEditingQuarter(quarterId)
    setTempTargets(currentTarget || {})
  }

  const handleSave = (quarterId: string) => {
    updateTargetMetrics(quarterId, tempTargets)
    setEditingQuarter(null)
    setTempTargets({})
  }

  const handleCancel = () => {
    setEditingQuarter(null)
    setTempTargets({})
  }

  const handleCopyFromPrevious = (quarterId: string, previousTarget: PartialQuarterData) => {
    setTempTargets(previousTarget)
  }

  const calculateImprovement = (baseline: number, target: number, isLowerBetter: boolean = false) => {
    if (isLowerBetter) {
      return ((baseline - target) / baseline) * 100
    }
    return ((target - baseline) / baseline) * 100
  }

  // Future quarters (excluding baseline)
  const targetQuarters = quarters.filter(q => !q.quarter.isBaseline)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Target Management</h2>
            <p className="text-gray-600 mt-1">Set and track quarterly improvement targets</p>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              {targetQuarters.length} quarters planned
            </span>
          </div>
        </div>

        {/* Baseline Reference */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Baseline Metrics (Q3 2025)</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">FPY:</span>
              <span className="ml-2 font-medium">49.4%</span>
            </div>
            <div>
              <span className="text-gray-600">Cycle Time:</span>
              <span className="ml-2 font-medium">45 hrs</span>
            </div>
            <div>
              <span className="text-gray-600">CoQ:</span>
              <span className="ml-2 font-medium">$5,500</span>
            </div>
            <div>
              <span className="text-gray-600">Overtime:</span>
              <span className="ml-2 font-medium">64 hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quarterly Target Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {targetQuarters.map((quarter, index) => {
          const isEditing = editingQuarter === quarter.quarter.id
          const targets = isEditing ? tempTargets : quarter.target
          const previousQuarter = index > 0 ? targetQuarters[index - 1] : null

          return (
            <div key={quarter.quarter.id} className="bg-white rounded-xl shadow-lg p-6">
              {/* Quarter Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{quarter.quarter.quarter}</h3>
                  <p className="text-sm text-gray-600">{quarter.quarter.label}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      {previousQuarter && (
                        <button
                          onClick={() => handleCopyFromPrevious(quarter.quarter.id, previousQuarter.target || {})}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="Copy from previous quarter"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(quarter.quarter.id, quarter.target)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSave(quarter.quarter.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Target Metrics */}
              <div className="space-y-4">
                {/* Production Targets */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Production</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Cycle Time (hrs)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempTargets.production?.avgTimePerPod || ''}
                          onChange={(e) => setTempTargets({
                            ...tempTargets,
                            production: {
                              ...tempTargets.production,
                              avgTimePerPod: parseFloat(e.target.value)
                            }
                          })}
                          className="w-full px-2 py-1 border rounded-md text-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{targets?.production?.avgTimePerPod || '-'}</span>
                          {targets?.production?.avgTimePerPod && (
                            <span className={cn(
                              "text-xs",
                              calculateImprovement(45, targets.production.avgTimePerPod, true) > 0
                                ? "text-green-600" : "text-gray-500"
                            )}>
                              ({formatPercentage(calculateImprovement(45, targets.production.avgTimePerPod, true))} ↓)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Daily Output</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempTargets.production?.dailyPodOutput || ''}
                          onChange={(e) => setTempTargets({
                            ...tempTargets,
                            production: {
                              ...tempTargets.production,
                              dailyPodOutput: parseFloat(e.target.value)
                            }
                          })}
                          className="w-full px-2 py-1 border rounded-md text-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{targets?.production?.dailyPodOutput || '-'}</span>
                          {targets?.production?.dailyPodOutput && (
                            <span className={cn(
                              "text-xs",
                              calculateImprovement(18, targets.production.dailyPodOutput) > 0
                                ? "text-green-600" : "text-gray-500"
                            )}>
                              (+{calculateImprovement(18, targets.production.dailyPodOutput).toFixed(0)}%)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Overtime (hrs)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempTargets.production?.overtimeHours || ''}
                          onChange={(e) => setTempTargets({
                            ...tempTargets,
                            production: {
                              ...tempTargets.production,
                              overtimeHours: parseFloat(e.target.value)
                            }
                          })}
                          className="w-full px-2 py-1 border rounded-md text-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{targets?.production?.overtimeHours || '-'}</span>
                          {targets?.production?.overtimeHours && (
                            <span className={cn(
                              "text-xs",
                              calculateImprovement(64, targets.production.overtimeHours, true) > 0
                                ? "text-green-600" : "text-gray-500"
                            )}>
                              ({formatPercentage(calculateImprovement(64, targets.production.overtimeHours, true))} ↓)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quality Targets */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Quality</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">FPY (%)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempTargets.quality?.percentComplete || ''}
                          onChange={(e) => setTempTargets({
                            ...tempTargets,
                            quality: {
                              ...tempTargets.quality,
                              percentComplete: parseFloat(e.target.value)
                            }
                          })}
                          className="w-full px-2 py-1 border rounded-md text-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{targets?.quality?.percentComplete || '-'}%</span>
                          {targets?.quality?.percentComplete && (
                            <span className="text-xs text-green-600">
                              (+{(targets.quality.percentComplete - 49.4).toFixed(1)} pts)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">CoQ ($)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempTargets.quality?.costOfQuality || ''}
                          onChange={(e) => setTempTargets({
                            ...tempTargets,
                            quality: {
                              ...tempTargets.quality,
                              costOfQuality: parseFloat(e.target.value)
                            }
                          })}
                          className="w-full px-2 py-1 border rounded-md text-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${targets?.quality?.costOfQuality || '-'}</span>
                          {targets?.quality?.costOfQuality && (
                            <span className={cn(
                              "text-xs",
                              calculateImprovement(5500, targets.quality.costOfQuality, true) > 0
                                ? "text-green-600" : "text-gray-500"
                            )}>
                              ({formatPercentage(calculateImprovement(5500, targets.quality.costOfQuality, true))} ↓)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Total Defects</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempTargets.quality?.totalDefects || ''}
                          onChange={(e) => setTempTargets({
                            ...tempTargets,
                            quality: {
                              ...tempTargets.quality,
                              totalDefects: parseFloat(e.target.value)
                            }
                          })}
                          className="w-full px-2 py-1 border rounded-md text-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{targets?.quality?.totalDefects || '-'}</span>
                          {targets?.quality?.totalDefects && (
                            <span className={cn(
                              "text-xs",
                              calculateImprovement(10461, targets.quality.totalDefects, true) > 0
                                ? "text-green-600" : "text-gray-500"
                            )}>
                              ({formatPercentage(calculateImprovement(10461, targets.quality.totalDefects, true))} ↓)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Workforce Targets */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Workforce</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Sick Leave Days</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempTargets.workforce?.sickLeaveDays || ''}
                          onChange={(e) => setTempTargets({
                            ...tempTargets,
                            workforce: {
                              ...tempTargets.workforce,
                              sickLeaveDays: parseFloat(e.target.value)
                            }
                          })}
                          className="w-full px-2 py-1 border rounded-md text-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{targets?.workforce?.sickLeaveDays || '-'}</span>
                          {targets?.workforce?.sickLeaveDays && (
                            <span className={cn(
                              "text-xs",
                              calculateImprovement(263, targets.workforce.sickLeaveDays, true) > 0
                                ? "text-green-600" : "text-gray-500"
                            )}>
                              ({formatPercentage(calculateImprovement(263, targets.workforce.sickLeaveDays, true))} ↓)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Achievement Status */}
                {!isEditing && quarter.actual && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Achievement Status</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">On Track</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Target Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Target Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Metric</th>
                <th className="text-center py-2">Baseline</th>
                {targetQuarters.map(q => (
                  <th key={q.quarter.id} className="text-center py-2">{q.quarter.quarter}</th>
                ))}
                <th className="text-center py-2">Total Improvement</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">FPY (%)</td>
                <td className="text-center">49.4</td>
                {targetQuarters.map(q => (
                  <td key={q.quarter.id} className="text-center">
                    {q.target?.quality?.percentComplete || '-'}
                  </td>
                ))}
                <td className="text-center font-medium text-green-600">
                  +{((targetQuarters[targetQuarters.length - 1]?.target?.quality?.percentComplete || 49.4) - 49.4).toFixed(1)} pts
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Cycle Time (hrs)</td>
                <td className="text-center">45</td>
                {targetQuarters.map(q => (
                  <td key={q.quarter.id} className="text-center">
                    {q.target?.production?.avgTimePerPod || '-'}
                  </td>
                ))}
                <td className="text-center font-medium text-green-600">
                  -{(45 - (targetQuarters[targetQuarters.length - 1]?.target?.production?.avgTimePerPod || 45)).toFixed(0)} hrs
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2">CoQ ($)</td>
                <td className="text-center">5,500</td>
                {targetQuarters.map(q => (
                  <td key={q.quarter.id} className="text-center">
                    {q.target?.quality?.costOfQuality || '-'}
                  </td>
                ))}
                <td className="text-center font-medium text-green-600">
                  -${(5500 - (targetQuarters[targetQuarters.length - 1]?.target?.quality?.costOfQuality || 5500)).toFixed(0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}