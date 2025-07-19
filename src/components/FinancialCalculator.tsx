import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Calendar, DollarSign, Percent, Target } from 'lucide-react';

interface CalculationResult {
  dailyReturn: number;
  totalReturn: number;
  finalAmount: number;
  effectiveAnnualRate: number;
}

interface Strategy {
  id: string;
  name: string;
  annualRate: number;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const FinancialCalculator: React.FC = () => {
  const [amount, setAmount] = useState<string>('1000000');
  const [days, setDays] = useState<string>('30');
  const [interestRate, setInterestRate] = useState<string>('4.2');
  const [calculationType, setCalculationType] = useState<'manual' | 'strategy'>('manual');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('conservative');
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Available investment strategies
  const strategies: Strategy[] = [
    {
      id: 'conservative',
      name: 'אסטרטגיה שמרנית',
      annualRate: 3.8,
      description: 'פיזור בין פיקדונות ומק"מ ממשלתי',
      riskLevel: 'low'
    },
    {
      id: 'balanced',
      name: 'אסטרטגיה מאוזנת',
      annualRate: 4.5,
      description: 'תמהיל של כלים שונים לתשואה טובה יותר',
      riskLevel: 'medium'
    },
    {
      id: 'aggressive',
      name: 'אסטרטגיה אגרסיבית',
      annualRate: 5.2,
      description: 'מקסימיזציה של תשואה עם סיכון מבוקר',
      riskLevel: 'high'
    },
    {
      id: 'bank_deposit',
      name: 'פיקדון בנקאי',
      annualRate: 4.2,
      description: 'פיקדון קבוע בבנק מוביל',
      riskLevel: 'low'
    },
    {
      id: 'government_bonds',
      name: 'אג"ח ממשלתי',
      annualRate: 3.9,
      description: 'השקעה באג"ח ממשלת ישראל',
      riskLevel: 'low'
    },
    {
      id: 'corporate_bonds',
      name: 'אג"ח קונצרני',
      annualRate: 5.1,
      description: 'אג"ח של חברות בדירוג גבוה',
      riskLevel: 'medium'
    }
  ];

  const calculateReturns = (): void => {
    const principal = parseFloat(amount);
    const numDays = parseInt(days);
    let annualRate: number;

    if (calculationType === 'strategy') {
      const strategy = strategies.find(s => s.id === selectedStrategy);
      annualRate = strategy ? strategy.annualRate : 4.0;
    } else {
      annualRate = parseFloat(interestRate);
    }

    if (isNaN(principal) || isNaN(numDays) || isNaN(annualRate)) {
      setResult(null);
      return;
    }

    // Calculate daily return
    const dailyRate = annualRate / 100 / 365;
    const dailyReturn = principal * dailyRate;
    
    // Calculate total return for the period
    const totalReturn = dailyReturn * numDays;
    
    // Calculate final amount
    const finalAmount = principal + totalReturn;
    
    // Calculate effective annual rate (compound interest)
    const effectiveAnnualRate = (Math.pow(1 + dailyRate, 365) - 1) * 100;

    setResult({
      dailyReturn,
      totalReturn,
      finalAmount,
      effectiveAnnualRate
    });
  };

  useEffect(() => {
    calculateReturns();
  }, [amount, days, interestRate, calculationType, selectedStrategy]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(3)}%`;
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high'): string => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskText = (risk: 'low' | 'medium' | 'high'): string => {
    switch (risk) {
      case 'low': return 'נמוך';
      case 'medium': return 'בינוני';
      case 'high': return 'גבוה';
      default: return 'לא ידוע';
    }
  };

  return (
    <div className="bg-gray-900 border border-orange-500 rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-6 w-6 text-orange-400" />
        <h2 className="text-2xl font-bold text-orange-400">מחשבון פיננסי</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-orange-400 text-sm font-bold mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              סכום השקעה (₪)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded px-4 py-3 text-white font-mono text-lg focus:border-orange-500 focus:outline-none"
              placeholder="1,000,000"
            />
          </div>

          {/* Days Input */}
          <div>
            <label className="block text-orange-400 text-sm font-bold mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              מספר ימים
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded px-4 py-3 text-white font-mono text-lg focus:border-orange-500 focus:outline-none"
              placeholder="30"
            />
          </div>

          {/* Calculation Type */}
          <div>
            <label className="block text-orange-400 text-sm font-bold mb-2">
              <Target className="inline h-4 w-4 mr-1" />
              סוג חישוב
            </label>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setCalculationType('manual')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  calculationType === 'manual'
                    ? 'bg-orange-500 text-black'
                    : 'bg-gray-800 text-orange-400 hover:bg-gray-700'
                }`}
              >
                ריבית ידנית
              </button>
              <button
                onClick={() => setCalculationType('strategy')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  calculationType === 'strategy'
                    ? 'bg-orange-500 text-black'
                    : 'bg-gray-800 text-orange-400 hover:bg-gray-700'
                }`}
              >
                אסטרטגיה
              </button>
            </div>

            {calculationType === 'manual' ? (
              <div>
                <label className="block text-orange-400 text-sm font-bold mb-2">
                  <Percent className="inline h-4 w-4 mr-1" />
                  ריבית שנתית (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded px-4 py-3 text-white font-mono text-lg focus:border-orange-500 focus:outline-none"
                  placeholder="4.2"
                />
              </div>
            ) : (
              <div>
                <label className="block text-orange-400 text-sm font-bold mb-2">
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  בחר אסטרטגיה
                </label>
                <select
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                >
                  {strategies.map((strategy) => (
                    <option key={strategy.id} value={strategy.id}>
                      {strategy.name} - {strategy.annualRate}%
                    </option>
                  ))}
                </select>
                
                {/* Strategy Details */}
                {calculationType === 'strategy' && (
                  <div className="mt-3 p-3 bg-black border border-gray-700 rounded">
                    {(() => {
                      const strategy = strategies.find(s => s.id === selectedStrategy);
                      return strategy ? (
                        <div>
                          <div className="text-white font-bold">{strategy.name}</div>
                          <div className="text-gray-400 text-sm mt-1">{strategy.description}</div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-orange-400">ריבית שנתית: {strategy.annualRate}%</span>
                            <span className={`font-bold ${getRiskColor(strategy.riskLevel)}`}>
                              סיכון: {getRiskText(strategy.riskLevel)}
                            </span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-orange-400 mb-4">תוצאות החישוב</h3>
          
          {result ? (
            <div className="space-y-4">
              {/* Daily Return */}
              <div className="bg-black border border-gray-700 rounded p-4">
                <div className="text-gray-400 text-sm">תשואה יומית</div>
                <div className="text-green-400 text-2xl font-mono font-bold">
                  {formatCurrency(result.dailyReturn)}
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  {formatCurrency(result.dailyReturn / parseFloat(amount) * 100)} ליום
                </div>
              </div>

              {/* Total Return */}
              <div className="bg-black border border-gray-700 rounded p-4">
                <div className="text-gray-400 text-sm">תשואה כללית ({days} ימים)</div>
                <div className="text-orange-400 text-2xl font-mono font-bold">
                  {formatCurrency(result.totalReturn)}
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  {formatPercent(result.totalReturn / parseFloat(amount) * 100)} מהסכום
                </div>
              </div>

              {/* Final Amount */}
              <div className="bg-black border border-orange-500 rounded p-4">
                <div className="text-orange-400 text-sm">סכום סופי</div>
                <div className="text-white text-3xl font-mono font-bold">
                  {formatCurrency(result.finalAmount)}
                </div>
                <div className="text-green-400 text-sm mt-1">
                  רווח: {formatCurrency(result.finalAmount - parseFloat(amount))}
                </div>
              </div>

              {/* Effective Annual Rate */}
              <div className="bg-black border border-gray-700 rounded p-4">
                <div className="text-gray-400 text-sm">ריבית אפקטיבית שנתית</div>
                <div className="text-blue-400 text-xl font-mono font-bold">
                  {formatPercent(result.effectiveAnnualRate)}
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  (כולל ריבית דריבית)
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-black border border-gray-700 rounded p-4">
                <div className="text-gray-400 text-sm mb-2">סטטיסטיקות נוספות</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">תשואה שבועית:</span>
                    <div className="text-white font-mono">
                      {formatCurrency(result.dailyReturn * 7)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">תשואה חודשית:</span>
                    <div className="text-white font-mono">
                      {formatCurrency(result.dailyReturn * 30)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">ROI יומי:</span>
                    <div className="text-green-400 font-mono">
                      {formatPercent(result.dailyReturn / parseFloat(amount) * 100)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">ROI תקופה:</span>
                    <div className="text-orange-400 font-mono">
                      {formatPercent(result.totalReturn / parseFloat(amount) * 100)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black border border-gray-700 rounded p-8 text-center">
              <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">הזן נתונים תקינים לחישוב התשואה</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialCalculator;