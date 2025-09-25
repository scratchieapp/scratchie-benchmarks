'use client'

import { useState, useRef } from 'react'
import { useMetricsStore } from '@/stores/metrics-store'
import { useTenant } from '@/contexts/tenant-context'
import { Save, Upload, AlertCircle, CheckCircle, Calendar, FileText } from 'lucide-react'
import { QuarterData } from '@/lib/calculations'
import { cn } from '@/lib/utils'

type PartialFormData = {
  production?: Partial<QuarterData['production']>
  quality?: Partial<QuarterData['quality']>
  workforce?: Partial<QuarterData['workforce']>
}

export function DataEntryView() {
  const { company } = useTenant()
  const { quarters, updateActualMetrics } = useMetricsStore()
  const [selectedQuarter, setSelectedQuarter] = useState<string>('')
  const [formData, setFormData] = useState<PartialFormData>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!company || quarters.length === 0) {
    return <div>Loading...</div>
  }

  const availableQuarters = quarters.filter(q => !q.quarter.isBaseline)

  const handleQuarterSelect = (quarterId: string) => {
    setSelectedQuarter(quarterId)
    setSaveStatus('idle')
    setValidationErrors([])

    // Load any existing data (actual or target)
    const quarter = quarters.find(q => q.quarter.id === quarterId)
    if (quarter?.actual) {
      setFormData(quarter.actual)
    } else if (quarter?.target) {
      // Pre-fill with target data if no actual data exists
      setFormData(quarter.target)
    } else {
      setFormData({})
    }
  }

  const validateForm = (): boolean => {
    const errors: string[] = []

    // Basic validation
    if (!formData.production?.avgTimePerPod) errors.push('Cycle time is required')
    if (!formData.production?.dailyPodOutput) errors.push('Daily output is required')
    if (!formData.quality?.totalDefects) errors.push('Total defects is required')
    if (!formData.quality?.costOfQuality) errors.push('Cost of quality is required')

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',')
      const values = lines[1]?.split(',') || []

      // Parse CSV values into form data
      const importedData: PartialFormData = {
        production: {
          avgTimePerPod: parseFloat(values[headers.indexOf('Cycle Time (hours)')]) || undefined,
          dailyPodOutput: parseFloat(values[headers.indexOf('Daily Pod Output')]) || undefined,
          overtimeHours: parseFloat(values[headers.indexOf('Overtime Hours')]) || undefined,
          downtimeTarget: parseFloat(values[headers.indexOf('Downtime Target')]) || undefined,
          downtimeActual: parseFloat(values[headers.indexOf('Downtime Actual')]) || undefined,
        },
        quality: {
          costOfQuality: parseFloat(values[headers.indexOf('Cost of Quality ($)')]) || undefined,
          totalDefects: parseFloat(values[headers.indexOf('Total Defects')]) || undefined,
          percentComplete: parseFloat(values[headers.indexOf('First Pass Yield (%)')]) || undefined,
          podsInspected: parseFloat(values[headers.indexOf('Pods Inspected')]) || undefined,
          wrappedPods: parseFloat(values[headers.indexOf('Wrapped Pods')]) || undefined,
        },
        workforce: {
          fullTimeStaff: parseFloat(values[headers.indexOf('Full-Time Staff')]) || undefined,
          sickLeaveDays: parseFloat(values[headers.indexOf('Sick Leave Days')]) || undefined,
          totalWorkers: parseFloat(values[headers.indexOf('Total Workers')]) || undefined,
          supervisors: parseFloat(values[headers.indexOf('Supervisors')]) || undefined,
        },
      }

      setFormData(importedData)
      setSaveStatus('idle')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const headers = [
      'Cycle Time (hours)',
      'Daily Pod Output',
      'Overtime Hours',
      'Downtime Target',
      'Downtime Actual',
      'Cost of Quality ($)',
      'Total Defects',
      'First Pass Yield (%)',
      'Pods Inspected',
      'Wrapped Pods',
      'Full-Time Staff',
      'Sick Leave Days',
      'Total Workers',
      'Supervisors'
    ]

    const sampleData = [
      '45', // Cycle Time
      '19', // Daily Pod Output
      '55', // Overtime Hours
      '10', // Downtime Target
      '40', // Downtime Actual
      '5000', // Cost of Quality
      '9500', // Total Defects
      '49.4', // First Pass Yield
      '2200', // Pods Inspected
      '1087', // Wrapped Pods
      '64', // Full-Time Staff
      '265', // Sick Leave Days
      '108', // Total Workers
      '7' // Supervisors
    ]

    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'scratchie_metrics_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSave = async () => {
    if (!validateForm() || !selectedQuarter) return

    setSaveStatus('saving')

    // Simulate save delay
    setTimeout(() => {
      // Create complete QuarterData object with defaults
      const completeData: QuarterData = {
        production: {
          avgTimePerPod: formData.production?.avgTimePerPod || 0,
          dailyPodOutput: formData.production?.dailyPodOutput || 0,
          peoplePerOutput: formData.production?.peoplePerOutput || 5,
          laborHoursPerPod: formData.production?.laborHoursPerPod || 45,
          downtimeTarget: formData.production?.downtimeTarget || 10,
          downtimeActual: formData.production?.downtimeActual || 40,
          overtimeHours: formData.production?.overtimeHours || 0,
        },
        quality: {
          costOfQuality: formData.quality?.costOfQuality || 0,
          wallTileDefects: formData.quality?.wallTileDefects || 0,
          floorTileDefects: formData.quality?.floorTileDefects || 0,
          villaboardDefects: formData.quality?.villaboardDefects || 0,
          framingDefects: formData.quality?.framingDefects || 0,
          fitOffDefects: formData.quality?.fitOffDefects || 0,
          membraneDefects: formData.quality?.membraneDefects || 0,
          plumbingDefects: formData.quality?.plumbingDefects || 0,
          electricalDefects: formData.quality?.electricalDefects || 0,
          totalDefects: formData.quality?.totalDefects || 0,
          podsInspected: formData.quality?.podsInspected || 0,
          wrappedPods: formData.quality?.wrappedPods || 0,
          percentComplete: formData.quality?.percentComplete || 0,
        },
        workforce: {
          fullTimeStaff: formData.workforce?.fullTimeStaff || 64,
          sickLeaveDays: formData.workforce?.sickLeaveDays || 0,
          annualLeaveDays: formData.workforce?.annualLeaveDays || 0,
          supervisors: formData.workforce?.supervisors || 7,
          totalWorkers: formData.workforce?.totalWorkers || 108,
          peoplePerPod: formData.workforce?.peoplePerPod || 6,
          plumbersPerPod: formData.workforce?.plumbersPerPod || 1,
          electriciansPerPod: formData.workforce?.electriciansPerPod || 0.3,
        },
      }

      updateActualMetrics(selectedQuarter, completeData)
      setSaveStatus('saved')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Data Entry</h2>
            <p className="text-gray-600 mt-1">Enter quarterly performance metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
            </>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border"
            >
              <FileText className="w-4 h-4" />
              Download Template
            </button>
          </div>
        </div>

        {/* Quarter Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Quarter</label>
          <select
            value={selectedQuarter}
            onChange={(e) => handleQuarterSelect(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a quarter...</option>
            {availableQuarters.map(q => (
              <option key={q.quarter.id} value={q.quarter.id}>
                {q.quarter.quarter} - {q.quarter.label}
              </option>
            ))}
          </select>
        </div>

        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div className={cn(
            "mt-4 p-3 rounded-lg flex items-center gap-2",
            saveStatus === 'saved' && "bg-green-50 text-green-800",
            saveStatus === 'saving' && "bg-blue-50 text-blue-800",
            saveStatus === 'error' && "bg-red-50 text-red-800"
          )}>
            {saveStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
            {saveStatus === 'saving' && <Calendar className="w-4 h-4 animate-spin" />}
            {saveStatus === 'error' && <AlertCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {saveStatus === 'saved' && "Data saved successfully"}
              {saveStatus === 'saving' && "Saving..."}
              {saveStatus === 'error' && "Error saving data"}
            </span>
          </div>
        )}
      </div>

      {selectedQuarter && (
        <>
          {/* Production Metrics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Production Metrics</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average Time per Pod (hours) *
                </label>
                <input
                  type="number"
                  value={formData.production?.avgTimePerPod || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    production: {
                      ...formData.production,
                      avgTimePerPod: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 42"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Pod Output *
                </label>
                <input
                  type="number"
                  value={formData.production?.dailyPodOutput || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    production: {
                      ...formData.production,
                      dailyPodOutput: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 19"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime Hours
                </label>
                <input
                  type="number"
                  value={formData.production?.overtimeHours || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    production: {
                      ...formData.production,
                      overtimeHours: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 55"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Downtime Target (hours)
                </label>
                <input
                  type="number"
                  value={formData.production?.downtimeTarget || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    production: {
                      ...formData.production,
                      downtimeTarget: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Downtime Actual (hours)
                </label>
                <input
                  type="number"
                  value={formData.production?.downtimeActual || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    production: {
                      ...formData.production,
                      downtimeActual: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 35"
                />
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quality Metrics</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost of Quality ($) *
                </label>
                <input
                  type="number"
                  value={formData.quality?.costOfQuality || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    quality: {
                      ...formData.quality,
                      costOfQuality: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Defects *
                </label>
                <input
                  type="number"
                  value={formData.quality?.totalDefects || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    quality: {
                      ...formData.quality,
                      totalDefects: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 9500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Pass Yield (%)
                </label>
                <input
                  type="number"
                  value={formData.quality?.percentComplete || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    quality: {
                      ...formData.quality,
                      percentComplete: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 54"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pods Inspected
                </label>
                <input
                  type="number"
                  value={formData.quality?.podsInspected || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    quality: {
                      ...formData.quality,
                      podsInspected: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wrapped Pods
                </label>
                <input
                  type="number"
                  value={formData.quality?.wrappedPods || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    quality: {
                      ...formData.quality,
                      wrappedPods: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1100"
                />
              </div>
            </div>

            {/* Defect Breakdown */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Defect Breakdown</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {['Wall Tiles', 'Floor Tiles', 'Villaboard', 'Framing', 'Fit Off', 'Membrane', 'Plumbing', 'Electrical'].map((defectType) => {
                  const key = `${defectType.toLowerCase().replace(' ', '')}Defects` as keyof typeof formData.quality
                  return (
                    <div key={defectType}>
                      <label className="block text-xs text-gray-600 mb-1">{defectType}</label>
                      <input
                        type="number"
                        value={formData.quality?.[key] || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          quality: {
                            ...formData.quality,
                            [key]: parseFloat(e.target.value)
                          }                        })}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="0"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Workforce Metrics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Workforce Metrics</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full-Time Staff
                </label>
                <input
                  type="number"
                  value={formData.workforce?.fullTimeStaff || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    workforce: {
                      ...formData.workforce,
                      fullTimeStaff: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 64"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sick Leave Days
                </label>
                <input
                  type="number"
                  value={formData.workforce?.sickLeaveDays || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    workforce: {
                      ...formData.workforce,
                      sickLeaveDays: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 250"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Workers
                </label>
                <input
                  type="number"
                  value={formData.workforce?.totalWorkers || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    workforce: {
                      ...formData.workforce,
                      totalWorkers: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 108"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supervisors
                </label>
                <input
                  type="number"
                  value={formData.workforce?.supervisors || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    workforce: {
                      ...formData.workforce,
                      supervisors: parseFloat(e.target.value)
                    }                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 7"
                />
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-900">Please fix the following errors:</h4>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setSelectedQuarter('')
                setFormData({})
                setValidationErrors([])
                setSaveStatus('idle')
              }}
              className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save Data
            </button>
          </div>
        </>
      )}
    </div>
  )
}