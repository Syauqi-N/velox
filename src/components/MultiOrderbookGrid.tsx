// Multi-stock orderbook grid layout
"use client";

import React, { useState, useEffect } from 'react';
import type { OrderLevel } from '@/types/stockbit';

interface OrderBookProps {
  symbol: string;
  lastPrice: number;
  bids: OrderLevel[];
  asks: OrderLevel[];
}

export function MultiOrderbookGrid({ 
  stocks = [
    { symbol: 'DSSA', lastPrice: 975, bids: [], asks: [] },
    { symbol: 'BBRI', lastPrice: 5210, bids: [], asks: [] },
    { symbol: 'BMRI', lastPrice: 618, bids: [], asks: [] },
  ]
}: {
  stocks?: OrderBookProps[];
}) {
  const [orders, setOrders] = useState<OrderBookProps[]>(stocks);
  
  // Auto-refresh all orderbooks every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(stock => ({
        ...stock,
        lastPrice: stock.lastPrice + Math.floor(Math.random() * 20) - 10,
      })));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const columns = 3; // Show 3 per row
  
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Multi-Stock Orderbook Dashboard
        </h1>
        <p className="text-slate-400">
          Live monitoring across {orders.length} tickers — updating every 5s
        </p>
      </div>
      
      {/* Grid Layout */}
      <div 
        className="max-w-7xl mx-auto grid gap-4"
        style={{ 
          gridTemplateColumns: `repeat(${columns}, minmax(400px, 1fr))`
        }}
      >
        {orders.map((orderBook, index) => (
          <OrderBookCard 
            key={`${orderBook.symbol}-${index}`}
            {...orderBook}
          />
        ))}
        
        {/* Add more cards if needed */}
        {Array.from({ length: 9 - orders.length }).map((_, idx) => (
          <div 
            key={`empty-${idx}`} 
            className="border border-dashed border-slate-700 rounded-lg h-[500px] flex items-center justify-center"
          >
            <span className="text-slate-500 text-sm">Empty slot</span>
          </div>
        ))}
      </div>
      
      {/* Footer Controls */}
      <div className="max-w-7xl mx-auto mt-8 text-center text-slate-500 text-sm">
        <p>Auto-refreshing • Spread: Best Bid/Ask difference • Hover for details</p>
      </div>
    </div>
  );
}

function OrderBookCard({ symbol, lastPrice, bids = [], asks = [] }: OrderBookProps) {
  const maxVolume = Math.max(...asks.map(a => a.volume), ...bids.map(b => b.volume)) || 1;
  
  const getBarWidth = (volume: number): string => {
    if (!maxVolume || volume === 0) return "0%";
    return `${Math.min((volume / maxVolume) * 35, 35)}%`;
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
    <div className="border rounded-lg overflow-hidden bg-slate-900 hover:shadow-xl transition-shadow duration-300">
      {/* Symbol Header */}
      <div className="bg-slate-800 text-white p-3 flex items-center justify-between">
        <h3 className="font-bold text-lg">{symbol}</h3>
        <span className="text-xs bg-blue-500/30 px-2 py-1 rounded">Live</span>
      </div>
      
      {/* Price Display */}
      <div className="text-center py-2 bg-slate-900 border-b border-slate-700">
        <div className="text-2xl font-bold tabular-nums">
          {lastPrice.toLocaleString()}
        </div>
      </div>
      
      {/* Orderbook Table */}
      <div className="grid grid-cols-2 divide-x divide-slate-700">
        {/* ASK Column (Sells - Red) */}
        <div className="divide-y divide-slate-700/50">
          <div className="flex justify-between px-2 py-1 text-xs text-slate-400 font-medium border-b border-slate-700">
            <span>Price</span>
            <span>Vol</span>
          </div>
          
          {asks.slice(-8).reverse().map((level, idx) => (
            <div 
              key={idx} 
              className="grid grid-cols-2 divide-x divide-slate-700 hover:bg-red-500/10 px-2 py-1 cursor-pointer group"
            >
              <div className="flex items-center justify-end space-x-2">
                <span className="text-red-500 font-mono font-semibold text-sm">
                  {level.price.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  @{level.que_num || ''}
                </span>
              </div>
              <div className="relative pr-2 truncate">
                {formatNum(level.volume)}
                <div 
                  className="absolute right-0 top-0 h-full bg-red-500/20 rounded-l"
                  style={{ width: getBarWidth(level.volume) }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* BID Column (Buys - Green) */}
        <div className="divide-y divide-slate-700/50">
          <div className="flex justify-between px-2 py-1 text-xs text-slate-400 font-medium border-b border-slate-700">
            <span>Price</span>
            <span>Vol</span>
          </div>
          
          {bids.slice(-8).map((level, idx) => (
            <div 
              key={idx} 
              className="grid grid-cols-2 divide-x divide-slate-700 hover:bg-green-500/10 px-2 py-1 cursor-pointer group"
            >
              <div className="flex items-center justify-end space-x-2">
                <span className="text-green-500 font-mono font-semibold text-sm">
                  {level.price.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  @{level.que_num || ''}
                </span>
              </div>
              <div className="relative pl-2 truncate">
                <div 
                  className="absolute left-0 top-0 h-full bg-green-500/20 rounded-r pointer-events-none"
                  style={{ width: getBarWidth(level.volume) }}
                />
                <span className="relative">
                  {formatNum(level.volume)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Info Bar */}
      <div className="bg-slate-800/30 p-2 flex justify-between text-xs text-slate-400 border-t border-slate-700">
        <div className="flex gap-3">
          {topBid && (
            <span>Bid: <span className="text-green-500">{topBid.price} × {formatNum(topBid.volume)}</span></span>
          )}
        </div>
        <div className="flex gap-3">
          {topAsk && (
            <span>Ask: <span className="text-red-500">{topAsk.price} × {formatNum(topAsk.volume)}</span></span>
          )}
        </div>
        {spread !== null && (
          <span className="text-yellow-500">Spread: {spread} pts</span>
        )}
      </div>
    </div>
  );
}

export default MultiOrderbookGrid;
