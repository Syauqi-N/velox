// Orderbook data type definitions

export interface OrderLevel {
  price: number;
  volume: number;
  que_num?: number;  // Number of orders at this level
}

export interface OrderBookData {
  symbol: string;
  lastprice: number;
  change: number;
  change_percentage: number;
  high: number;
  low: number;
  average: number;
  volume: number;  // Total shares
  spread?: number;
  
  bid: OrderLevel[];   // Buy orders (sorted descending by price)
  ask: OrderLevel[];   // Sell orders (sorted ascending by price)
}

export interface OrderBookState {
  data: OrderBookData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface StockbitQuote extends OrderBookData {
  timestamp: number;
}
