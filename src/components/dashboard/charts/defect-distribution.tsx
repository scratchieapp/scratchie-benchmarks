'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { QuarterData } from '@/lib/calculations'

interface DefectDistributionProps {
  baseline: QuarterData
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function DefectDistribution({ baseline }: DefectDistributionProps) {
  const data = [
    {
      name: 'Wall Tiles',
      value: baseline.quality.wallTileDefects,
      percentage: ((baseline.quality.wallTileDefects / baseline.quality.totalDefects) * 100).toFixed(1),
    },
    {
      name: 'Floor Tiles',
      value: baseline.quality.floorTileDefects,
      percentage: ((baseline.quality.floorTileDefects / baseline.quality.totalDefects) * 100).toFixed(1),
    },
    {
      name: 'Villaboard',
      value: baseline.quality.villaboardDefects,
      percentage: ((baseline.quality.villaboardDefects / baseline.quality.totalDefects) * 100).toFixed(1),
    },
    {
      name: 'Framing',
      value: baseline.quality.framingDefects,
      percentage: ((baseline.quality.framingDefects / baseline.quality.totalDefects) * 100).toFixed(1),
    },
    {
      name: 'Other',
      value:
        baseline.quality.fitOffDefects +
        baseline.quality.membraneDefects +
        baseline.quality.plumbingDefects +
        baseline.quality.electricalDefects,
      percentage: (
        ((baseline.quality.fitOffDefects +
          baseline.quality.membraneDefects +
          baseline.quality.plumbingDefects +
          baseline.quality.electricalDefects) /
          baseline.quality.totalDefects) *
        100
      ).toFixed(1),
    },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">Count: {payload[0].value}</p>
          <p className="text-sm">Percentage: {payload[0].payload.percentage}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Defect Distribution</h3>
      <div className="flex items-center justify-between">
        <ResponsiveContainer width="60%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1">
          <div className="space-y-2">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {baseline.quality.totalDefects.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Defects</p>
            </div>
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="flex-1">{item.name}</span>
                <span className="font-medium">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}