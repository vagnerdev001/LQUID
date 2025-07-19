/*
  # יצירת טבלת הסטוריית עסקאות

  1. טבלאות חדשות
    - `transaction_history`
      - `id` (uuid, מפתח ראשי)
      - `transaction_type` (text, סוג העסקה)
      - `amount` (bigint, סכום)
      - `source_institution` (text, מוסד מקור)
      - `target_institution` (text, מוסד יעד)
      - `rate` (numeric, שיעור ריבית)
      - `duration_days` (integer, משך בימים)
      - `status` (text, סטטוס)
      - `executed_by` (uuid, מבוצע על ידי)
      - `execution_date` (timestamp, תאריך ביצוע)
      - `maturity_date` (timestamp, תאריך פירעון)
      - `actual_return` (bigint, תשואה בפועל)
      - `created_at` (timestamp)

  2. אבטחה
    - הפעלת RLS על טבלת `transaction_history`
    - מדיניות לקריאה למשתמשים מחוברים
    - מדיניות להוספה למנהלים ושחקנים
*/

CREATE TABLE IF NOT EXISTS transaction_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type text NOT NULL DEFAULT 'investment',
  amount bigint NOT NULL,
  source_institution text NOT NULL,
  target_institution text,
  rate numeric(5,3),
  duration_days integer,
  status text NOT NULL DEFAULT 'pending',
  executed_by uuid,
  execution_date timestamptz DEFAULT now(),
  maturity_date timestamptz,
  actual_return bigint DEFAULT 0,
  expected_return bigint DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view transaction history"
  ON transaction_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players and admins can insert transactions"
  ON transaction_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('player', 'admin')
    )
  );

CREATE POLICY "Players and admins can update transactions"
  ON transaction_history
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('player', 'admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_transaction_history_type ON transaction_history(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transaction_history_status ON transaction_history(status);
CREATE INDEX IF NOT EXISTS idx_transaction_history_date ON transaction_history(execution_date);
CREATE INDEX IF NOT EXISTS idx_transaction_history_amount ON transaction_history(amount);
CREATE INDEX IF NOT EXISTS idx_transaction_history_executed_by ON transaction_history(executed_by);

-- הוספת קשר זר למשתמש שביצע
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'transaction_history_executed_by_fkey'
  ) THEN
    ALTER TABLE transaction_history
    ADD CONSTRAINT transaction_history_executed_by_fkey
    FOREIGN KEY (executed_by) REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- הוספת אילוצים לסטטוס
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'transaction_history_status_check'
  ) THEN
    ALTER TABLE transaction_history
    ADD CONSTRAINT transaction_history_status_check
    CHECK (status IN ('pending', 'executed', 'completed', 'cancelled', 'failed'));
  END IF;
END $$;

-- הוספת אילוצים לסוג עסקה
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'transaction_history_type_check'
  ) THEN
    ALTER TABLE transaction_history
    ADD CONSTRAINT transaction_history_type_check
    CHECK (transaction_type IN ('investment', 'deposit', 'withdrawal', 'transfer', 'maturity'));
  END IF;
END $$;