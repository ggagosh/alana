'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Signal } from "@/types/signals";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  signal: Signal;
}

export function PriceChart({ signal }: PriceChartProps) {
  // Calculate price levels for visualization
  const priceLevels = [
    { price: signal.stopLoss, label: 'Stop Loss', type: 'stop' as const },
    { price: signal.entryLow, label: 'Entry', type: 'entry' as const },
    ...(signal.takeProfits || []).map(tp => ({
      price: tp.price,
      label: `TP${tp.level}`,
      type: 'tp' as const
    })),
    { price: signal.currentPrice, label: 'Current', type: 'current' as const }
  ].sort((a, b) => a.price - b.price);

  // Prepare data for the chart with interpolated points
  const chartData = [];
  for (let i = 0; i < priceLevels.length; i++) {
    chartData.push({
      name: priceLevels[i].label,
      price: priceLevels[i].price,
      type: priceLevels[i].type
    });
    
    // Add interpolation points between levels
    if (i < priceLevels.length - 1) {
      const currentPrice = priceLevels[i].price;
      const nextPrice = priceLevels[i + 1].price;
      const midPrice = (currentPrice + nextPrice) / 2;
      
      chartData.push({
        name: '',
        price: midPrice,
        type: 'interpolation'
      });
    }
  }

  const minPrice = Math.min(...priceLevels.map(l => l.price));
  const maxPrice = Math.max(...priceLevels.map(l => l.price));
  const priceRange = maxPrice - minPrice;
  const yAxisDomain = [minPrice - priceRange * 0.05, maxPrice + priceRange * 0.05];

  // Format number to remove scientific notation and add commas
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
      notation: 'standard'
    }).format(value);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && label) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-2">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm font-mono text-primary">
            {formatNumber(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-base">Price Movement Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {/* Chart visualization */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 20, right: 80, left: 50, bottom: 20 }}
            >
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval={1}
              />
              <YAxis 
                domain={yAxisDomain}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={formatNumber}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#priceGradient)"
                isAnimationActive={false}
              />
              {priceLevels.map((level) => (
                <ReferenceLine 
                  key={level.type + level.price}
                  y={level.price}
                  stroke={
                    level.type === 'stop' 
                      ? 'hsl(var(--destructive))' 
                      : level.type === 'current'
                      ? 'hsl(var(--muted-foreground))'
                      : level.type === 'entry'
                      ? 'hsl(var(--success))'
                      : 'hsl(var(--primary))'
                  }
                  strokeDasharray={level.type === 'current' ? '3 3' : '0'}
                  strokeWidth={1}
                  label={{
                    position: 'right',
                    value: level.label,
                    fontSize: 12,
                    fill: level.type === 'current' ? 'hsl(var(--muted-foreground))' : undefined,
                    offset: 10
                  }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Current position summary */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">Current Position</div>
          <div className="flex items-center gap-2">
            <div className="font-mono text-base">{formatNumber(signal.currentPrice)}</div>
            {signal.currentPrice > signal.entryLow ? (
              <Badge className="bg-green-500">Above Entry</Badge>
            ) : (
              <Badge variant="destructive">Below Entry</Badge>
            )}
          </div>
        </div>

        {/* Price ladder */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">Price Ladder</div>
          <div className="space-y-1">
            {priceLevels.map((level, index) => {
              const percentFromCurrent = ((level.price - signal.currentPrice) / signal.currentPrice) * 100;
              const isCurrentPrice = level.type === 'current';
              
              return (
                <div 
                  key={`${level.type}-${index}`}
                  className={`flex items-center gap-2 p-2 rounded-md ${
                    isCurrentPrice ? 'bg-muted' : ''
                  }`}
                >
                  <div className="w-20">
                    <Badge 
                      variant={
                        level.type === 'stop' 
                          ? 'destructive'
                          : level.type === 'entry'
                          ? 'secondary'
                          : level.type === 'current'
                          ? 'outline'
                          : 'default'
                      }
                      className="text-xs"
                    >
                      {level.label}
                    </Badge>
                  </div>
                  
                  <div className="font-mono text-sm">{formatNumber(level.price)}</div>
                  
                  {!isCurrentPrice && (
                    <div className={`flex items-center gap-1 text-xs ml-auto ${
                      percentFromCurrent > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <ArrowRight className="h-3 w-3" />
                      {Math.abs(percentFromCurrent).toFixed(2)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk analysis */}
        <div className="border-t pt-3">
          <div className="text-sm text-muted-foreground mb-2">Risk Analysis</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Risk</div>
              <div className="text-red-500 font-medium">
                {Math.abs(((signal.stopLoss - signal.currentPrice) / signal.currentPrice) * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Next Target</div>
              {signal.takeProfits?.find(tp => tp.price > signal.currentPrice) ? (
                <div className="text-green-500 font-medium">
                  {Math.abs(((signal.takeProfits.find(tp => tp.price > signal.currentPrice)!.price - signal.currentPrice) / signal.currentPrice) * 100).toFixed(2)}%
                </div>
              ) : (
                <div className="text-muted-foreground">No targets above</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
