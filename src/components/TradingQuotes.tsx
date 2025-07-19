import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Clock, DollarSign, Zap } from 'lucide-react';
import { mockBankQuotes } from '../data/mockData';
import type { BankQuote } from '../lib/supabase';

interface TradingQuote extends BankQuote {
  currentRate: number;
  previousRate: number;
  change: number;
  changePercent: number;
  isFlashing: boolean;
  trend: 'up' | 'down' | 'neutral';
  volume: number;
  lastUpdate: Date;
}

const TradingQuotes: React.FC = () => {
  const [quotes, setQuotes] = useState<TradingQuote[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Initialize quotes with trading data
  useEffect(() => {
    const initialQuotes: TradingQuote[] = mockBankQuotes.map(quote => ({
      ...quote,
      currentRate: quote.rate,
      previousRate: quote.rate,
      change: 0,
      changePercent: 0,
      isFlashing: false,
      trend: 'neutral' as const,
      volume: Math.floor(Math.random() * 500000000) + 50000000,
      lastUpdate: new Date()
    }));
    setQuotes(initialQuotes);
  }, []);

  // Simulate live trading updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setQuotes(prevQuotes => 
        prevQuotes.map(quote => {
          // Random rate change between -0.05% to +0.05%
          const changePercent = (Math.random() - 0.5) * 0.1;
          const newRate = quote.currentRate * (1 + changePercent / 100);
          const change = newRate - quote.previousRate;
          const changePercentValue = ((newRate - quote.previousRate) / quote.previousRate) * 100;
          
          // Determine trend
          let trend: 'up' | 'down' | 'neutral' = 'neutral';
          if (change > 0.001) trend = 'up';
          else if (change < -0.001) trend = 'down';

          // Random volume change
          const volumeChange = (Math.random() - 0.5) * 0.2;
          const newVolume = Math.max(10000000, quote.volume * (1 + volumeChange));

          return {
            ...quote,
            previousRate: quote.currentRate,
            currentRate: Math.max(0.1, newRate),
            change,
            changePercent: changePercentValue,
            isFlashing: Math.abs(change) > 0.002,
            trend,
            volume: newVolume,
            lastUpdate: new Date()
          };
        })
      );
    }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  // Clear flash effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuotes(prevQuotes => 
        prevQuotes.map(quote => ({ ...quote, isFlashing: false }))
      );
    }, 500);

    return () => clearTimeout(timeout);
  }, [quotes]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatRate = (rate: number): string => {
    return rate.toFixed(3) + '%';
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000000) {
      return (volume / 1000000000).toFixed(1) + 'B';
    } else if (volume >= 1000000) {
      return (volume / 1000000).toFixed(0) + 'M';
    }
    return volume.toString();
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral'): string => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getQuoteTypeText = (type: string): string => {
    switch (type) {
      case 'makam_short': return 'קצר';
      case 'makam_medium': return 'בינוני';
      case 'makam_long': return 'ארוך';
      default: return 'רגיל';
    }
  };

  const getQuoteTypeColor = (type: string): string => {
    switch (type) {
      case 'makam_short': return 'bg-blue-500';
      case 'makam_medium': return 'bg-yellow-500';
      case 'makam_long': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Trading Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold text-orange-400">מק״מים - מסחר חי</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isLive ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-sm font-bold">{isLive ? 'LIVE' : 'PAUSED'}</span>
          </div>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            isLive 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isLive ? 'עצור מסחר' : 'התחל מסחר'}
        </button>
      </div>

      {/* Trading Table Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-8 gap-4 text-sm font-bold text-orange-400">
          <div>מכשיר</div>
          <div>ריבית נוכחית</div>
          <div>שינוי</div>
          <div>שינוי %</div>
          <div>נפח</div>
          <div>מינימום</div>
          <div>משך</div>
          <div>עדכון אחרון</div>
        </div>
      </div>

      {/* Trading Quotes */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-orange-400 bg-gray-800">
              <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-orange-400">⟳</div>
              טוען נתוני מק״מים מהמסד נתונים...
            </div>
          </div>
        ) : (
        quotes.map((quote) => (
          <div 
            key={quote.id}
            className={`p-4 bg-black border rounded-lg transition-all duration-300 ${
              quote.isFlashing 
                ? quote.trend === 'up' 
                  ? 'border-green-400 bg-green-900/20 shadow-lg shadow-green-400/20' 
                  : 'border-red-400 bg-red-900/20 shadow-lg shadow-red-400/20'
                : 'border-gray-700 hover:border-orange-500'
            }`}
          >
            <div className="grid grid-cols-8 gap-4 items-center">
              {/* Instrument */}
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getQuoteTypeColor(quote.quote_type)}`}>
                    {getQuoteTypeText(quote.quote_type)}
                  </span>
                  <span className="text-white font-bold">{quote.bank_name}</span>
                </div>
              </div>

              {/* Current Rate */}
              <div className={`text-lg font-mono font-bold ${getTrendColor(quote.trend)}`}>
                {formatRate(quote.currentRate)}
              </div>

              {/* Change */}
              <div className={`flex items-center gap-1 ${getTrendColor(quote.trend)}`}>
                {getTrendIcon(quote.trend)}
                <span className="font-mono">
                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(3)}
                </span>
              </div>

              {/* Change Percent */}
              <div className={`font-mono font-bold ${getTrendColor(quote.trend)}`}>
                {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
              </div>

              {/* Volume */}
              <div className="text-white font-mono">
                ₪{formatVolume(quote.volume)}
              </div>

              {/* Minimum */}
              <div className="text-gray-400 text-sm">
                {formatCurrency(quote.amount_min)}
              </div>

              {/* Duration */}
              <div className="text-white">
                {quote.duration_days} ימים
              </div>

              {/* Last Update */}
              <div className="text-gray-400 text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {quote.lastUpdate.toLocaleTimeString('he-IL', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">טווח: </span>
                <span className="text-white">{formatCurrency(quote.amount_min)} - {formatCurrency(quote.amount_max)}</span>
              </div>
              <div>
                <span className="text-gray-400">תוקף עד: </span>
                <span className="text-orange-400">
                  {new Date(quote.valid_until).toLocaleTimeString('he-IL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400 text-xs">מסחר פעיל</span>
              </div>
            </div>

            {quote.notes && (
              <div className="mt-2 text-sm text-gray-400 italic">
                {quote.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Market Summary */}
      <div className="bg-gray-900 border border-orange-500 rounded-lg p-4 mt-6">
        <h4 className="text-lg font-bold text-orange-400 mb-3">סיכום שוק</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {quotes.filter(q => q.trend === 'up').length}
            </div>
            <div className="text-sm text-gray-400">עולים</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {quotes.filter(q => q.trend === 'down').length}
            </div>
            <div className="text-sm text-gray-400">יורדים</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {formatRate(quotes.reduce((sum, q) => sum + q.currentRate, 0) / quotes.length)}
            </div>
            <div className="text-sm text-gray-400">ממוצע</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              ₪{formatVolume(quotes.reduce((sum, q) => sum + q.volume, 0))}
            </div>
            <div className="text-sm text-gray-400">נפח כולל</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingQuotes;