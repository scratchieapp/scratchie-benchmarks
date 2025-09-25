export interface Company {
  id: string
  slug: string
  name: string
  industryType: 'bathroom_pods' | 'modular_housing' | 'prefab_components' | 'general_manufacturing'
  config: CompanyConfig
  baselineQuarter: string
  createdAt: Date
  subscriptionTier: 'trial' | 'starter' | 'professional' | 'enterprise'
}

export interface CompanyConfig {
  branding: {
    primaryColor: string
    secondaryColor?: string
    logo: string
    tagline?: string
  }
  features: {
    modules: string[]
    customMetrics: boolean
    advancedROI: boolean
    dataExport: boolean
    apiAccess: boolean
  }
  metrics: MetricDefinition[]
  calculations: CalculationRules
  benchmarks: BenchmarkSettings
}

export interface MetricDefinition {
  id: string
  key: string
  displayName: string
  category: 'quality' | 'production' | 'workforce' | 'cost'
  unit: string
  description: string
  formula?: string
  impact?: string
  isHigherBetter: boolean
  customFormula?: string | ((value: number) => number)
}

export interface CalculationRules {
  scratchieIndexWeights: {
    quality: number
    productivity: number
    efficiency: number
    attendance: number
    costControl: number
  }
  roiAssumptions: {
    hourlyLaborRate: number
    overtimeMultiplier: number
    podProfitMargin: number
    annualWorkingDays: number
    productivityLossPerAbsence: number
    qualityIncidentCost: number
  }
}

export interface BenchmarkSettings {
  [metricKey: string]: {
    excellent: number
    good: number
    acceptable: number
    industry?: number
  }
}

export interface Quarter {
  id: string
  companyId: string
  quarter: string // e.g., "Q3 2025"
  label: string // e.g., "Baseline", "Quarter 1"
  date: Date
  isBaseline: boolean
  createdAt: Date
}

export interface ActualMetrics {
  id: string
  quarterId: string
  metricType: 'production' | 'quality' | 'workforce'
  metricData: Record<string, unknown> // JSON data
  createdAt: Date
}

export interface TargetMetrics {
  id: string
  quarterId: string
  metricType: 'production' | 'quality' | 'workforce'
  metricData: Record<string, unknown> // JSON data
  createdAt: Date
}

export interface User {
  id: string
  email: string
  companyId: string
  role: 'viewer' | 'admin' | 'super_admin'
  createdAt: Date
}

export interface IndustryTemplate {
  id: string
  industryType: string
  templateName: string
  description: string
  metrics: MetricDefinition[]
  benchmarks: BenchmarkSettings
  roiAssumptions: Record<string, number>
}

export interface TenantContext {
  company: Company | null
  loading: boolean
  error: string | null
  refreshCompany: () => Promise<void>
}