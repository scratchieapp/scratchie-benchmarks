'use client'

import { useState } from 'react'
import { DashboardView } from './views/dashboard-view'
import { PerformanceView } from './views/performance-view'
import { TargetsView } from './views/targets-view'
import { ROIView } from './views/roi-view'
import { DataEntryView } from './views/data-entry-view'

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'performance', label: 'Performance' },
  { id: 'targets', label: 'Targets' },
  { id: 'roi', label: 'ROI & Benchmarking' },
  { id: 'data-entry', label: 'Data Entry' },
]

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Tab Navigation */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'performance' && <PerformanceView />}
        {activeTab === 'targets' && <TargetsView />}
        {activeTab === 'roi' && <ROIView />}
        {activeTab === 'data-entry' && <DataEntryView />}
      </div>
    </div>
  )
}