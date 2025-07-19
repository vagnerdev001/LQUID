// Historical data from beginning of year for projected returns calculation
export interface MonthlyData {
  month: string;
  date: string;
  currentAccount: number; // עו"ש
  bankDeposits: number; // פקדונות בנקים
  lqdtSystem: number; // מערכת LQDT
  totalFunds: number; // סך הכל
  currentAccountReturn: number; // תשואה עו"ש
  bankDepositsReturn: number; // תשואה פקדונות
  lqdtSystemReturn: number; // תשואה LQDT
  totalReturn: number; // סך תשואה
}

// Historical data from January 2025 to current date
export const historicalMonthlyData: MonthlyData[] = [
  {
    month: 'ינואר 2025',
    date: '2025-01-31',
    currentAccount: 45000000, // 45M בעו"ש
    bankDeposits: 120000000, // 120M בפקדונות
    lqdtSystem: 85000000, // 85M במערכת LQDT
    totalFunds: 250000000,
    currentAccountReturn: 0, // אין תשואה בעו"ש
    bankDepositsReturn: 420000, // 4.2% שנתי
    lqdtSystemReturn: 425000, // 6.0% שנתי ממוצע
    totalReturn: 845000
  },
  {
    month: 'פברואר 2025',
    date: '2025-02-28',
    currentAccount: 38000000,
    bankDeposits: 135000000,
    lqdtSystem: 102000000,
    totalFunds: 275000000,
    currentAccountReturn: 0,
    bankDepositsReturn: 472500,
    lqdtSystemReturn: 510000,
    totalReturn: 982500
  },
  {
    month: 'מרץ 2025',
    date: '2025-03-31',
    currentAccount: 42000000,
    bankDeposits: 128000000,
    lqdtSystem: 115000000,
    totalFunds: 285000000,
    currentAccountReturn: 0,
    bankDepositsReturn: 448000,
    lqdtSystemReturn: 575000,
    totalReturn: 1023000
  },
  {
    month: 'אפריל 2025',
    date: '2025-04-30',
    currentAccount: 35000000,
    bankDeposits: 145000000,
    lqdtSystem: 125000000,
    totalFunds: 305000000,
    currentAccountReturn: 0,
    bankDepositsReturn: 507500,
    lqdtSystemReturn: 625000,
    totalReturn: 1132500
  },
  {
    month: 'מאי 2025',
    date: '2025-05-31',
    currentAccount: 40000000,
    bankDeposits: 138000000,
    lqdtSystem: 142000000,
    totalFunds: 320000000,
    currentAccountReturn: 0,
    bankDepositsReturn: 483000,
    lqdtSystemReturn: 710000,
    totalReturn: 1193000
  },
  {
    month: 'יוני 2025',
    date: '2025-06-30',
    currentAccount: 33000000,
    bankDeposits: 152000000,
    lqdtSystem: 155000000,
    totalFunds: 340000000,
    currentAccountReturn: 0,
    bankDepositsReturn: 532000,
    lqdtSystemReturn: 775000,
    totalReturn: 1307000
  },
  {
    month: 'יולי 2025',
    date: '2025-07-12',
    currentAccount: 28000000, // ירידה בעו"ש
    bankDeposits: 162000000, // עלייה בפקדונות
    lqdtSystem: 175000000, // עלייה במערכת LQDT
    totalFunds: 365000000,
    currentAccountReturn: 0,
    bankDepositsReturn: 567000,
    lqdtSystemReturn: 875000,
    totalReturn: 1442000
  }
];

