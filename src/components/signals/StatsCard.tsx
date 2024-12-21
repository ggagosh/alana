import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Signal } from '@/types/signals';

interface StatsCardProps {
  signals: Signal[];
}

export function StatsCard({ signals }: StatsCardProps) {
  const totalSignals = signals.length;
  const activeSignals = signals.filter(s => s.isActive).length;
  const successfulTPs = signals.reduce((acc, signal) => 
    acc + signal.takeProfits.filter(tp => tp.hit).length, 0
  );
  const totalTPs = signals.reduce((acc, signal) => 
    acc + signal.takeProfits.length, 0
  );
  
  const successRate = totalTPs > 0 
    ? Math.round((successfulTPs / totalTPs) * 100) 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSignals}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSignals}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{successRate}%</div>
          <p className="text-xs text-muted-foreground">
            {successfulTPs} / {totalTPs} TPs Hit
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
