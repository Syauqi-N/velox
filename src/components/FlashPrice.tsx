"use client";

import React from "react";

interface FlashPriceProps {
  value: number | null;
  changePercent: number | null;
}

export default function FlashPrice({ value, changePercent }: FlashPriceProps) {
  if (value == null) {
    return <span className="tabular-nums">—</span>;
  }

  const cls =
    (changePercent ?? 0) >= 0 ? "flash-up" : "flash-down";

  return (
    <span
      key={value}
      className={`tabular-nums ${cls}`}
    >
      {value.toLocaleString("id-ID")}
    </span>
  );
}
