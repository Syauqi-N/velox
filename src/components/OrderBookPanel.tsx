// Stockbit-style OrderBook component
"use client";

import React from 'react';

interface OrderLevel {
  price: number;
  volume: number;
  que_num?: number;
}

interface OrderBookProps {
  symbol: string;
  lastPrice: number;
  bids: OrderLevel[];
  asks: OrderLevel[];
  width?: number;
}

export function OrderBookPanel({
  symbol = 'DSSA',
  lastPrice = 975,
  bids = [],
  asks = [],
}: OrderBookProps) {
  const maxVolume = Math.max(...asks.map(a => a.volume), ...bids.map(b => b.volume)) || 1;

  const getBarWidth = (volume: number): string => {
    if (!maxVolume || volume === 0) return "0%";
    return `${Math.min((volume / maxVolume) * 40, 40)}%`;
  };

  const formatNum = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const topBid = bids[0];
  const topAsk = asks[0];
  const spread = topBid && topAsk ? topAsk.price - topBid.price : null;
  const spreadPercent = spread && topBid?.price ? (spread / topBid.price * 100) : 0;

  return (
    <div className="border rounded-lg overflow-hidden bg-slate-900">
      <div className="bg-slate-800 text-white p-3 flex items-center justify-between">
        <h3 className="font-semibold">{symbol} Orderbook</h3>
        <span className="text-xs text-slate-400">Real-time</span>
      </div>

      <div className="flex h-[450px]">
        {/* ASK Section */}
        <div className="flex-1 border-r border-slate-700 pr-2">
          <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 pb-2 border-b border-slate-700 px-1">
            <div className="font-medium">Price</div>
            <div className="font-medium">Vol</div>
          </div>
          {asks.slice(-10).reverse().map((level, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2 text-sm hover:bg-slate-800/50 p-1 rounded">
              <div className="text-red-500 font-mono font-semibold">{level.price.toLocaleString()}</div>
              <div className="relative overflow-hidden truncate text-white">
                {formatNum(level.volume)}
                <div className="absolute right-0 top-0 h-full bg-red-500/30 rounded-l" style={{ width: getBarWidth(level.volume) }} />
              </div>
              <div className="text-right text-xs text-slate-500 whitespace-nowrap">{level.que_num ? `@${level.que_num}` : ''}</div>
            </div>
          ))}
        </div>

        {/* CENTER */}
        <div className="w-40 bg-slate-900 p-4 flex flex-col items-center justify-center space-y-3">
          <div className="text-sm text-slate-400">Current Price</div>
          <div className="text-3xl font-bold text-green-500">{lastPrice.toLocaleString()}</div>
          
          {topBid && topAsk && (
            <>
              <div className="text-xs text-slate-500 mt-4">Spread</div>
              <div className="text-sm font-semibold bg-yellow-500/20 px-2 py-1 rounded">{spread ?? 0} ({spreadPercent.toFixed(2)}%)</div>
              
              <div className="mt-4 text-left space-y-2 w-full">
                <div className="text-xs text-slate-400">Best Ask</div>
                <div className="text-right font-mono">{topAsk.price} × {formatNum(topAsk.volume)}</div>
                
                <div className="text-xs text-slate-400">Best Bid</div>
                <div className="text-right font-mono text-green-500">{topBid.price} × {formatNum(topBid.volume)}</div>
              </div>
            </>
          )}
        </div>

        {/* BID Section */}
        <div className="flex-1 pl-2">
          <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 pb-2 border-b border-slate-700 px-1">
            <div className="font-medium">Price</div>
            <div className="font-medium">Vol</div>
          </div>
          {bids.slice(-10).map((level, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2 text-sm hover:bg-slate-800/50 p-1 rounded">
              <div className="text-green-500 font-mono font-semibold">{level.price.toLocaleString()}</div>
              <div className="relative overflow-hidden truncate text-white ml-2">
                <div className="absolute left-0 top-0 h-full bg-green-500/30 rounded-r" style={{ width: getBarWidth(level.volume) }} />
                {formatNum(level.volume)}
              </div>
              <div className="text-right text-xs text-slate-500 whitespace-nowrap">{level.que_num ? `@${level.que_num}` : ''}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 text-xs text-slate-400 p-2 flex justify-between px-4">
        <div>Bid Levels: <span className="text-white font-semibold">{bids.length}</span></div>
        <div>Ask Levels: <span className="text-white font-semibold">{asks.length}</span></div>
        <div>Max Depth: <span className="text-white font-semibold">{formatNum(maxVolume)}</span></div>
      </div>
    </div>
  );
}

export default OrderBookPanel;
