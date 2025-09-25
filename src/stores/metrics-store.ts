import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Quarter } from '@/types'
import { QuarterData } from '@/lib/calculations'
import { syncQuartersData } from '@/config/sync-industries'

interface QuarterWithData {
  quarter: Quarter
  actual: QuarterData | null
  target: Partial<QuarterData> | null
}

interface MetricsStore {
  quarters: QuarterWithData[]
  selectedQuarterId: string | null

  // Actions
  setQuarters: (quarters: QuarterWithData[]) => void
  updateActualMetrics: (quarterId: string, data: QuarterData) => void
  updateTargetMetrics: (quarterId: string, data: Partial<QuarterData>) => void
  setSelectedQuarter: (quarterId: string) => void
  loadDefaultData: () => void
}

export const useMetricsStore = create<MetricsStore>()(
  persist(
    (set) => ({
      quarters: [],
      selectedQuarterId: null,

      setQuarters: (quarters) => set({ quarters }),

      updateActualMetrics: (quarterId, data) =>
        set((state) => ({
          quarters: state.quarters.map((q) =>
            q.quarter.id === quarterId ? { ...q, actual: data } : q
          ),
        })),

      updateTargetMetrics: (quarterId, data) =>
        set((state) => ({
          quarters: state.quarters.map((q) =>
            q.quarter.id === quarterId ? { ...q, target: data } : q
          ),
        })),

      setSelectedQuarter: (quarterId) => set({ selectedQuarterId: quarterId }),

      loadDefaultData: () => set({ quarters: syncQuartersData }),
    }),
    {
      name: 'metrics-storage',
    }
  )
)