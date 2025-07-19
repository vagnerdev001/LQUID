/*
  # Populate tables with mock data

  1. Data Population
    - `bank_quotes` - Government bonds (Makam) trading data
    - `deposit_quotes` - Insurance and financial institution deposits
    - `transaction_history` - Historical investment transactions
    - `user_profiles` - Sample user profiles for the system

  2. Data Sources
    - Mock data from the application's data files
    - Realistic Israeli financial market data
    - Government bonds (Makam) with various durations
    - Insurance company deposits and structured products

  3. Notes
    - All amounts in ILS (Israeli Shekels)
    - Rates are annual percentages
    - Valid dates set for realistic trading scenarios
*/

-- Insert sample user profiles
INSERT INTO user_profiles (id, email, name, role, is_active, games_played, wins, losses, win_rate) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@lqdt.co.il', 'מנהל מערכת', 'admin', true, 0, 0, 0, 0.00),
('550e8400-e29b-41d4-a716-446655440002', 'trader1@lqdt.co.il', 'סוחר ראשי', 'player', true, 15, 12, 3, 80.00),
('550e8400-e29b-41d4-a716-446655440003', 'analyst@lqdt.co.il', 'אנליסט השקעות', 'player', true, 8, 6, 2, 75.00);

-- Insert bank quotes (Government bonds - Makam)
INSERT INTO bank_quotes (id, bank_name, quote_type, rate, amount_min, amount_max, duration_days, valid_until, notes) VALUES
('bank-quote-1', 'מק״מ 30 יום', 'makam_short', 3.85, 5000000, 500000000, 30, NOW() + INTERVAL '24 hours', 'מק״מ קצר טווח - נזילות גבוהה'),
('bank-quote-2', 'מק״מ 60 יום', 'makam_short', 3.92, 10000000, 1000000000, 60, NOW() + INTERVAL '12 hours', 'מק״מ בינוני - איזון תשואה ונזילות'),
('bank-quote-3', 'מק״מ 90 יום', 'makam_medium', 4.05, 15000000, 750000000, 90, NOW() + INTERVAL '6 hours', 'מק״מ רבעוני - תשואה אטרקטיבית'),
('bank-quote-4', 'מק״מ 180 יום', 'makam_medium', 4.18, 20000000, 1000000000, 180, NOW() + INTERVAL '18 hours', 'מק״מ חצי שנתי - תשואה גבוהה יותר'),
('bank-quote-5', 'מק״מ 270 יום', 'makam_long', 4.32, 25000000, 1500000000, 270, NOW() + INTERVAL '15 hours', 'מק״מ ארוך - תשואה מקסימלית'),
('bank-quote-6', 'מק״מ 365 יום', 'makam_long', 4.45, 30000000, 2000000000, 365, NOW() + INTERVAL '20 hours', 'מק״מ שנתי - תשואה מרבית לטווח ארוך');

-- Insert deposit quotes (Insurance companies and financial institutions)
INSERT INTO deposit_quotes (id, institution_name, deposit_type, rate, amount_min, amount_max, duration_days, early_withdrawal_penalty, currency, risk_rating, valid_until, notes) VALUES
('deposit-quote-1', 'כלל ביטוח', 'fixed', 5.1, 1000000, 100000000, 30, 0.5, 'ILS', 'low', NOW() + INTERVAL '24 hours', 'פקדון קבוע, ביטוח מלא'),
('deposit-quote-2', 'מגדל חברה לביטוח', 'variable', 4.8, 5000000, 200000000, 60, 1.0, 'ILS', 'medium', NOW() + INTERVAL '12 hours', 'פקדון משתנה, תלוי במדד'),
('deposit-quote-3', 'הראל השקעות', 'structured', 6.2, 10000000, 300000000, 90, 2.0, 'ILS', 'medium-high', NOW() + INTERVAL '8 hours', 'מוצר מובנה, תשואה פוטנציאלית גבוהה'),
('deposit-quote-4', 'פסגות ניירות ערך', 'money_market', 4.5, 500000, 50000000, 14, 0.2, 'ILS', 'low', NOW() + INTERVAL '6 hours', 'קרן כספים, נזילות גבוהה');

-- Insert transaction history
INSERT INTO transaction_history (id, transaction_type, amount, source_institution, target_institution, rate, duration_days, status, executed_by, execution_date, maturity_date, actual_return, expected_return, notes) VALUES
('trans-1', 'investment', 52000000, 'עיריית תל אביב', 'בנק הפועלים', 4.2, 28, 'completed', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '5 days', NOW() + INTERVAL '23 days', 1680000, 1680000, 'השקעה מוצלחת בפיקדון קבוע'),
('trans-2', 'deposit', 34000000, 'משרד החינוך', 'כלל ביטוח', 5.1, 25, 'executed', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '3 days', NOW() + INTERVAL '22 days', 0, 1190000, 'פקדון בחברת ביטוח'),
('trans-3', 'maturity', 45000000, 'בנק לאומי', 'עיריית ירושלים', 4.1, 60, 'completed', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '60 days', NOW() - INTERVAL '1 day', 3075000, 3075000, 'פירעון מוצלח של פיקדון'),
('trans-4', 'transfer', 28000000, 'משרד הבריאות', 'בנק מזרחי טפחות', 4.3, 26, 'pending', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW() + INTERVAL '26 days', 0, 850000, 'העברה לפיקדון חדש'),
('trans-5', 'investment', 67000000, 'רשות מקומית חיפה', 'הראל השקעות', 6.2, 90, 'executed', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '1 day', NOW() + INTERVAL '89 days', 0, 10285000, 'השקעה במוצר מובנה');