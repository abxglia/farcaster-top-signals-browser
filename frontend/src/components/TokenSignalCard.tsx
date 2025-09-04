import React from 'react';
import { TokenSignal } from '../services/signalsAPI';

interface TokenSignalCardProps {
  token: TokenSignal;
  onTokenClick: (symbol: string) => void;
  isInWatchlist: boolean;
  onWatchlistToggle: (symbol: string) => void;
}

export const TokenSignalCard: React.FC<TokenSignalCardProps> = ({
  token,
  onTokenClick,
  isInWatchlist,
  onWatchlistToggle
}) => {
  const isNumber = (v: unknown): v is number => typeof v === 'number' && !Number.isNaN(v);

  const formatNumber = (num?: number): string => {
    if (!isNumber(num)) return '-';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const formatPrice = (price?: number): string => {
    if (!isNumber(price)) return '-';
    if (price < 0.01) return price.toFixed(8);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const getSignalColor = (value?: number): string => {
    if (!isNumber(value)) return 'text-gray-400';
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getSignalBgColor = (value?: number): string => {
    if (!isNumber(value)) return 'bg-gray-500/20';
    if (value > 0) return 'bg-green-500/20';
    if (value < 0) return 'bg-red-500/20';
    return 'bg-gray-500/20';
  };

  return (
    <div 
      className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer"
      onClick={() => onTokenClick(token.symbol)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
            {token.symbol}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{token.symbol}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              token.type === 'memecoin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
            }`}>
              {token.type}
            </span>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWatchlistToggle(token.symbol);
          }}
          className={`p-2 rounded-lg transition-colors ${
            isInWatchlist 
              ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
          }`}
        >
          {isInWatchlist ? '★' : '☆'}
        </button>
      </div>

      {/* Main Signal */}
      <div className="mb-4">
        <div className={`text-2xl font-bold ${getSignalColor(token.hx_mom6)}`}>
          {token.hx_mom6 > 0 ? '+' : ''}{token.hx_mom6.toFixed(2)}%
        </div>
        <div className="text-xs text-slate-400">6h Momentum Signal</div>
      </div>

      {/* Price and Market Data - Not available from database */}

      {/* Signal Drivers (only render cards with data) */}
      <div className="grid grid-cols-3 gap-2">
        {isNumber(token.hx_buzz6) && (
          <div className={`text-center p-2 rounded-lg ${getSignalBgColor(token.hx_buzz6)}`}>
            <div className={`text-xs font-semibold ${getSignalColor(token.hx_buzz6)}`}>
              {token.hx_buzz6! > 0 ? '+' : ''}{token.hx_buzz6!.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">Buzz</div>
          </div>
        )}
        {isNumber(token.hx_liq6) && (
          <div className={`text-center p-2 rounded-lg ${getSignalBgColor(token.hx_liq6)}`}>
            <div className={`text-xs font-semibold ${getSignalColor(token.hx_liq6)}`}>
              {token.hx_liq6! > 0 ? '+' : ''}{token.hx_liq6!.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">Liquidity</div>
          </div>
        )}
        {isNumber(token.hx_rankimp6) && (
          <div className={`text-center p-2 rounded-lg ${getSignalBgColor(token.hx_rankimp6)}`}>
            <div className={`text-xs font-semibold ${getSignalColor(token.hx_rankimp6)}`}>
              {token.hx_rankimp6! > 0 ? '+' : ''}{token.hx_rankimp6!.toFixed(1)}
            </div>
            <div className="text-xs text-slate-400">Rank</div>
          </div>
        )}
      </div>

      {/* Social Contributors (available from d_pct_users_6h) */}
      <div className="mt-3 pt-3 border-t border-slate-700/50">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Social Contributors: {isNumber(token.contributors_active) ? formatNumber(token.contributors_active) : '-'}</span>
        </div>
      </div>
    </div>
  );
};
