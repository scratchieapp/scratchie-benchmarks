export interface ProductionData {
  avgTimePerPod: number
  dailyPodOutput: number
  peoplePerOutput: number
  laborHoursPerPod: number
  downtimeTarget: number
  downtimeActual: number
  overtimeHours: number
}

export interface QualityData {
  costOfQuality: number
  wallTileDefects: number
  floorTileDefects: number
  villaboardDefects: number
  framingDefects: number
  fitOffDefects: number
  membraneDefects: number
  plumbingDefects: number
  electricalDefects: number
  totalDefects: number
  podsInspected: number
  wrappedPods: number
  percentComplete: number
}

export interface WorkforceData {
  fullTimeStaff: number
  sickLeaveDays: number
  annualLeaveDays: number
  supervisors: number
  totalWorkers: number
  peoplePerPod: number
  plumbersPerPod: number
  electriciansPerPod: number
}

export interface QuarterData {
  production: ProductionData
  quality: QualityData
  workforce: WorkforceData
}

export interface Metrics {
  throughputRate: number
  downtimePercentage: number
  overtimePercentage: number
  defectRate: number
  defectsPerPod: number
  firstPassYield: number
  absenteeismRate: number
  supervisionRatio: number
}

export interface ROICalculation {
  qualitySavings: number
  overtimeSavings: number
  productivityGains: number
  absenteeismSavings: number
  total: number
}

export interface ScratchieIndexWeights {
  quality: number
  productivity: number
  efficiency: number
  attendance: number
  costControl: number
}

const DEFAULT_WEIGHTS: ScratchieIndexWeights = {
  quality: 0.30,
  productivity: 0.25,
  efficiency: 0.20,
  attendance: 0.15,
  costControl: 0.10,
}

export function calculateMetrics(data: QuarterData | null): Metrics | null {
  if (!data) return null

  const { production: prod, quality: qual, workforce: work } = data

  const workDays = 65 // Quarter working days

  return {
    // Production metrics
    throughputRate: prod.dailyPodOutput / prod.peoplePerOutput,
    downtimePercentage: ((prod.downtimeActual - prod.downtimeTarget) / 480) * 100,
    overtimePercentage: (prod.overtimeHours / (work.fullTimeStaff * 160)) * 100,

    // Quality metrics
    defectRate: (qual.totalDefects / qual.podsInspected) * 100,
    defectsPerPod: qual.totalDefects / qual.podsInspected,
    firstPassYield: qual.percentComplete || 49.39,

    // Workforce metrics
    absenteeismRate: (work.sickLeaveDays / (work.fullTimeStaff * workDays)) * 100,
    supervisionRatio: work.totalWorkers / work.supervisors,
  }
}

export function calculateROI(
  baseline: QuarterData,
  target: Partial<QuarterData>,
  assumptions = {
    overtimeRate: 50,
    podMargin: 500,
    workingDays: 250,
    absenteeismCost: 36000,
  }
): ROICalculation {
  const roi: ROICalculation = {
    qualitySavings: 0,
    overtimeSavings: 0,
    productivityGains: 0,
    absenteeismSavings: 0,
    total: 0,
  }

  if (target.quality) {
    roi.qualitySavings = (baseline.quality.costOfQuality - target.quality.costOfQuality) * 12
  }

  if (target.production) {
    roi.overtimeSavings =
      (baseline.production.overtimeHours - target.production.overtimeHours) *
      assumptions.overtimeRate * 12

    roi.productivityGains =
      (target.production.dailyPodOutput - baseline.production.dailyPodOutput) *
      assumptions.workingDays *
      assumptions.podMargin
  }

  if (target.workforce) {
    const baselineAbsenteeism = baseline.workforce.sickLeaveDays
    const targetAbsenteeism = target.workforce.sickLeaveDays
    roi.absenteeismSavings =
      ((baselineAbsenteeism - targetAbsenteeism) / baselineAbsenteeism) *
      assumptions.absenteeismCost
  }

  roi.total = roi.qualitySavings + roi.overtimeSavings +
              roi.productivityGains + roi.absenteeismSavings

  return roi
}

export function calculateScratchieIndex(
  data: QuarterData,
  weights: ScratchieIndexWeights = DEFAULT_WEIGHTS
): number {
  const metrics = calculateMetrics(data)
  if (!metrics) return 0

  // Calculate individual scores (0-100 scale)
  const qualityScore = metrics.firstPassYield

  // Productivity: normalized against industry best (24 hours)
  const productivityScore = Math.min((24 / data.production.avgTimePerPod) * 100, 100)

  // Efficiency: inverse of overtime percentage
  const efficiencyScore = Math.max(100 - metrics.overtimePercentage * 10, 0)

  // Attendance: inverse of absenteeism
  const attendanceScore = Math.max(100 - metrics.absenteeismRate * 10, 0)

  // Cost Control: normalized against target ($3000/month)
  const costControlScore = Math.max(100 - (data.quality.costOfQuality / 3000 - 1) * 50, 0)

  // Calculate weighted average
  const index =
    qualityScore * weights.quality +
    productivityScore * weights.productivity +
    efficiencyScore * weights.efficiency +
    attendanceScore * weights.attendance +
    costControlScore * weights.costControl

  return Math.round(index)
}

export function getScratchieIndexColor(index: number): string {
  if (index >= 90) return 'text-green-600 bg-green-50'
  if (index >= 70) return 'text-blue-600 bg-blue-50'
  if (index >= 50) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}

export function getScratchieIndexLabel(index: number): string {
  if (index >= 90) return 'Excellent'
  if (index >= 70) return 'Good'
  if (index >= 50) return 'Acceptable'
  return 'Needs Improvement'
}

export function calculateScratchiePrice(
  activeUsers: number,
  turboRewardsPerWorker: number,
  workers: number
): {
  platformCost: number
  turboRewards: number
  totalInvestment: number
  monthlyInvestment: number
} {
  const platformCost = activeUsers * 5 * 12 // $5 per user per month, annual
  const turboRewards = turboRewardsPerWorker * workers * 12 // Annual
  const totalInvestment = platformCost + turboRewards
  const monthlyInvestment = totalInvestment / 12

  return {
    platformCost,
    turboRewards,
    totalInvestment,
    monthlyInvestment,
  }
}

export function calculatePaybackPeriod(
  investment: number,
  monthlySavings: number
): number {
  if (monthlySavings <= 0) return Infinity
  return investment / monthlySavings
}