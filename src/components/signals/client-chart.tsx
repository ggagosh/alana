"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, UTCTimestamp, ChartOptions, DeepPartial, ISeriesApi } from 'lightweight-charts';
import { useCoinData } from "@/hooks/use-coin-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import { KLineData } from "@/types/binance";

interface ClientChartProps {
  symbol?: string;
}

function candleToChartData(candle: KLineData) {
  return {
    time: (candle.openTime / 1000) as UTCTimestamp,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  };
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
      const chartData = [...coinData.historicalData]
        .filter(candle => {
          // Filter out any historical candles that overlap with current candle
          return !coinData.currentCandle || candle.openTime < coinData.currentCandle.openTime;
        })
        .map(candleToChartData);

      // Add current candle if available
      if (coinData.currentCandle) {
        chartData.push(candleToChartData(coinData.currentCandle));
      }

      candlestickSeries.setData(chartData);

      // Configure visible range
      const visibleLogicalRange = {
        from: Math.max(0, chartData.length - 30),
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
  }, [coinData?.historicalData, coinData?.currentCandle, isDarkTheme]);

  // Update current candle effect
  useEffect(() => {
    if (!candlestickSeriesRef.current || !coinData?.currentCandle) return;
    candlestickSeriesRef.current.update(candleToChartData(coinData.currentCandle));
  }, [coinData?.currentCandle]);

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-destructive">
        Error loading chart: {error.message}
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <Skeleton className="w-full h-[400px]" />
    );
  }

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-[400px]"
    />
  );
}