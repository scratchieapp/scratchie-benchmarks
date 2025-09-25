-- Seed data for Sync Industries

-- Insert Sync Industries company
INSERT INTO companies (id, slug, name, industry_type, baseline_quarter, subscription_tier, config)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'sync-industries',
    'Sync Industries',
    'bathroom_pods',
    'Q3 2025',
    'professional',
    '{
        "branding": {
            "primaryColor": "#003D7A",
            "secondaryColor": "#0066CC",
            "logo": "/logos/sync-logo.svg",
            "tagline": "Manufacturing Excellence Through Innovation"
        },
        "features": {
            "modules": ["dashboard", "performance", "targets", "roi", "data-entry", "admin"],
            "customMetrics": true,
            "advancedROI": true,
            "dataExport": true,
            "apiAccess": false
        }
    }'::jsonb
);

-- Insert quarters for Sync Industries
INSERT INTO quarters (id, company_id, quarter, label, date, is_baseline)
VALUES
    ('a47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Q3 2025', 'Baseline', '2025-09-23', true),
    ('b47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Q4 2025', 'Quarter 1', '2025-12-31', false),
    ('c47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Q1 2026', 'Quarter 2', '2026-03-31', false),
    ('d47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Q2 2026', 'Quarter 3', '2026-06-30', false);

-- Insert baseline actual metrics for Q3 2025
INSERT INTO actual_metrics (quarter_id, metric_type, metric_data)
VALUES
    ('a47ac10b-58cc-4372-a567-0e02b2c3d479', 'production',
    '{
        "avgTimePerPod": 45,
        "dailyPodOutput": 18,
        "peoplePerOutput": 5,
        "laborHoursPerPod": 45,
        "downtimeTarget": 10,
        "downtimeActual": 40,
        "overtimeHours": 64
    }'::jsonb),
    ('a47ac10b-58cc-4372-a567-0e02b2c3d479', 'quality',
    '{
        "costOfQuality": 5500,
        "wallTileDefects": 1828,
        "floorTileDefects": 1745,
        "villaboardDefects": 1465,
        "framingDefects": 1463,
        "fitOffDefects": 197,
        "membraneDefects": 91,
        "plumbingDefects": 57,
        "electricalDefects": 50,
        "totalDefects": 10461,
        "podsInspected": 2114,
        "wrappedPods": 1044,
        "percentComplete": 49.39
    }'::jsonb),
    ('a47ac10b-58cc-4372-a567-0e02b2c3d479', 'workforce',
    '{
        "fullTimeStaff": 64,
        "sickLeaveDays": 263,
        "annualLeaveDays": 952,
        "supervisors": 7,
        "totalWorkers": 108,
        "peoplePerPod": 6,
        "plumbersPerPod": 1,
        "electriciansPerPod": 0.3
    }'::jsonb);

-- Insert target metrics for future quarters
INSERT INTO target_metrics (quarter_id, metric_type, metric_data)
VALUES
    -- Q4 2025 targets
    ('b47ac10b-58cc-4372-a567-0e02b2c3d479', 'production',
    '{
        "avgTimePerPod": 42,
        "dailyPodOutput": 19,
        "overtimeHours": 55
    }'::jsonb),
    ('b47ac10b-58cc-4372-a567-0e02b2c3d479', 'quality',
    '{
        "costOfQuality": 5000,
        "totalDefects": 9500,
        "percentComplete": 54
    }'::jsonb),
    ('b47ac10b-58cc-4372-a567-0e02b2c3d479', 'workforce',
    '{
        "sickLeaveDays": 250
    }'::jsonb),

    -- Q1 2026 targets
    ('c47ac10b-58cc-4372-a567-0e02b2c3d479', 'production',
    '{
        "avgTimePerPod": 40,
        "dailyPodOutput": 20,
        "overtimeHours": 48
    }'::jsonb),
    ('c47ac10b-58cc-4372-a567-0e02b2c3d479', 'quality',
    '{
        "costOfQuality": 4500,
        "totalDefects": 8500,
        "percentComplete": 58
    }'::jsonb),
    ('c47ac10b-58cc-4372-a567-0e02b2c3d479', 'workforce',
    '{
        "sickLeaveDays": 235
    }'::jsonb),

    -- Q2 2026 targets
    ('d47ac10b-58cc-4372-a567-0e02b2c3d479', 'production',
    '{
        "avgTimePerPod": 38,
        "dailyPodOutput": 21,
        "overtimeHours": 40
    }'::jsonb),
    ('d47ac10b-58cc-4372-a567-0e02b2c3d479', 'quality',
    '{
        "costOfQuality": 4000,
        "totalDefects": 7500,
        "percentComplete": 62
    }'::jsonb),
    ('d47ac10b-58cc-4372-a567-0e02b2c3d479', 'workforce',
    '{
        "sickLeaveDays": 220
    }'::jsonb);

