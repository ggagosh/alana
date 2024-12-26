import { Signal } from "@/types/signals";

export type SignalStatus = "pre_entry" | "in_entry" | "active" | "closed";

export function getSignalStatus(signal: Signal): SignalStatus {
  const current = signal.currentPrice;
  const { entryLow, entryHigh, takeProfits } = signal;

  const allTPsHit = takeProfits?.every(tp => tp.hit) ?? false;
  if (allTPsHit) return "closed";

  if (current >= entryLow && current <= entryHigh) return "in_entry";

  const hasHitTPs = takeProfits?.some(tp => tp.hit) ?? false;
  if (hasHitTPs) return "active";

  return "pre_entry";
}

export function getStatusColor(status: SignalStatus): string {
  switch (status) {
    case "pre_entry": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    case "in_entry": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "closed": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  }
}

export function getPerformanceColor(value: number): string {
  if (value >= 10) return "text-green-600 dark:text-green-400 font-medium";
  if (value > 0) return "text-green-500 dark:text-green-300";
  if (value < -5) return "text-red-600 dark:text-red-400 font-medium";
  if (value < 0) return "text-red-500 dark:text-red-300";
  return "text-slate-600 dark:text-slate-400";
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 75) return "bg-green-600 dark:bg-green-500";
  if (percentage >= 50) return "bg-blue-600 dark:bg-blue-500";
  if (percentage >= 25) return "bg-yellow-600 dark:bg-yellow-500";
  return "bg-slate-600 dark:bg-slate-500";
}

export function calculatePnL(signal: Signal): number | null {
  const hitTPs = signal.takeProfits?.filter(tp => tp.hit) ?? [];
  if (!hitTPs.length) return null;

  const entryPrice = (signal.entryLow + signal.entryHigh) / 2;
  const avgExitPrice = hitTPs.reduce((sum, tp) => sum + tp.price, 0) / hitTPs.length;

  return ((avgExitPrice - entryPrice) / entryPrice) * 100;
}

export function getDistanceToNearestTP(signal: Signal): { distance: number; level: number } | null {
  const current = signal.currentPrice;
  const unHitTPs = signal.takeProfits?.filter(tp => !tp.hit).sort((a, b) => a.price - b.price) ?? [];

  if (!unHitTPs.length) return null;

  const nearestTP = unHitTPs[0];
  const distance = ((nearestTP.price - current) / current) * 100;

  return {
    distance,
    level: nearestTP.level
  };
}
