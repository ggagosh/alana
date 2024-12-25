"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Settings } from "lucide-react";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 flex items-center">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">
          Trading Signals
        </span>
      </Link>
      <nav className="flex items-center space-x-4 lg:space-x-6">
        <Link
          href="/"
          className={cn(
            "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
            pathname === "/"
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
      </nav>
    </div>
  );
}