-- Insert benchmarks for Sync Industries
INSERT INTO benchmarks (company_id, metric_name, excellent, good, acceptable, industry)
VALUES
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'firstPassYield', 90, 75, 60, 85),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'cycleTime', 24, 36, 48, 32),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'costOfQuality', 2000, 3500, 5000, 3000),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'absenteeismRate', 2.0, 3.5, 5.0, 2.8),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'defectsPerPod', 2, 4, 6, 3.5),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'overtimePercentage', 2, 5, 10, 5);

-- Insert ROI assumptions for Sync Industries
INSERT INTO roi_assumptions (company_id, assumption_type, value, unit, description)
VALUES
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'hourlyLaborRate', 35, '$/hour', 'Average hourly labor rate'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'overtimeMultiplier', 1.5, 'x', 'Overtime rate multiplier'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'podProfitMargin', 500, '$/pod', 'Profit margin per pod'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'annualWorkingDays', 250, 'days', 'Working days per year'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'productivityLossPerAbsence', 400, '$/day', 'Productivity loss per absence day'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'qualityIncidentCost', 1200, '$/incident', 'Average cost per quality incident');

-- Insert metric definitions for Sync Industries
INSERT INTO metric_definitions (tenant_id, metric_key, display_name, category, unit, is_higher_better, description, formula, impact)
VALUES
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'firstPassYield', 'First Pass Yield', 'quality', '%', true,
     'Percentage of pods completed correctly the first time without any rework or defects.',
     'FPY = (Units without defects / Total units produced) × 100',
     'Each 1% improvement typically saves $1,500-2,500/month in rework costs'),

    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'cycleTime', 'Cycle Time', 'production', 'hours', false,
     'Total time to produce one pod from start to finish.',
     'Time from pod start to completion',
     'Reducing cycle time by 20% can increase capacity by 25%'),

    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'costOfQuality', 'Cost of Quality', 'cost', '$', false,
     'Total monthly cost of preventing, finding, and fixing defects.',
     'COQ = Prevention costs + Appraisal costs + Failure costs',
     'Best-in-class maintain COQ at 10-15% of revenue'),

    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'absenteeismRate', 'Absenteeism Rate', 'workforce', '%', false,
     'Percentage of scheduled work days lost to unplanned absences.',
     'Absenteeism = (Days absent / Total scheduled days) × 100',
     'Each 1% reduction saves approximately $36,000/year in lost productivity'),

    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'defectsPerPod', 'Defects per Pod', 'quality', 'count', false,
     'Average number of defects found per pod.',
     'Total defects / Pods inspected',
     'Reducing defects by 50% can save 20-30% of quality costs'),

    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'overtimePercentage', 'Overtime Percentage', 'workforce', '%', false,
     'Percentage of total hours worked as overtime.',
     'Overtime % = (Overtime hours / Regular hours) × 100',
     'Reducing overtime by 50% saves 1.5x the hourly rate differential');