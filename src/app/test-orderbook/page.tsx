// Test page for OrderBookPanel component - Fixed types
"use client";

import React, { useState, useEffect } from 'react';
import { OrderBookPanel } from '@/components/OrderBookPanel';
import { mockOrderBookData } from '@/lib/mocks/orderbook-dssa';
import type { OrderBookData } from '@/types/stockbit';

export default function TestOrderBook() {
  const [data, setData] = useState<OrderBookData>({
    ...mockOrderBookData,
    change_percentage: 0.00,
  });
  
  // Simulate live updates (every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        lastprice: prev.lastprice + Math.floor(Math.random() * 10) - 5,
        change: prev.change + Math.floor(Math.random() * 4) - 2,
        change_percentage: Math.abs(prev.change / (prev.lastprice - prev.change)) * 100,
      }));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Stockbit Orderbook Display Test
          </h1>
          <p className="text-slate-400">
            Based on real DSSA market data from exodus.stockbit.com API
          </p>
        </header>
        
        {/* Main Panel */}
        <main>
          <OrderBookPanel
            symbol={data.symbol}
            lastPrice={data.lastprice}
            bids={data.bid}
            asks={data.ask}
            width={400}
          />
        </main>
        
        {/* Stats Card */}
        <div className="bg-slate-900 border rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Data Source Info</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-400 block">Last Price</span>
              <span className="font-mono text-green-500">{data.lastprice}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Change</span>
              <span className={`font-mono ${Number(data.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Number(data.change)} ({Math.abs(Number(data.change_percentage)).toFixed(2)}%)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">High/Low</span>
              <span className="font-mono text-white">{data.high}/{data.low}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Volume</span>
              <span className="font-mono text-white">{(data.volume / 1e6).toFixed(2)}M</span>
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mt-6">
          <h3 className="text-blue-400 font-semibold mb-2">How to integrate with live data:</h3>
          <ol className="text-blue-300 text-sm space-y-1 list-decimal ml-4">
            <li>Run poller_v2.py to fetch live orderbook data every 5s</li>
            <li>Create WebSocket endpoint to stream data to frontend</li>
            <li>Update this component to consume real-time stream instead of mock data</li>
            <li>Add polling logic in parent component using fetch() to your backend</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
