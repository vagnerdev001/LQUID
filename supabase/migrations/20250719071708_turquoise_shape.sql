/*
  # יצירת טבלת ציטוטי פקדונות

  1. טבלאות חדשות
    - `deposit_quotes`
      - `id` (uuid, מפתח ראשי)
      - `institution_name` (text, שם המוסד)
      - `deposit_type` (text, סוג הפקדון)
      - `rate` (numeric, שיעור ריבית)
      - `amount_min` (bigint, סכום מינימלי)
      - `amount_max` (bigint, סכום מקסימלי)
      - `duration_days` (integer, משך בימים)
      - `early_withdrawal_penalty` (numeric, קנס משיכה מוקדמת)
      - `valid_until` (timestamp, תוקף עד)
      - `created_at` (timestamp)

  2. אבטחה
    - הפעלת RLS על טבלת `deposit_quotes`
    - מדיניות לקריאה למשתמשים מחוברים
    - מדיניות להוספה למנהלים ושחקנים
*/

CREATE TABLE IF NOT EXISTS deposit_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name text NOT NULL,
  deposit_type text NOT NULL DEFAULT 'fixed',
  rate numeric(5,3) NOT NULL,
  amount_min bigint NOT NULL DEFAULT 1000000,
  amount_max bigint NOT NULL DEFAULT 500000000,
  duration_days integer NOT NULL DEFAULT 30,
  early_withdrawal_penalty numeric(4,2) DEFAULT 0.5,
  currency text NOT NULL DEFAULT 'ILS',
  risk_rating text DEFAULT 'low',
  valid_until timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deposit_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view deposit quotes"
  ON deposit_quotes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players and admins can insert deposit quotes"
  ON deposit_quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('player', 'admin')
    )
  );

CREATE POLICY "Players and admins can update deposit quotes"
  ON deposit_quotes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('player', 'admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_deposit_quotes_institution ON deposit_quotes(institution_name);
CREATE INDEX IF NOT EXISTS idx_deposit_quotes_type ON deposit_quotes(deposit_type);
CREATE INDEX IF NOT EXISTS idx_deposit_quotes_rate ON deposit_quotes(rate);
CREATE INDEX IF NOT EXISTS idx_deposit_quotes_valid ON deposit_quotes(valid_until);
CREATE INDEX IF NOT EXISTS idx_deposit_quotes_duration ON deposit_quotes(duration_days);