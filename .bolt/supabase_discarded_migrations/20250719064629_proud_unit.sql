/*
  # Liquidity Management System Database Schema

  1. New Tables
    - `organizations` - Government entities and municipalities that send funds
    - `transactions` - Daily incoming transactions from organizations
    - `investment_strategies` - Available investment strategies with risk profiles
    - `strategy_allocations` - Instrument allocations for each strategy
    - `investments` - Executed investments based on strategies
    - `investment_instruments` - Available investment instruments (bonds, deposits, etc.)
    - `portfolio_performance` - Daily performance tracking
    - `alerts` - System alerts and notifications
    - `user_profiles` - Updated for liquidity management roles

  2. Security
    - Enable RLS on all tables
    - Add policies for different user roles (admin, analyst, viewer)
    - Ensure data isolation and proper access controls

  3. Features
    - Automatic performance calculation triggers
    - Real-time portfolio tracking
    - Risk assessment and monitoring
    - Strategy execution logging
*/

-- Drop existing tables that are not relevant
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;

-- Update user_profiles for liquidity management roles
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS games_played;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS wins;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS losses;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS win_rate;

-- Add new columns for liquidity management
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'department'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN department text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'access_level'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN access_level text DEFAULT 'viewer';
  END IF;
END $$;

-- Update role constraint
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role = ANY (ARRAY['admin'::text, 'analyst'::text, 'viewer'::text]));

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_access_level_check 
  CHECK (access_level = ANY (ARRAY['full'::text, 'limited'::text, 'viewer'::text]));

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'municipality',
  contact_email text,
  contact_phone text,
  payment_schedule text DEFAULT 'monthly',
  average_amount numeric(15,2) DEFAULT 0,
  risk_rating text DEFAULT 'low',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Investment instruments table
CREATE TABLE IF NOT EXISTS investment_instruments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  provider text NOT NULL,
  current_rate numeric(5,2) NOT NULL,
  minimum_amount numeric(15,2) DEFAULT 0,
  maximum_amount numeric(15,2),
  minimum_days integer DEFAULT 1,
  maximum_days integer,
  risk_level text DEFAULT 'low',
  liquidity_rating text DEFAULT 'high',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE investment_instruments ENABLE ROW LEVEL SECURITY;

-- Investment strategies table
CREATE TABLE IF NOT EXISTS investment_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  risk_level text NOT NULL DEFAULT 'low',
  target_annual_return numeric(5,2) NOT NULL,
  minimum_amount numeric(15,2) DEFAULT 0,
  maximum_amount numeric(15,2),
  minimum_days integer DEFAULT 1,
  maximum_days integer,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE investment_strategies ENABLE ROW LEVEL SECURITY;

-- Strategy allocations table
CREATE TABLE IF NOT EXISTS strategy_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id uuid NOT NULL REFERENCES investment_strategies(id) ON DELETE CASCADE,
  instrument_id uuid NOT NULL REFERENCES investment_instruments(id) ON DELETE CASCADE,
  allocation_percentage numeric(5,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE strategy_allocations ENABLE ROW LEVEL SECURITY;

-- Transactions table (replacing matches)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  organization_name text NOT NULL,
  amount numeric(15,2) NOT NULL,
  transaction_date date DEFAULT CURRENT_DATE,
  expected_payment_date date,
  days_to_payment integer,
  status text DEFAULT 'pending',
  source_reference text,
  notes text,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  strategy_id uuid NOT NULL REFERENCES investment_strategies(id) ON DELETE RESTRICT,
  principal_amount numeric(15,2) NOT NULL,
  expected_return numeric(15,2) DEFAULT 0,
  actual_return numeric(15,2),
  start_date date DEFAULT CURRENT_DATE,
  maturity_date date NOT NULL,
  status text DEFAULT 'active',
  executed_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Investment details table (for tracking individual instrument investments)
CREATE TABLE IF NOT EXISTS investment_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id uuid NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  instrument_id uuid NOT NULL REFERENCES investment_instruments(id) ON DELETE RESTRICT,
  amount numeric(15,2) NOT NULL,
  rate numeric(5,2) NOT NULL,
  allocation_percentage numeric(5,2) NOT NULL,
  expected_return numeric(15,2) DEFAULT 0,
  actual_return numeric(15,2),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investment_details ENABLE ROW LEVEL SECURITY;

-- Portfolio performance table
CREATE TABLE IF NOT EXISTS portfolio_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  performance_date date DEFAULT CURRENT_DATE,
  total_principal numeric(15,2) DEFAULT 0,
  total_return numeric(15,2) DEFAULT 0,
  daily_return numeric(15,2) DEFAULT 0,
  annual_return_rate numeric(5,2) DEFAULT 0,
  total_transactions integer DEFAULT 0,
  active_investments integer DEFAULT 0,
  risk_score numeric(3,1) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_performance ENABLE ROW LEVEL SECURITY;

-- Alerts table (replacing notifications with more specific structure)
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  alert_type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  severity text DEFAULT 'low',
  related_transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  related_investment_id uuid REFERENCES investments(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  is_acknowledged boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Add constraints
ALTER TABLE organizations ADD CONSTRAINT organizations_type_check 
  CHECK (type = ANY (ARRAY['municipality'::text, 'ministry'::text, 'government'::text, 'authority'::text]));

ALTER TABLE organizations ADD CONSTRAINT organizations_risk_rating_check 
  CHECK (risk_rating = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]));

ALTER TABLE investment_instruments ADD CONSTRAINT instruments_type_check 
  CHECK (type = ANY (ARRAY['deposit'::text, 'government_bond'::text, 'corporate_bond'::text, 'treasury_bill'::text, 'money_market'::text]));

ALTER TABLE investment_instruments ADD CONSTRAINT instruments_risk_level_check 
  CHECK (risk_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]));

ALTER TABLE investment_strategies ADD CONSTRAINT strategies_risk_level_check 
  CHECK (risk_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]));

ALTER TABLE transactions ADD CONSTRAINT transactions_status_check 
  CHECK (status = ANY (ARRAY['pending'::text, 'invested'::text, 'matured'::text, 'cancelled'::text]));

ALTER TABLE investments ADD CONSTRAINT investments_status_check 
  CHECK (status = ANY (ARRAY['active'::text, 'matured'::text, 'cancelled'::text, 'partial'::text]));

ALTER TABLE alerts ADD CONSTRAINT alerts_type_check 
  CHECK (alert_type = ANY (ARRAY['info'::text, 'warning'::text, 'error'::text, 'success'::text]));

ALTER TABLE alerts ADD CONSTRAINT alerts_severity_check 
  CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_instruments_type ON investment_instruments(type);
CREATE INDEX IF NOT EXISTS idx_instruments_active ON investment_instruments(is_active);
CREATE INDEX IF NOT EXISTS idx_strategies_risk ON investment_strategies(risk_level);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_organization ON transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_dates ON investments(start_date, maturity_date);
CREATE INDEX IF NOT EXISTS idx_performance_date ON portfolio_performance(performance_date);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id, is_read);

-- RLS Policies

-- Organizations policies
CREATE POLICY "Anyone can view organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and analysts can manage organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = uid() 
    AND user_profiles.role = ANY (ARRAY['admin'::text, 'analyst'::text])
  ));

-- Investment instruments policies
CREATE POLICY "Anyone can view instruments"
  ON investment_instruments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage instruments"
  ON investment_instruments FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = uid() 
    AND user_profiles.role = 'admin'::text
  ));

-- Investment strategies policies
CREATE POLICY "Anyone can view strategies"
  ON investment_strategies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and analysts can manage strategies"
  ON investment_strategies FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = uid() 
    AND user_profiles.role = ANY (ARRAY['admin'::text, 'analyst'::text])
  ));

