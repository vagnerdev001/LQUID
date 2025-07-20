/*
  # Create projected transactions table

  1. New Tables
    - `projected_transactions`
      - `id` (uuid, primary key)
      - `transaction_date` (date)
      - `amount` (bigint)
      - `source_institution` (text)
      - `transaction_type` (text)
      - `probability` (numeric)
      - `expected_return` (bigint)
      - `duration_days` (integer)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `projected_transactions` table
    - Add policy for authenticated users to read data
    - Add policy for players and admins to insert/update data
*/

CREATE TABLE IF NOT EXISTS projected_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date date NOT NULL,
  amount bigint NOT NULL,
  source_institution text NOT NULL,
  transaction_type text DEFAULT 'incoming'::text,
  probability numeric(3,2) DEFAULT 0.85,
  expected_return bigint DEFAULT 0,
  duration_days integer DEFAULT 30,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projected_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projected transactions"
  ON projected_transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players and admins can insert projected transactions"
  ON projected_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = uid()
      AND user_profiles.role IN ('player', 'admin')
    )
  );

CREATE POLICY "Players and admins can update projected transactions"
  ON projected_transactions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = uid()
      AND user_profiles.role IN ('player', 'admin')
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projected_transactions_date ON projected_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_projected_transactions_amount ON projected_transactions(amount);
CREATE INDEX IF NOT EXISTS idx_projected_transactions_type ON projected_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_projected_transactions_probability ON projected_transactions(probability);

-- Add constraint for transaction type
ALTER TABLE projected_transactions 
ADD CONSTRAINT projected_transactions_type_check 
CHECK (transaction_type IN ('incoming', 'outgoing', 'transfer', 'investment'));

-- Add constraint for probability range
ALTER TABLE projected_transactions 
ADD CONSTRAINT projected_transactions_probability_check 
CHECK (probability >= 0.0 AND probability <= 1.0);