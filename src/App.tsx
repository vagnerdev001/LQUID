import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, ArrowUp, CheckCircle, Zap, Building2, Coins, History, X, Calculator } from 'lucide-react';
import { mockBankQuotes, mockDepositQuotes, mockTransactionHistory } from './data/mockData';
import { mockProjectedTransactions } from './data/mockData';
import { historicalMonthlyData, calculateYearToDateAverages, generateProjectedReturns, getPerformanceComparison } from './data/historicalData';
import type { BankQuote, DepositQuote, TransactionHistory } from './lib/supabase';
import FinancialCalculator from './components/FinancialCalculator';
import TradingQuotes from './components/TradingQuotes';

interface Transaction {
  id: number;
  date: string;
  amount: number;
  source: string;
  time: string;
  status: 'pending' | 'invested' | 'matured';
  daysToPayment: number;
}

interface Strategy {
  id: number;
  name: string;
  description: string;
  expectedReturn: number;
  annualRate: number;
  risk: string;
  allocation: Array<{
    instrument: string;
    percentage: number;
    rate: number;
  }>;
  color: string;
  dailyReturn: number;
}

type ActiveModal = 'bank-quotes' | 'deposit-quotes' | 'transaction-history' | 'financial-calculator' | null;

const LiquidityManagementSystem: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [showProjectedTransactions, setShowProjectedTransactions] = useState(false);
  const [projectedData, setProjectedData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any>(null);

  // Calculate projected returns and performance data
  useEffect(() => {
    const days = parseInt(selectedTimeframe);
    const projected = generateProjectedReturns(days);
    const performance = getPerformanceComparison();
    
    setProjectedData(projected);
    setPerformanceData(performance);
  }, [selectedTimeframe]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock daily transactions
  const dailyTransactions: Transaction[] = [
    { id: 1, date: '2025-07-12', amount: 52000000, source: 'עיריית תל אביב', time: '09:15', status: 'pending', daysToPayment: 28 },
    { id: 2, date: '2025-07-12', amount: 34000000, source: 'משרד החינוך', time: '11:30', status: 'invested', daysToPayment: 25 },
    { id: 3, date: '2025-07-11', amount: 67000000, source: 'רשות מקומית חיפה', time: '08:45', status: 'pending', daysToPayment: 29 },
    { id: 4, date: '2025-07-11', amount: 28000000, source: 'משרד הבריאות', time: '14:20', status: 'invested', daysToPayment: 26 },
    { id: 5, date: '2025-07-10', amount: 45000000, source: 'עיריית ירושלים', time: '10:10', status: 'pending', daysToPayment: 30 },
  ];

  // Investment strategies based on timeframe
  const getStrategies = (amount: number, days: number): Strategy[] => {
    const strategies = [
      {
        id: 1,
        name: 'אסטרטגיה שמרנית',
        description: 'פיזור בין פיקדונות ומק"מ ממשלתי',
        expectedReturn: amount * (3.8 / 100) * (days / 365),
        annualRate: 3.8,
        risk: 'נמוך',
        allocation: [
          { instrument: 'פיקדון בנק הפועלים', percentage: 60, rate: 4.2 },
          { instrument: 'מק"מ ממשלתי', percentage: 40, rate: 3.8 }
        ],
        color: '#22c55e'
      },
      {
        id: 2,
        name: 'אסטרטגיה מאוזנת',
        description: 'תמהיל של כלים שונים לתשואה טובה יותר',
        expectedReturn: amount * (4.5 / 100) * (days / 365),
        annualRate: 4.5,
        risk: 'בינוני',
        allocation: [
          { instrument: 'פיקדון בנק הפועלים', percentage: 40, rate: 4.2 },
          { instrument: 'אג"ח קונצרני AAA', percentage: 35, rate: 5.1 },
          { instrument: 'מק"מ ממשלתי', percentage: 25, rate: 3.8 }
        ],
        color: '#f59e0b'
      },
      {
        id: 3,
        name: 'אסטרטגיה אגרסיבית',
        description: 'מקסימיזציה של תשואה עם סיכון מבוקר',
        expectedReturn: amount * (5.2 / 100) * (days / 365),
        annualRate: 5.2,
        risk: 'בינוני-גבוה',
        allocation: [
          { instrument: 'אג"ח קונצרני AAA', percentage: 50, rate: 5.1 },
          { instrument: 'אג"ח קונצרני AA', percentage: 30, rate: 5.8 },
          { instrument: 'פיקדון בנק הפועלים', percentage: 20, rate: 4.2 }
        ],
        color: '#ef4444'
      }
    ];

    return strategies.map(strategy => ({
      ...strategy,
      expectedReturn: amount * (strategy.annualRate / 100) * (days / 365),
      dailyReturn: amount * (strategy.annualRate / 100) / 365
    }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-orange-500';
      case 'invested': return 'bg-green-500';
      case 'matured': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending': return 'ממתין להשקעה';
      case 'invested': return 'מושקע';
      case 'matured': return 'מומש';
      default: return 'לא ידוע';
    }
  };

  const executeStrategy = (strategy: Strategy): void => {
    setSelectedStrategy(strategy);
    // Simulate strategy execution
    setTimeout(() => {
      setSelectedTransaction(null);
      setSelectedStrategy(null);
    }, 2000);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTransactionStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'executed': return 'text-blue-400';
      case 'pending': return 'text-orange-400';
      case 'cancelled': return 'text-red-400';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getTransactionStatusText = (status: string): string => {
    switch (status) {
      case 'completed': return 'הושלם';
      case 'executed': return 'בוצע';
      case 'pending': return 'ממתין';
      case 'cancelled': return 'בוטל';
      case 'failed': return 'נכשל';
      default: return 'לא ידוע';
    }
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'medium-high': return 'text-orange-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6" dir="rtl">
      {/* Bloomberg-style Header */}
      <div className="mb-4 border-b border-orange-500 pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-orange-500 px-1 py-0.5 rounded text-black font-bold text-xs">LQDT</div>
            <div>
              <h1 className="text-lg font-bold text-orange-400">מערכת ניהול נזילות</h1>
              <p className="text-orange-300 text-xs">טרמינל השקעות | חברה 8B ₪</p>
            </div>
          </div>
          <div className="text-left font-mono">
            <div className="text-base text-orange-400">{currentTime.toLocaleTimeString('he-IL')}</div>
            <div className="text-sm text-orange-300">{currentTime.toLocaleDateString('he-IL')}</div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setActiveModal('bank-quotes')}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-orange-500 hover:border-orange-400 px-4 py-2 rounded-lg transition-all duration-300"
          >
            <Building2 className="h-5 w-5 text-orange-400" />
            <span className="text-orange-400 font-bold">ציטוטים מבנקים</span>
          </button>
          <button
            onClick={() => setActiveModal('deposit-quotes')}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-orange-500 hover:border-orange-400 px-4 py-2 rounded-lg transition-all duration-300"
          >
            <Coins className="h-5 w-5 text-orange-400" />
            <span className="text-orange-400 font-bold">ציטוטי פקדונות</span>
          </button>
          <button
            onClick={() => setActiveModal('transaction-history')}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-orange-500 hover:border-orange-400 px-4 py-2 rounded-lg transition-all duration-300"
          >
            <History className="h-5 w-5 text-orange-400" />
            <span className="text-orange-400 font-bold">הסטוריית עסקאות</span>
          </button>
          <button
            onClick={() => setActiveModal('financial-calculator')}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-orange-500 hover:border-orange-400 px-4 py-2 rounded-lg transition-all duration-300"
          >
            <Calculator className="h-5 w-5 text-orange-400" />
            <span className="text-orange-400 font-bold">מחשבון פיננסי</span>
          </button>
        </div>
      </div>

      {/* Bloomberg-style Top Stats */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900 border border-orange-500 rounded p-4">
          <div className="text-orange-400 text-sm font-bold">יתרה זמינה</div>
          <div className="text-white text-xl font-mono">₪190M</div>
          <div className="text-green-400 text-sm flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            +2.3%
          </div>
        </div>
        <div className="bg-gray-900 border border-orange-500 rounded p-4">
          <div className="text-orange-400 text-sm font-bold">תשואה יומית</div>
          <div className="text-white text-xl font-mono">₪485K</div>
          <div className="text-green-400 text-sm flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            +4.2%
          </div>
        </div>
        <div className="bg-gray-900 border border-orange-500 rounded p-4">
          <div className="text-orange-400 text-sm font-bold">ROI שנתי</div>
          <div className="text-white text-xl font-mono">4.8%</div>
          <div className="text-green-400 text-sm flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            +0.5%
          </div>
        </div>
        <div className="bg-gray-900 border border-orange-500 rounded p-4">
          <div className="text-orange-400 text-sm font-bold">עסקאות היום</div>
          <div className="text-white text-xl font-mono">5</div>
          <div className="text-orange-400 text-sm">₪226M</div>
        </div>
        <div className="bg-gray-900 border border-orange-500 rounded p-4">
          <div className="text-orange-400 text-sm font-bold">סיכון תיק</div>
          <div className="text-white text-xl font-mono">נמוך</div>
          <div className="text-yellow-400 text-sm">2.1/10</div>
        </div>
        <div className="bg-gray-900 border border-orange-500 rounded p-4">
          <div className="text-orange-400 text-sm font-bold">Alpha vs BM</div>
          <div className="text-white text-xl font-mono">+0.8%</div>
          <div className="text-green-400 text-sm">₪32M</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Daily Transactions Feed */}
        <div className="bg-gray-900 border border-orange-500 rounded p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-orange-400 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              {showProjectedTransactions ? 'תזרים עסקאות חזוי' : 'זרימת עסקאות יומית'}
            </h2>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${!showProjectedTransactions ? 'text-orange-400' : 'text-gray-400'}`}>
                יומי
              </span>
              <button
                onClick={() => setShowProjectedTransactions(!showProjectedTransactions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showProjectedTransactions ? 'bg-orange-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showProjectedTransactions ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${showProjectedTransactions ? 'text-orange-400' : 'text-gray-400'}`}>
                חזוי
              </span>
            </div>
          </div>
          
          {!showProjectedTransactions ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dailyTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="p-4 bg-black border border-gray-700 rounded cursor-pointer hover:border-orange-500 transition-all duration-300"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-mono text-orange-400 text-lg">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-sm text-gray-400">{transaction.source}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">{transaction.time}</div>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      {transaction.daysToPayment} ימים לתשלום
                    </div>
                    <div className="text-sm text-orange-400">
                      לחץ לאסטרטגיות →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mockProjectedTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="p-4 bg-black border border-gray-700 rounded hover:border-blue-500 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-mono text-blue-400 text-lg">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-sm text-gray-400">{transaction.source_institution}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {new Date(transaction.transaction_date).toLocaleDateString('he-IL')}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        transaction.probability >= 0.9 ? 'bg-green-500' :
                        transaction.probability >= 0.8 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}>
                        {(transaction.probability * 100).toFixed(0)}% סיכוי
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      {transaction.duration_days} ימים השקעה
                    </div>
                    <div className="text-sm text-green-400">
                      תשואה צפויה: {formatCurrency(transaction.expected_return)}
                    </div>
                  </div>
                  {transaction.notes && (
                    <div className="text-xs text-gray-500 italic border-t border-gray-700 pt-2">
                      {transaction.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Summary Statistics */}
          {showProjectedTransactions && (
            <div className="mt-4 p-4 bg-black border border-gray-700 rounded">
              <h4 className="text-lg font-bold text-blue-400 mb-3">סיכום תזרים חזוי</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatCurrency(mockProjectedTransactions.reduce((sum, t) => sum + t.amount, 0))}
                  </div>
                  <div className="text-sm text-gray-400">סך הכל צפוי</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(mockProjectedTransactions.reduce((sum, t) => sum + t.expected_return, 0))}
                  </div>
                  <div className="text-sm text-gray-400">תשואה צפויה</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {(mockProjectedTransactions.reduce((sum, t) => sum + t.probability, 0) / mockProjectedTransactions.length * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-400">ממוצע סיכוי</div>
                </div>
              </div>
            </div>
          )}
          
          {/* YTD Performance Summary - only show for daily transactions */}
          {!showProjectedTransactions && performanceData && (
            <div className="mt-4 p-4 bg-black border border-gray-700 rounded">
              <h4 className="text-lg font-bold text-orange-400 mb-3">ביצועים מתחילת השנה</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">
                    {formatCurrency(performanceData.overall.totalReturn)}
                  </div>
                  <div className="text-sm text-gray-400">תשואה כוללת</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-400">
                    {performanceData.overall.annualRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">תשואה שנתית</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Chart Area */}
        <div className="xl:col-span-2 bg-gray-900 border border-orange-500 rounded p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-orange-400">זרימת תשואות חזויה</h2>
            <div className="flex space-x-2">
              {['7', '14', '30', '60', '90'].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedTimeframe(days)}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedTimeframe === days 
                      ? 'bg-orange-500 text-black' 
                      : 'bg-gray-800 text-orange-400 hover:bg-gray-700'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
          </div>
          
          {projectedData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={projectedData}>
                  <defs>
                    <linearGradient id="colorCurrentAccount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorBankDeposits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorLqdtSystem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#f59e0b" />
                  <YAxis stroke="#f59e0b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #f59e0b' }}
                    formatter={(value, name) => [
                      formatCurrency(value as number),
                      name === 'currentAccountReturn' ? 'תשואה עו"ש' :
                      name === 'bankDepositsReturn' ? 'תשואה פקדונות' :
                      name === 'lqdtSystemReturn' ? 'תשואה LQDT' :
                      name === 'totalReturn' ? 'תשואה כוללת' : name
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="currentAccountReturn" 
                    stackId="1"
                    stroke="#ef4444" 
                    strokeWidth={1}
                    fillOpacity={1} 
                    fill="url(#colorCurrentAccount)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bankDepositsReturn" 
                    stackId="1"
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorBankDeposits)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lqdtSystemReturn" 
                    stackId="1"
                    stroke="#22c55e" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorLqdtSystem)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Performance Metrics */}
              {performanceData && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div className="bg-black border border-red-500 rounded p-3 text-center">
                    <div className="text-red-400 text-sm">עו"ש</div>
                    <div className="text-white font-mono">{performanceData.currentAccount.annualRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400">ללא ריבית</div>
                  </div>
                  <div className="bg-black border border-orange-500 rounded p-3 text-center">
                    <div className="text-orange-400 text-sm">פקדונות</div>
                    <div className="text-white font-mono">{performanceData.bankDeposits.annualRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400">שנתי</div>
                  </div>
                  <div className="bg-black border border-green-500 rounded p-3 text-center">
                    <div className="text-green-400 text-sm">LQDT</div>
                    <div className="text-white font-mono">{performanceData.lqdtSystem.annualRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400">שנתי</div>
                  </div>
                  <div className="bg-black border border-blue-500 rounded p-3 text-center">
                    <div className="text-blue-400 text-sm">כולל</div>
                    <div className="text-white font-mono">{performanceData.overall.annualRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400">ממוצע</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Activity className="h-16 w-16 mx-auto mb-4 text-orange-400" />
                <p className="text-lg">טוען נתוני תשואות חזויות...</p>
                <p className="text-sm mt-2">מבוסס על נתונים מתחילת השנה</p>
              </div>
            </div>
          )}
        </div>

        {/* Strategy Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-orange-500 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-orange-400">אסטרטגיות השקעה</h3>
                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-black border border-gray-700 rounded">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">סכום</div>
                    <div className="text-orange-400 text-xl font-mono">{formatCurrency(selectedTransaction.amount)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">ימים להשקעה</div>
                    <div className="text-white text-xl">{selectedTransaction.daysToPayment}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">מקור</div>
                    <div className="text-white text-xl">{selectedTransaction.source}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {getStrategies(selectedTransaction.amount, selectedTransaction.daysToPayment).map((strategy) => (
                  <div 
                    key={strategy.id}
                    className={`p-4 bg-black border rounded cursor-pointer transition-all ${
                      selectedStrategy?.id === strategy.id 
                        ? 'border-orange-500 bg-orange-900/20' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-white text-lg">{strategy.name}</h4>
                        <p className="text-gray-400 text-sm">{strategy.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: strategy.color }}>
                          {formatCurrency(strategy.expectedReturn)}
                        </div>
                        <div className="text-sm text-gray-400">תשואה צפויה</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-gray-400 text-sm">תשואה שנתית</div>
                        <div className="text-white font-mono">{strategy.annualRate}%</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">רמת סיכון</div>
                        <div className="text-white">{strategy.risk}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">תשואה יומית</div>
                        <div className="text-white font-mono">{formatCurrency(strategy.dailyReturn)}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-gray-400 text-sm font-bold">פיזור השקעה:</div>
                      {strategy.allocation.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-white">{item.instrument}</span>
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2">{item.percentage}%</span>
                            <span className="text-green-400">{item.rate}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => selectedStrategy && executeStrategy(selectedStrategy)}
                  disabled={!selectedStrategy}
                  className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
                    selectedStrategy
                      ? 'bg-orange-500 hover:bg-orange-600 text-black' 
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Zap className="h-5 w-5 mr-2" />
                    שדר אסטרטגיה
                  </div>
                </button>
                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Strategy Execution Confirmation */}
        {selectedStrategy && (
          <div className="fixed top-4 right-4 bg-orange-500 text-black px-6 py-4 rounded-lg shadow-lg z-50 animate-pulse">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <div>
                <div className="font-bold">אסטרטגיה בביצוע</div>
                <div className="text-sm">{selectedStrategy.name}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bank Quotes Modal */}
      {activeModal === 'bank-quotes' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-orange-500 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                מק״מים - מסחר חי
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <TradingQuotes />
          </div>
        </div>
      )}

      {/* Deposit Quotes Modal */}
      {activeModal === 'deposit-quotes' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-orange-500 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
                <Coins className="h-6 w-6" />
                ציטוטי פקדונות
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid gap-4">
              {mockDepositQuotes.map((quote) => (
                <div key={quote.id} className="p-4 bg-black border border-gray-700 rounded hover:border-orange-500 transition-all">
                  <div className="grid grid-cols-7 gap-4 items-center">
                    <div>
                      <div className="text-orange-400 font-bold">{quote.institution_name}</div>
                      <div className="text-sm text-gray-400">
                        {quote.deposit_type === 'fixed' ? 'קבוע' : 
                         quote.deposit_type === 'variable' ? 'משתנה' : 
                         quote.deposit_type === 'structured' ? 'מובנה' : 'כספים'}
                      </div>
                    </div>
                    <div>
                      <div className="text-white text-lg font-mono">{quote.rate}%</div>
                      <div className="text-sm text-gray-400">ריבית</div>
                    </div>
                    <div>
                      <div className="text-white">{formatCurrency(quote.amount_min)}</div>
                      <div className="text-sm text-gray-400">מינימום</div>
                    </div>
                    <div>
                      <div className="text-white">{quote.duration_days} ימים</div>
                      <div className="text-sm text-gray-400">משך</div>
                    </div>
                    <div>
                      <div className="text-white">{quote.early_withdrawal_penalty}%</div>
                      <div className="text-sm text-gray-400">קנס משיכה</div>
                    </div>
                    <div>
                      <div className={`font-bold ${getRiskColor(quote.risk_rating)}`}>
                        {quote.risk_rating === 'low' ? 'נמוך' :
                         quote.risk_rating === 'medium' ? 'בינוני' :
                         quote.risk_rating === 'medium-high' ? 'בינוני-גבוה' : 'גבוה'}
                      </div>
                      <div className="text-sm text-gray-400">סיכון</div>
                    </div>
                    <div>
                      <div className="text-orange-400">{formatTime(quote.valid_until)}</div>
                      <div className="text-sm text-gray-400">תוקף עד</div>
                    </div>
                  </div>
                  {quote.notes && (
                    <div className="mt-2 text-sm text-gray-400 border-t border-gray-700 pt-2">
                      {quote.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {activeModal === 'transaction-history' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-orange-500 rounded-lg p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
                <History className="h-6 w-6" />
                הסטוריית עסקאות
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid gap-4">
              {mockTransactionHistory.map((transaction) => (
                <div key={transaction.id} className="p-4 bg-black border border-gray-700 rounded hover:border-orange-500 transition-all">
                  <div className="grid grid-cols-8 gap-4 items-center">
                    <div>
                      <div className="text-orange-400 font-bold">
                        {transaction.transaction_type === 'investment' ? 'השקעה' :
                         transaction.transaction_type === 'deposit' ? 'פיקדון' :
                         transaction.transaction_type === 'withdrawal' ? 'משיכה' :
                         transaction.transaction_type === 'transfer' ? 'העברה' : 'פירעון'}
                      </div>
                      <div className="text-sm text-gray-400">{formatDate(transaction.execution_date)}</div>
                    </div>
                    <div>
                      <div className="text-white text-lg font-mono">{formatCurrency(transaction.amount)}</div>
                      <div className="text-sm text-gray-400">סכום</div>
                    </div>
                    <div>
                      <div className="text-white">{transaction.source_institution}</div>
                      <div className="text-sm text-gray-400">מקור</div>
                    </div>
                    <div>
                      <div className="text-white">{transaction.target_institution || '-'}</div>
                      <div className="text-sm text-gray-400">יעד</div>
                    </div>
                    <div>
                      <div className="text-white">{transaction.rate ? `${transaction.rate}%` : '-'}</div>
                      <div className="text-sm text-gray-400">ריבית</div>
                    </div>
                    <div>
                      <div className="text-white">{transaction.duration_days ? `${transaction.duration_days} ימים` : '-'}</div>
                      <div className="text-sm text-gray-400">משך</div>
                    </div>
                    <div>
                      <div className={`font-bold ${getTransactionStatusColor(transaction.status)}`}>
                        {getTransactionStatusText(transaction.status)}
                      </div>
                      <div className="text-sm text-gray-400">סטטוס</div>
                    </div>
                    <div>
                      <div className="text-white">{formatCurrency(transaction.actual_return || transaction.expected_return)}</div>
                      <div className="text-sm text-gray-400">תשואה</div>
                    </div>
                  </div>
                  {transaction.notes && (
                    <div className="mt-2 text-sm text-gray-400 border-t border-gray-700 pt-2">
                      {transaction.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Financial Calculator Modal */}
      {activeModal === 'financial-calculator' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-orange-500 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
                <Calculator className="h-6 w-6" />
                מחשבון פיננסי
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <FinancialCalculator />
          </div>
        </div>
      )}
    </div>
  );
};

export default LiquidityManagementSystem;