-- Strategy allocations policies
CREATE POLICY "Anyone can view allocations"
  ON strategy_allocations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and analysts can manage allocations"
  ON strategy_allocations FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = uid() 
    AND user_profiles.role = ANY (ARRAY['admin'::text, 'analyst'::text])
  ));

-- Transactions policies
CREATE POLICY "Anyone can view transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and analysts can manage transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = uid() 
    AND user_profiles.role = ANY (ARRAY['admin'::text, 'analyst'::text])
  ));

-- Investments policies
CREATE POLICY "Anyone can view investments"
  ON investments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and analysts can manage investments"
  ON investments FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = uid() 
    AND user_profiles.role = ANY (ARRAY['admin'::text, 'analyst'::text])
  ));

-- Investment details policies
CREATE POLICY "Anyone can view investment details"
  ON investment_details FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and analysts can manage investment details"
  ON investment_details FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = uid() 
    AND user_profiles.role = ANY (ARRAY['admin'::text, 'analyst'::text])
  ));

-- Portfolio performance policies
CREATE POLICY "Anyone can view performance"
  ON portfolio_performance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert performance data"
  ON portfolio_performance FOR INSERT
  TO authenticated
  USING (true);

-- Alerts policies
CREATE POLICY "Users can view own alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (user_id = uid());

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (user_id = uid());

CREATE POLICY "System can insert alerts"
  ON alerts FOR INSERT
  TO authenticated
  USING (true);

-- Update existing notifications policies to work with alerts
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Functions and Triggers

-- Function to update portfolio performance
CREATE OR REPLACE FUNCTION update_portfolio_performance()
RETURNS trigger AS $$
BEGIN
  -- Calculate daily performance metrics
  INSERT INTO portfolio_performance (
    performance_date,
    total_principal,
    total_return,
    daily_return,
    annual_return_rate,
    total_transactions,
    active_investments
  )
  SELECT 
    CURRENT_DATE,
    COALESCE(SUM(i.principal_amount), 0) as total_principal,
    COALESCE(SUM(COALESCE(i.actual_return, i.expected_return)), 0) as total_return,
    COALESCE(SUM(COALESCE(i.actual_return, i.expected_return)) / NULLIF(SUM(i.principal_amount), 0) * 100, 0) as daily_return,
    COALESCE(AVG(s.target_annual_return), 0) as annual_return_rate,
    (SELECT COUNT(*) FROM transactions WHERE status = 'invested'),
    COUNT(i.id) as active_investments
  FROM investments i
  LEFT JOIN investment_strategies s ON i.strategy_id = s.id
  WHERE i.status = 'active'
  ON CONFLICT (performance_date) DO UPDATE SET
    total_principal = EXCLUDED.total_principal,
    total_return = EXCLUDED.total_return,
    daily_return = EXCLUDED.daily_return,
    annual_return_rate = EXCLUDED.annual_return_rate,
    total_transactions = EXCLUDED.total_transactions,
    active_investments = EXCLUDED.active_investments;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create alerts for important events
