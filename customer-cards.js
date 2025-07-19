
const { useState, useEffect } = React;
const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } = window.Recharts;
const { TrendingUp, TrendingDown, DollarSign, Calendar, Bell, Target, Briefcase, AlertCircle, CheckCircle, Play, Clock, ArrowUp, ArrowDown, Activity, Zap } = window.lucide;

const LiquidityManagementSystem = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock daily transactions
  const dailyTransactions = [
    { id: 1, date: '2025-07-12', amount: 52000000, source: 'עיריית תל אביב', time: '09:15', status: 'pending', daysToPayment: 28 },
    { id: 2, date: '2025-07-12', amount: 34000000, source: 'משרד החינוך', time: '11:30', status: 'invested', daysToPayment: 25 },
    { id: 3, date: '2025-07-11', amount: 67000000, source: 'רשות מקומית חיפה', time: '08:45', status: 'pending', daysToPayment: 29 },
    { id: 4, date: '2025-07-11', amount: 28000000, source: 'משרד הבריאות', time: '14:20', status: 'invested', daysToPayment: 26 },
    { id: 5, date: '2025-07-10', amount: 45000000, source: 'עיריית ירושלים', time: '10:10', status: 'pending', daysToPayment: 30 },
  ];

  // Investment strategies based on timeframe
  const getStrategies = (amount, days) => {
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

  // Timeline data with projected returns
  const generateTimelineData = (amount, strategy, days) => {
    const data = [];
    const dailyReturn = strategy ? strategy.dailyReturn : 0;
    
    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        day: i,
        principal: amount,
        return: dailyReturn * i,
        total: amount + (dailyReturn * i)
      });
    }
    
    return data;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-500';
      case 'invested': return 'bg-green-500';
      case 'matured': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'ממתין להשקעה';
      case 'invested': return 'מושקע';
      case 'matured': return 'מומש';
      default: return 'לא ידוע';
    }
  };

  const executeStrategy = (strategy) => {
    setSelectedStrategy(strategy);
    // Simulate strategy execution
    setTimeout(() => {
      setSelectedTransaction(null);
      setSelectedStrategy(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6" dir="rtl">
      {/* Bloomberg-style Header */}
      <div className="mb-8 border-b border-orange-500 pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-500 px-3 py-1 rounded text-black font-bold">LQDT</div>
            <div>
              <h1 className="text-3xl font-bold text-orange-400">מערכת ניהול נזילות</h1>
              <p className="text-orange-300 mt-1">טרמינל השקעות | חברה 8B ₪</p>
            </div>
          </div>
          <div className="text-left font-mono">
            <div className="text-2xl text-orange-400">{currentTime.toLocaleTimeString('he-IL')}</div>
            <div className="text-sm text-orange-300">{currentTime.toLocaleDateString('he-IL')}</div>
          </div>
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
          <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            זרימת עסקאות יומית
          </h2>
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
          
          {selectedTransaction && selectedStrategy ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={generateTimelineData(selectedTransaction.amount, selectedStrategy, parseInt(selectedTimeframe))}>
                <defs>
                  <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#f59e0b" />
                <YAxis stroke="#f59e0b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #f59e0b' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorReturn)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Activity className="h-16 w-16 mx-auto mb-4 text-orange-400" />
                <p className="text-lg">בחר עסקה לצפייה בתחזית תשואות</p>
                <p className="text-sm mt-2">לחץ על כרטיסייה בצד שמאל</p>
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
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<LiquidityManagementSystem />);
