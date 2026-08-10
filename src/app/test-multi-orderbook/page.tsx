// Test page for Multi-stock Orderbook Grid
"use client";

import React from 'react';
import { MultiOrderbookGrid } from '@/components/MultiOrderbookGrid';
import type { OrderLevel } from '@/types/stockbit';

export default function MultiOrderbookTest() {
  const mockData = [
    {
      symbol: 'DSSA',
      lastPrice: 975,
      bids: [
        { price: 970, volume: 2480100, que_num: 67 },
        { price: 965, volume: 5656300, que_num: 123 },
        { price: 960, volume: 3434100, que_num: 89 },
        { price: 955, volume: 2323000, que_num: 45 },
        { price: 950, volume: 1212000, que_num: 123 },
        { price: 945, volume: 987700, que_num: 234 },
        { price: 940, volume: 876500, que_num: 345 },
        { price: 935, volume: 765400, que_num: 456 },
      ],
      asks: [
        { price: 980, volume: 1234567, que_num: 45 },
        { price: 985, volume: 3456789, que_num: 89 },
        { price: 990, volume: 2345678, que_num: 567 },
        { price: 995, volume: 1567890, que_num: 123 },
        { price: 1000, volume: 2876543, que_num: 456 },
        { price: 1005, volume: 1987654, que_num: 789 },
        { price: 1010, volume: 1234567, que_num: 234 },
        { price: 1015, volume: 1654321, que_num: 567 },
      ],
    },
    {
      symbol: 'BBRI',
      lastPrice: 5210,
      bids: [
        { price: 5200, volume: 8900000, que_num: 234 },
        { price: 5190, volume: 12340000, que_num: 567 },
        { price: 5180, volume: 7650000, que_num: 123 },
        { price: 5170, volume: 9870000, que_num: 890 },
      ],
      asks: [
        { price: 5220, volume: 5430000, que_num: 345 },
        { price: 5230, volume: 8760000, que_num: 678 },
        { price: 5240, volume: 6540000, que_num: 901 },
        { price: 5250, volume: 4320000, que_num: 234 },
      ],
    },
    {
      symbol: 'BMRI',
      lastPrice: 618,
      bids: [
        { price: 616, volume: 15600000, que_num: 456 },
        { price: 615, volume: 18900000, que_num: 789 },
        { price: 614, volume: 12300000, que_num: 123 },
      ],
      asks: [
        { price: 620, volume: 9870000, que_num: 567 },
        { price: 621, volume: 14560000, que_num: 890 },
        { price: 622, volume: 11230000, que_num: 234 },
      ],
    },
    {
      symbol: 'TLKM',
      lastPrice: 3780,
      bids: [
        { price: 3770, volume: 6780000, que_num: 345 },
        { price: 3760, volume: 8900000, que_num: 678 },
      ],
      asks: [
        { price: 3790, volume: 5430000, que_num: 901 },
        { price: 3800, volume: 7650000, que_num: 234 },
      ],
    },
  ];
  
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="max-w-[1800px] mx-auto mb-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Real-Time Stock Market Dashboard
        </h1>
        <p className="text-slate-400">
          Live orderbook data • Auto-refresh every 5 seconds • {mockData.length} tickers
        </p>
      </div>
      
      {/* Main Content */}
      <MultiOrderbookGrid stocks={mockData} />
      
      {/* Footer */}
      <div className="max-w-[1800px] mx-auto mt-6 text-center text-slate-500 text-sm">
        <p>💡 Hover over rows for order details • Green bars show depth • Spread = Best Ask - Best Bid</p>
      </div>
    </div>
  );
}
