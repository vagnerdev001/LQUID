/*
  # יצירת טבלת ציטוטים מבנקים

  1. טבלאות חדשות
    - `bank_quotes`
      - `id` (uuid, מפתח ראשי)
      - `bank_name` (text, שם הבנק)
      - `quote_type` (text, סוג הציטוט)
      - `rate` (numeric, שיעור ריבית)
      - `amount_min` (bigint, סכום מינימלי)
      - `amount_max` (bigint, סכום מקסימלי)
      - `duration_days` (integer, משך בימים)
      - `valid_until` (timestamp, תוקף עד)
      - `created_at` (timestamp)

  2. אבטחה
    - הפעלת RLS על טבלת `bank_quotes`
    - מדיניות לקריאה למשתמשים מחוברים
    - מדיניות להוספה למנהלים ושחקנים
*/

CREATE TABLE IF NOT EXISTS bank_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  quote_type text NOT NULL DEFAULT 'deposit',
  rate numeric(5,3) NOT NULL,
  amount_min bigint NOT NULL DEFAULT 1000000,
  amount_max bigint NOT NULL DEFAULT 100000000,
  duration_days integer NOT NULL DEFAULT 30,
  valid_until timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bank_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bank quotes"
  ON bank_quotes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players and admins can insert bank quotes"
  ON bank_quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('player', 'admin')
    )
  );

CREATE POLICY "Players and admins can update bank quotes"
  ON bank_quotes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('player', 'admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_bank_quotes_bank ON bank_quotes(bank_name);
CREATE INDEX IF NOT EXISTS idx_bank_quotes_type ON bank_quotes(quote_type);
CREATE INDEX IF NOT EXISTS idx_bank_quotes_rate ON bank_quotes(rate);
CREATE INDEX IF NOT EXISTS idx_bank_quotes_valid ON bank_quotes(valid_until);