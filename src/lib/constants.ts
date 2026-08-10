// Shared constants that must NOT pull in server-only libraries (yahoo-finance2).
// Keep this file free of any Node.js imports so client components can use it.

// IHSG index symbol on Yahoo Finance
export const IHSG_SYMBOL = "^JKSE";

// Common Indonesian watchlist tickers (IDX suffixes)
export const IDX_WATCHLIST = [
  "BBCA.JK",
  "BBRI.JK",
  "BMRI.JK",
  "BBNI.JK",
  "TLKM.JK",
  "ASII.JK",
  "GOTO.JK",
  "ANTM.JK",
  "ADRO.JK",
  "ICBP.JK",
];