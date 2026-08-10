// Mock orderbook data for testing OrderBookPanel component
// Based on real DSSA response from Stockbit API

export const mockOrderBookData = {
  symbol: 'DSSA',
  lastprice: 975,
  change: 0,
  change_percentage: 0.0,
  high: 1060,
  low: 950,
  average: 991,
  volume: 1311549000,
  
  bid: [
    { price: 970, volume: 2480100, que_num: 67 },
    { price: 965, volume: 5656300, que_num: 123 },
    { price: 960, volume: 3434100, que_num: 89 },
    { price: 955, volume: 2323000, que_num: 45 },
    { price: 950, volume: 1212000, que_num: 1234 },
    { price: 945, volume: 987654, que_num: 567 },
    { price: 940, volume: 876543, que_num: 234 },
    { price: 935, volume: 765432, que_num: 123 },
    { price: 930, volume: 654321, que_num: 456 },
    { price: 925, volume: 543210, que_num: 789 },
  ],
  
  ask: [
    { price: 980, volume: 1234567, que_num: 45 },
    { price: 985, volume: 3456789, que_num: 89 },
    { price: 990, volume: 2345678, que_num: 67 },
    { price: 995, volume: 1234567, que_num: 123 },
    { price: 1000, volume: 987654, que_num: 234 },
    { price: 1005, volume: 876543, que_num: 345 },
    { price: 1010, volume: 765432, que_num: 456 },
    { price: 1015, volume: 654321, que_num: 567 },
    { price: 1020, volume: 543210, que_num: 678 },
    { price: 1025, volume: 432109, que_num: 789 },
  ]
};
