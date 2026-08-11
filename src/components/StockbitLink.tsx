function stockbitSymbol(symbol: string) {
  return symbol.trim().toUpperCase().replace(/\.JK$/, "");
}

export default function StockbitLink({ symbol, className = "" }: { symbol: string; className?: string }) {
  const ticker = stockbitSymbol(symbol);
  return (
    <a
      href={`https://stockbit.com/symbol/${encodeURIComponent(ticker)}`}
      target="_blank"
      rel="noreferrer"
      className={`btn-ghost inline-flex min-h-11 items-center justify-center px-3 text-sm ${className}`}
    >
      Buka saham {ticker} di Stockbit
    </a>
  );
}
