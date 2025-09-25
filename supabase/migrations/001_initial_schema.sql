-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE subscription_tier AS ENUM ('trial', 'starter', 'professional', 'enterprise');
CREATE TYPE industry_type AS ENUM ('bathroom_pods', 'modular_housing', 'prefab_components', 'general_manufacturing');
CREATE TYPE user_role AS ENUM ('viewer', 'admin', 'super_admin');
CREATE TYPE metric_category AS ENUM ('quality', 'production', 'workforce', 'cost');

-- Companies table (multi-tenant base)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    industry_type industry_type NOT NULL DEFAULT 'general_manufacturing',
    config JSONB NOT NULL DEFAULT '{}',
    baseline_quarter TEXT,
    subscription_tier subscription_tier NOT NULL DEFAULT 'trial',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for slug lookups
CREATE INDEX idx_companies_slug ON companies(slug);

-- Tenant configuration table
CREATE TABLE tenants_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    config_key TEXT NOT NULL,
    config_value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, config_key)
);

-- Metric definitions per tenant
CREATE TABLE metric_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL,
    display_name TEXT NOT NULL,
    category metric_category NOT NULL,
    calculation_type TEXT,
    unit TEXT,
    is_higher_better BOOLEAN NOT NULL DEFAULT true,
    custom_formula JSONB,
    description TEXT,
    formula TEXT,
    impact TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, metric_key)
);

-- Industry templates for quick setup
CREATE TABLE industry_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_type TEXT NOT NULL,
    template_name TEXT NOT NULL,
    description TEXT,
    metrics JSONB NOT NULL,
    benchmarks JSONB NOT NULL,
    roi_assumptions JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quarters table
CREATE TABLE quarters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    quarter TEXT NOT NULL,
    label TEXT NOT NULL,
    date DATE NOT NULL,
    is_baseline BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for company quarters
CREATE INDEX idx_quarters_company_id ON quarters(company_id);
CREATE INDEX idx_quarters_date ON quarters(company_id, date);

-- Actual metrics table
CREATE TABLE actual_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quarter_id UUID NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    metric_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Target metrics table
CREATE TABLE target_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quarter_id UUID NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    metric_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Benchmarks table
CREATE TABLE benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    excellent DECIMAL,
    good DECIMAL,
    acceptable DECIMAL,
    industry DECIMAL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, metric_name)
);

-- ROI assumptions table
CREATE TABLE roi_assumptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    assumption_type TEXT NOT NULL,
    value DECIMAL NOT NULL,
    unit TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, assumption_type)
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for company users
CREATE INDEX idx_users_company_id ON users(company_id);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE actual_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can update their company" ON companies
    FOR UPDATE USING (
        id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Quarters policies
CREATE POLICY "Users can view quarters for their company" ON quarters
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage quarters for their company" ON quarters
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Metrics policies (similar pattern for actual_metrics and target_metrics)
CREATE POLICY "Users can view metrics for their company" ON actual_metrics
    FOR SELECT USING (
        quarter_id IN (
            SELECT id FROM quarters WHERE company_id IN (
                SELECT company_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can manage metrics for their company" ON actual_metrics
    FOR ALL USING (
        quarter_id IN (
            SELECT id FROM quarters WHERE company_id IN (
                SELECT company_id FROM users
                WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
            )
        )
    );

-- Apply same policies to target_metrics
CREATE POLICY "Users can view target metrics for their company" ON target_metrics
    FOR SELECT USING (
        quarter_id IN (
            SELECT id FROM quarters WHERE company_id IN (
                SELECT company_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can manage target metrics for their company" ON target_metrics
    FOR ALL USING (
        quarter_id IN (
            SELECT id FROM quarters WHERE company_id IN (
                SELECT company_id FROM users
                WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
            )
        )
    );

-- Benchmarks and ROI assumptions policies
CREATE POLICY "Users can view benchmarks for their company" ON benchmarks
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage benchmarks for their company" ON benchmarks
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can view ROI assumptions for their company" ON roi_assumptions
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage ROI assumptions for their company" ON roi_assumptions
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Users policies
CREATE POLICY "Users can view users in their company" ON users
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage users in their company" ON users
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_config_updated_at BEFORE UPDATE ON tenants_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_metric_definitions_updated_at BEFORE UPDATE ON metric_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quarters_updated_at BEFORE UPDATE ON quarters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_actual_metrics_updated_at BEFORE UPDATE ON actual_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_target_metrics_updated_at BEFORE UPDATE ON target_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();