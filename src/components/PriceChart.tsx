"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { ChartResult } from "@/lib/yahoo";

// Light theme colors (for white background)
const UP = "#22c55e";
const DOWN = "#ef4444";
const GRID_LIGHT = "rgba(14,34,48,0.08)";    // dark grid lines on light bg
const GRID_DARK = "rgba(255,255,255,0.05)";   // white grid lines on dark bg  
const TEXT_LIGHT = "#5b6b7a";                 // muted blue for light bg
const TEXT_DARK = "#8b98a5";                  // gray for dark bg

export default function PriceChart({
  data,
  height = 400,
  variant = "light",
}: {
  data: ChartResult;
  height?: number;
  variant?: "light" | "dark";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Determine colors based on variant
    const useGrid = variant === "light" ? GRID_LIGHT : GRID_DARK;
    const useText = variant === "light" ? TEXT_LIGHT : TEXT_DARK;
    const crosshairColor = variant === "light" ? "rgba(14,34,48,0.2)" : "#3a4655";

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: useText,
        fontSize: 11,
      },
      grid: {
        vertLines: { color: useGrid },
        horzLines: { color: useGrid },
      },
      width: containerRef.current.clientWidth,
      height,
      timeScale: {
        borderColor: useGrid,
        rightOffset: 4,
        barSpacing: 6,
      },
      rightPriceScale: {
        borderColor: useGrid,
      },
      crosshair: {
        mode: 0,
        vertLine: { color: crosshairColor, width: 1, style: 3 },
        horzLine: { color: crosshairColor, width: 1, style: 3 },
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderVisible: false,
      wickUpColor: UP,
      wickDownColor: DOWN,
    });
    seriesRef.current = series;

    // Responsive resize
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    resizeObserver.observe(containerRef.current);

    chartRef.current = chart;

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height, variant]);

  // Update data when it changes
  useEffect(() => {
    if (!seriesRef.current || !data.bars.length) return;
    seriesRef.current.setData(
      data.bars.map((b) => ({
        time: b.time as UTCTimestamp,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
      })),
    );
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  if (!data.bars.length) {
    return (
      <div
        className="flex items-center justify-center text-[var(--text-muted)]"
        style={{ height }}
      >
        Tidak ada data
      </div>
    );
  }

  return <div ref={containerRef} style={{ height }} />;
}
