"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, UTCTimestamp, ChartOptions, DeepPartial, ISeriesApi } from 'lightweight-charts';
import { useCoinData } from "@/hooks/use-coin-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";

interface ClientChartProps {
  symbol?: string;
}

export function ClientChart({ symbol = "BTCUSDT" }: ClientChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart>>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick">>(null);
  const { coinData, error, isInitialized } = useCoinData(symbol);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  // Chart initialization effect
  useEffect(() => {
    // Early return if no container or no data
    if (!chartContainerRef.current) return;
    if (!coinData?.historicalData?.length) return;

    // Cleanup previous chart instance
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

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
        mode: 1,
        autoScale: true,
        alignLabels: true,
        borderVisible: true,
        entireTextOnly: false,
        ticksVisible: true
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

    try {
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
        priceFormat: {
          type: 'price',
          precision: 8,
          minMove: 0.00000001,
        },
      });
      candlestickSeriesRef.current = candlestickSeries;

      // Update data
      const chartData = coinData.historicalData.map((d) => ({
        time: (d.timestamp / 1000) as UTCTimestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      candlestickSeries.setData(chartData);

      // Configure visible range
      const visibleLogicalRange = {
        from: Math.max(0, chartData.length - 100),
        to: chartData.length,
      };
      chart.timeScale().setVisibleLogicalRange(visibleLogicalRange);

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({ 
            width: chartContainerRef.current.clientWidth 
          });
        }
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    } catch (err) {
      console.error('Error initializing chart:', err);
    }
  }, [isDarkTheme, coinData?.historicalData]);

  // Real-time updates effect
  useEffect(() => {
    if (!candlestickSeriesRef.current) return;
    if (!coinData?.historicalData?.length) return;

    try {
      const lastData = coinData.historicalData[coinData.historicalData.length - 1];
      if (!lastData) return;

      const update = {
        time: (lastData.timestamp / 1000) as UTCTimestamp,
        open: lastData.open,
        high: lastData.high,
        low: lastData.low,
        close: lastData.close,
      };

      candlestickSeriesRef.current.update(update);
    } catch (err) {
      console.error('Error updating chart:', err);
    }
  }, [coinData?.historicalData]);

  if (!isInitialized || !coinData?.historicalData?.length) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-destructive">
        Error loading chart data
      </div>
    );
  }

  return (
    <div ref={chartContainerRef} className="w-full h-[400px] relative" />
  );
}