// Calculate averages from beginning of year
export const calculateYearToDateAverages = () => {
  const totalMonths = historicalMonthlyData.length;
  
  const avgCurrentAccount = historicalMonthlyData.reduce((sum, data) => sum + data.currentAccount, 0) / totalMonths;
  const avgBankDeposits = historicalMonthlyData.reduce((sum, data) => sum + data.bankDeposits, 0) / totalMonths;
  const avgLqdtSystem = historicalMonthlyData.reduce((sum, data) => sum + data.lqdtSystem, 0) / totalMonths;
  const avgTotalFunds = historicalMonthlyData.reduce((sum, data) => sum + data.totalFunds, 0) / totalMonths;
  
  const totalCurrentAccountReturn = historicalMonthlyData.reduce((sum, data) => sum + data.currentAccountReturn, 0);
  const totalBankDepositsReturn = historicalMonthlyData.reduce((sum, data) => sum + data.bankDepositsReturn, 0);
  const totalLqdtSystemReturn = historicalMonthlyData.reduce((sum, data) => sum + data.lqdtSystemReturn, 0);
  const totalReturn = historicalMonthlyData.reduce((sum, data) => sum + data.totalReturn, 0);
  
  // Calculate effective annual rates
  const currentAccountRate = 0; // עו"ש אין ריבית
  const bankDepositsRate = (totalBankDepositsReturn / avgBankDeposits) * (12 / totalMonths) * 100;
  const lqdtSystemRate = (totalLqdtSystemReturn / avgLqdtSystem) * (12 / totalMonths) * 100;
  const overallRate = (totalReturn / avgTotalFunds) * (12 / totalMonths) * 100;
  
  return {
    averages: {
      currentAccount: avgCurrentAccount,
      bankDeposits: avgBankDeposits,
      lqdtSystem: avgLqdtSystem,
      totalFunds: avgTotalFunds
    },
    totalReturns: {
      currentAccount: totalCurrentAccountReturn,
      bankDeposits: totalBankDepositsReturn,
      lqdtSystem: totalLqdtSystemReturn,
      total: totalReturn
    },
    annualRates: {
      currentAccount: currentAccountRate,
      bankDeposits: bankDepositsRate,
      lqdtSystem: lqdtSystemRate,
      overall: overallRate
    },
    monthsCount: totalMonths
  };
};

// Generate projected returns for next period
export const generateProjectedReturns = (days: number) => {
  const ytdData = calculateYearToDateAverages();
  const projectedData = [];
  
  for (let i = 0; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Daily returns based on YTD averages
    const dailyCurrentAccountReturn = 0; // עו"ש אין ריבית
    const dailyBankDepositsReturn = (ytdData.averages.bankDeposits * ytdData.annualRates.bankDeposits / 100) / 365;
    const dailyLqdtSystemReturn = (ytdData.averages.lqdtSystem * ytdData.annualRates.lqdtSystem / 100) / 365;
    const dailyTotalReturn = dailyCurrentAccountReturn + dailyBankDepositsReturn + dailyLqdtSystemReturn;
    
    projectedData.push({
      date: date.toISOString().split('T')[0],
      day: i,
      currentAccount: ytdData.averages.currentAccount,
      bankDeposits: ytdData.averages.bankDeposits,
      lqdtSystem: ytdData.averages.lqdtSystem,
      totalFunds: ytdData.averages.totalFunds,
      currentAccountReturn: dailyCurrentAccountReturn * i,
      bankDepositsReturn: dailyBankDepositsReturn * i,
      lqdtSystemReturn: dailyLqdtSystemReturn * i,
      totalReturn: dailyTotalReturn * i,
      cumulativeTotal: ytdData.averages.totalFunds + (dailyTotalReturn * i)
    });
  }
  
  return projectedData;
};

// Performance comparison data
export const getPerformanceComparison = () => {
  const ytdData = calculateYearToDateAverages();
  
  return {
    currentAccount: {
      name: 'עו"ש (ללא ריבית)',
      avgAmount: ytdData.averages.currentAccount,
      annualRate: ytdData.annualRates.currentAccount,
      totalReturn: ytdData.totalReturns.currentAccount,
      color: '#ef4444', // אדום - לא משתלם
      efficiency: 0
    },
    bankDeposits: {
      name: 'פקדונות בנקים',
      avgAmount: ytdData.averages.bankDeposits,
      annualRate: ytdData.annualRates.bankDeposits,
      totalReturn: ytdData.totalReturns.bankDeposits,
      color: '#f59e0b', // כתום - בינוני
      efficiency: 65
    },
    lqdtSystem: {
      name: 'מערכת LQDT',
      avgAmount: ytdData.averages.lqdtSystem,
      annualRate: ytdData.annualRates.lqdtSystem,
      totalReturn: ytdData.totalReturns.lqdtSystem,
      color: '#22c55e', // ירוק - הכי טוב
      efficiency: 100
    },
    overall: {
      name: 'ביצועים כוללים',
      avgAmount: ytdData.averages.totalFunds,
      annualRate: ytdData.annualRates.overall,
      totalReturn: ytdData.totalReturns.total,
      color: '#3b82f6', // כחול - כולל
      efficiency: 80
    }
  };
};