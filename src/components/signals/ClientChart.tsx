"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, UTCTimestamp, ChartOptions, DeepPartial, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { useCryptoData } from "@/hooks/useCryptoData";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";

interface ClientChartProps {
  symbol?: string;
}

export function ClientChart({ symbol = "BTCUSDT" }: ClientChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart>>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick">>(null);
  const { data: cryptoData, loading, error } = useCryptoData(symbol, "1m", 1000);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    if (!chartContainerRef.current || !cryptoData.length) return;

    const chartOptions: DeepPartial<ChartOptions> = {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDarkTheme ? '#d1d5db' : '#374151',
      },
      grid: {
        vertLines: { color: isDarkTheme ? '#374151' : '#e5e7eb' },
        horzLines: { color: isDarkTheme ? '#374151' : '#e5e7eb' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: isDarkTheme ? '#6b7280' : '#9ca3af',
          style: 2,
        },
        horzLine: {
          width: 1,
          color: isDarkTheme ? '#6b7280' : '#9ca3af',
          style: 2,
        },
      },
      timeScale: {
        borderColor: isDarkTheme ? '#374151' : '#e5e7eb',
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        barSpacing: 12,
        minBarSpacing: 10,
        rightOffset: 5,
        visible: true,
      },
      rightPriceScale: {
        borderColor: isDarkTheme ? '#374151' : '#e5e7eb',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,
          price: true,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    };

    // Initialize chart
    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    // Add series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Set initial data
    const initialData = cryptoData.map((d) => ({
      time: (d.timestamp / 1000) as UTCTimestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeries.setData(initialData);

    // Configure visible range
    const visibleLogicalRange = {
      from: Math.max(0, initialData.length - 100), // Show last 100 candles
      to: initialData.length,
    };
    chart.timeScale().setVisibleLogicalRange(visibleLogicalRange);

    // Setup resize handler
    const handleResize = () => { 
      const { width } = chartContainerRef.current?.getBoundingClientRect() || { width: 0 };
      if (width > 0 && chartRef.current) {
        chartRef.current.applyOptions({
          width,
          height: 400,
        });
        chartRef.current.timeScale().setVisibleLogicalRange(visibleLogicalRange);
      }
    };

    // Initial resize
    handleResize();

    // Add resize listener
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [cryptoData.length > 0, isDarkTheme]);

  // Handle real-time updates
  useEffect(() => {
    if (!candlestickSeriesRef.current || !cryptoData.length) return;

    const lastData = cryptoData[cryptoData.length - 1];
    const update = {
      time: (lastData.timestamp / 1000) as UTCTimestamp,
      open: lastData.open,
      high: lastData.high,
      low: lastData.low,
      close: lastData.close,
    };

    candlestickSeriesRef.current.update(update);
  }, [cryptoData]);

  if (loading && !cryptoData.length) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  // Show chart even if there's an error but we have data
  if (error && !cryptoData.length) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-red-500">
        Failed to load chart data. Retrying...
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] relative">
      <div ref={chartContainerRef} className="absolute inset-0" />
      {error && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
          Connection error. Reconnecting...
        </div>
      )}
    </div>
  );
}