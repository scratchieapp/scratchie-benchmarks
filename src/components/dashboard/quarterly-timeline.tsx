'use client'

import { CheckCircle, Circle, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuarterData, PartialQuarterData } from '@/lib/calculations'

interface Quarter {
  id: string
  quarter: string
  label: string
  isBaseline: boolean
}

interface QuarterlyTimelineProps {
  quarters: Array<{
    quarter: Quarter
    actual: QuarterData | null
    target: PartialQuarterData | null
  }>
}

export function QuarterlyTimeline({ quarters }: QuarterlyTimelineProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Quarterly Progress Timeline</h3>
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200" style={{ zIndex: 0 }} />

        {/* Timeline items */}
        <div className="relative flex justify-between">
          {quarters.slice(0, 4).map((q, index) => {
            const isCompleted = q.actual !== null
            const isCurrent = index === 0 && q.quarter.isBaseline
            const isFuture = !isCompleted && !isCurrent

            return (
              <div key={q.quarter.id} className="flex flex-col items-center" style={{ zIndex: 1 }}>
                {/* Icon */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center bg-white border-2',
                    isCompleted && !isCurrent && 'border-green-500 bg-green-50',
                    isCurrent && 'border-yellow-500 bg-yellow-50',
                    isFuture && 'border-gray-300 bg-gray-50'
                  )}
                >
                  {isCompleted && !isCurrent && <CheckCircle className="w-6 h-6 text-green-500" />}
                  {isCurrent && <Circle className="w-6 h-6 text-yellow-500 fill-yellow-500" />}
                  {isFuture && <Target className="w-6 h-6 text-gray-400" />}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <p className="text-sm font-medium text-gray-900">{q.quarter.quarter}</p>
                  <p className="text-xs text-gray-500">{q.quarter.label}</p>
                  <p className={cn(
                    'text-xs font-medium mt-1',
                    isCompleted && 'text-green-600',
                    isCurrent && 'text-yellow-600',
                    isFuture && 'text-gray-400'
                  )}>
                    {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Target'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}