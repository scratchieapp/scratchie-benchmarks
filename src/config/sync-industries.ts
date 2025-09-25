import { Company, Quarter } from '@/types'
import { QuarterData } from '@/lib/calculations'

export const syncIndustriesConfig: Company = {
  id: 'sync-industries',
  slug: 'sync-industries',
  name: 'Sync Industries',
  industryType: 'bathroom_pods',
  baselineQuarter: 'Q3 2025',
  createdAt: new Date('2025-01-01'),
  subscriptionTier: 'professional',
  config: {
    branding: {
      primaryColor: '#003D7A',
      secondaryColor: '#0066CC',
      logo: '/logos/sync-logo.svg',
      tagline: 'Manufacturing Excellence Through Innovation',
    },
    features: {
      modules: ['dashboard', 'performance', 'targets', 'roi', 'data-entry', 'admin'],
      customMetrics: true,
      advancedROI: true,
      dataExport: true,
      apiAccess: false,
    },
    metrics: [
      {
        id: 'fpy',
        key: 'firstPassYield',
        displayName: 'First Pass Yield',
        category: 'quality',
        unit: '%',
        description: 'Percentage of pods completed correctly the first time without any rework or defects.',
        formula: 'FPY = (Units without defects / Total units produced) × 100',
        impact: 'Each 1% improvement typically saves $1,500-2,500/month in rework costs',
        isHigherBetter: true,
      },
      {
        id: 'cycle-time',
        key: 'cycleTime',
        displayName: 'Cycle Time',
        category: 'production',
        unit: 'hours',
        description: 'Total time to produce one pod from start to finish.',
        formula: 'Time from pod start to completion',
        impact: 'Reducing cycle time by 20% can increase capacity by 25%',
        isHigherBetter: false,
      },
      {
        id: 'coq',
        key: 'costOfQuality',
        displayName: 'Cost of Quality',
        category: 'cost',
        unit: '$',
        description: 'Total monthly cost of preventing, finding, and fixing defects.',
        formula: 'COQ = Prevention costs + Appraisal costs + Failure costs',
        impact: 'Best-in-class maintain COQ at 10-15% of revenue',
        isHigherBetter: false,
      },
      {
        id: 'absenteeism',
        key: 'absenteeismRate',
        displayName: 'Absenteeism Rate',
        category: 'workforce',
        unit: '%',
        description: 'Percentage of scheduled work days lost to unplanned absences.',
        formula: 'Absenteeism = (Days absent / Total scheduled days) × 100',
        impact: 'Each 1% reduction saves approximately $36,000/year in lost productivity',
        isHigherBetter: false,
      },
    ],
    calculations: {
      scratchieIndexWeights: {
        quality: 0.30,
        productivity: 0.25,
        efficiency: 0.20,
        attendance: 0.15,
        costControl: 0.10,
      },
      roiAssumptions: {
        hourlyLaborRate: 35,
        overtimeMultiplier: 1.5,
        podProfitMargin: 500,
        annualWorkingDays: 250,
        productivityLossPerAbsence: 400,
        qualityIncidentCost: 1200,
      },
    },
    benchmarks: {
      firstPassYield: {
        excellent: 90,
        good: 75,
        acceptable: 60,
        industry: 85,
      },
      cycleTime: {
        excellent: 24,
        good: 36,
        acceptable: 48,
        industry: 32,
      },
      costOfQuality: {
        excellent: 2000,
        good: 3500,
        acceptable: 5000,
        industry: 3000,
      },
      absenteeismRate: {
        excellent: 2.0,
        good: 3.5,
        acceptable: 5.0,
        industry: 2.8,
      },
      defectsPerPod: {
        excellent: 2,
        good: 4,
        acceptable: 6,
        industry: 3.5,
      },
      overtimePercentage: {
        excellent: 2,
        good: 5,
        acceptable: 10,
        industry: 5,
      },
    },
  },
}

export const syncBaselineData: QuarterData = {
  production: {
    avgTimePerPod: 45,
    dailyPodOutput: 18,
    peoplePerOutput: 5,
    laborHoursPerPod: 45,
    downtimeTarget: 10,
    downtimeActual: 40,
    overtimeHours: 64,
  },
  quality: {
    costOfQuality: 5500,
    wallTileDefects: 1828,
    floorTileDefects: 1745,
    villaboardDefects: 1465,
    framingDefects: 1463,
    fitOffDefects: 197,
    membraneDefects: 91,
    plumbingDefects: 57,
    electricalDefects: 50,
    totalDefects: 10461,
    podsInspected: 2114,
    wrappedPods: 1044,
    percentComplete: 49.39,
  },
  workforce: {
    fullTimeStaff: 64,
    sickLeaveDays: 263,
    annualLeaveDays: 952,
    supervisors: 7,
    totalWorkers: 108,
    peoplePerPod: 6,
    plumbersPerPod: 1,
    electriciansPerPod: 0.3,
  },
}

export const syncQuartersData: Array<{
  quarter: Quarter
  actual: QuarterData | null
  target: Partial<QuarterData> | null
}> = [
  {
    quarter: {
      id: 'q3-2025',
      companyId: 'sync-industries',
      quarter: 'Q3 2025',
      label: 'Baseline',
      date: new Date('2025-09-23'),
      isBaseline: true,
      createdAt: new Date('2025-09-23'),
    },
    actual: syncBaselineData,
    target: null,
  },
  {
    quarter: {
      id: 'q4-2025',
      companyId: 'sync-industries',
      quarter: 'Q4 2025',
      label: 'Quarter 1',
      date: new Date('2025-12-31'),
      isBaseline: false,
      createdAt: new Date('2025-09-23'),
    },
    actual: null,
    target: {
      production: {
        avgTimePerPod: 42,
        dailyPodOutput: 19,
        overtimeHours: 55,
      },
      quality: {
        costOfQuality: 5000,
        totalDefects: 9500,
        percentComplete: 54,
      },
      workforce: {
        sickLeaveDays: 250,
      },
    },
  },
  {
    quarter: {
      id: 'q1-2026',
      companyId: 'sync-industries',
      quarter: 'Q1 2026',
      label: 'Quarter 2',
      date: new Date('2026-03-31'),
      isBaseline: false,
      createdAt: new Date('2025-09-23'),
    },
    actual: null,
    target: {
      production: {
        avgTimePerPod: 40,
        dailyPodOutput: 20,
        overtimeHours: 48,
      },
      quality: {
        costOfQuality: 4500,
        totalDefects: 8500,
        percentComplete: 58,
      },
      workforce: {
        sickLeaveDays: 235,
      },
    },
  },
  {
    quarter: {
      id: 'q2-2026',
      companyId: 'sync-industries',
      quarter: 'Q2 2026',
      label: 'Quarter 3',
      date: new Date('2026-06-30'),
      isBaseline: false,
      createdAt: new Date('2025-09-23'),
    },
    actual: null,
    target: {
      production: {
        avgTimePerPod: 38,
        dailyPodOutput: 21,
        overtimeHours: 40,
      },
      quality: {
        costOfQuality: 4000,
        totalDefects: 7500,
        percentComplete: 62,
      },
      workforce: {
        sickLeaveDays: 220,
      },
    },
  },
]