CREATE OR REPLACE FUNCTION create_investment_alert()
RETURNS trigger AS $$
BEGIN
  -- Create alert when new investment is made
  IF TG_OP = 'INSERT' THEN
    INSERT INTO alerts (
      alert_type,
      title,
      message,
      severity,
      related_investment_id
    ) VALUES (
      'success',
      'השקעה חדשה בוצעה',
      'השקעה בסך ' || NEW.principal_amount || ' ₪ בוצעה בהצלחה',
      'low',
      NEW.id
    );
  END IF;

  -- Create alert when investment matures
  IF TG_OP = 'UPDATE' AND OLD.status != 'matured' AND NEW.status = 'matured' THEN
    INSERT INTO alerts (
      alert_type,
      title,
      message,
      severity,
      related_investment_id
    ) VALUES (
      'info',
      'השקעה הגיעה לפירעון',
      'השקעה בסך ' || NEW.principal_amount || ' ₪ הגיעה לפירעון',
      'medium',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_investment_change
  AFTER INSERT OR UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_performance();

CREATE TRIGGER on_investment_alert
  AFTER INSERT OR UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION create_investment_alert();

-- Insert sample data

-- Sample organizations
INSERT INTO organizations (name, type, contact_email, average_amount, risk_rating) VALUES
('עיריית תל אביב', 'municipality', 'finance@tel-aviv.gov.il', 50000000, 'low'),
('משרד החינוך', 'ministry', 'budget@education.gov.il', 35000000, 'low'),
('רשות מקומית חיפה', 'municipality', 'finance@haifa.gov.il', 40000000, 'low'),
('משרד הבריאות', 'ministry', 'finance@health.gov.il', 30000000, 'low'),
('עיריית ירושלים', 'municipality', 'budget@jerusalem.gov.il', 45000000, 'low');

-- Sample investment instruments
INSERT INTO investment_instruments (name, type, provider, current_rate, minimum_amount, risk_level) VALUES
('פיקדון בנק הפועלים', 'deposit', 'בנק הפועלים', 4.2, 1000000, 'low'),
('מק"מ ממשלתי', 'government_bond', 'בנק ישראל', 3.8, 500000, 'low'),
('אג"ח קונצרני AAA', 'corporate_bond', 'בנק לאומי', 5.1, 2000000, 'medium'),
('אג"ח קונצרני AA', 'corporate_bond', 'בנק דיסקונט', 5.8, 1500000, 'medium'),
('שטר חוב קצר מועד', 'treasury_bill', 'משרד האוצר', 3.5, 1000000, 'low');

-- Sample investment strategies
INSERT INTO investment_strategies (name, description, risk_level, target_annual_return, minimum_amount) VALUES
('אסטרטגיה שמרנית', 'פיזור בין פיקדונות ומק"מ ממשלתי', 'low', 3.8, 1000000),
('אסטרטגיה מאוזנת', 'תמהיל של כלים שונים לתשואה טובה יותר', 'medium', 4.5, 2000000),
('אסטרטגיה אגרסיבית', 'מקסימיזציה של תשואה עם סיכון מבוקר', 'medium', 5.2, 3000000);

-- Sample strategy allocations
INSERT INTO strategy_allocations (strategy_id, instrument_id, allocation_percentage) VALUES
-- Conservative strategy
((SELECT id FROM investment_strategies WHERE name = 'אסטרטגיה שמרנית'), 
 (SELECT id FROM investment_instruments WHERE name = 'פיקדון בנק הפועלים'), 60),
((SELECT id FROM investment_strategies WHERE name = 'אסטרטגיה שמרנית'), 
 (SELECT id FROM investment_instruments WHERE name = 'מק"מ ממשלתי'), 40),

-- Balanced strategy
((SELECT id FROM investment_strategies WHERE name = 'אסטרטגיה מאוזנת'), 
 (SELECT id FROM investment_instruments WHERE name = 'פיקדון בנק הפועלים'), 40),
((SELECT id FROM investment_strategies WHERE name = 'אסטרטגיה מאוזנת'), 
 (SELECT id FROM investment_instruments WHERE name = 'אג"ח קונצרני AAA'), 35),
((SELECT id FROM investment_strategies WHERE name = 'אסטרטגיה מאוזנת'), 
 (SELECT id FROM investment_instruments WHERE name = 'מק"מ ממשלתי'), 25),

-- Aggressive strategy
((SELECT id FROM investment_strategies WHERE name = 'אסטרטגיה אגרסיבית'), 
 (SELECT id FROM investment_instruments WHERE name = 'אג"ח קונצרני AAA'), 50),
((SELECT id FROM investment_strategies WHERE name = 'אסטרטגיה אגרסיבית'), 
 (SELECT id FROM investment_instruments WHERE name = 'אג"ח קונצרני AA'), 30),
((SELECT id FROM investment_strategies WHERE name = 'אסטרטגיה אגרסיבית'), 
 (SELECT id FROM investment_instruments WHERE name = 'פיקדון בנק הפועלים'), 20);