// Utility functions for number formatting (compatible with existing codebase)

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

export function formatCompact(num: number): string {
  return formatNumber(num);
}

export function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return "0%";
  const formatted = Math.abs(value).toFixed(2);
  const sign = value < 0 ? "-" : "+";
  return `${sign}${formatted}%`;
}

export function formatPrice(price: number | null | undefined, currency = 'Rp'): string {
  if (price === null || price === undefined) return `${currency} -`;
  return `${currency} ${price.toLocaleString()}`;
}

export function formatDateTime(date: Date | string | number): string {
  if (typeof date === 'string' || typeof date === 'number') {
    // Convert to Date object first
    const d = new Date(date);
    return d.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '-';
  }
  
  return date.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function calculateSpread(bidPrice: number, askPrice: number): {
  points: number;
  percentage: number;
} {
  const points = askPrice - bidPrice;
  const percentage = (points / bidPrice) * 100;
  
  return {
    points,
    percentage: Math.round(percentage * 100) / 100,
  };
}

export function signClass(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return value >= 0 ? 'text-green-500' : 'text-red-500';
}
