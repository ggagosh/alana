'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, Trash2 } from "lucide-react";
import { db } from "@/db/drizzle";
import { signals, takeProfits } from "@/db/schema";
import { sql } from 'drizzle-orm';

export function DataManagement() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch all data
      const signalsData = await db.query.signals.findMany({
        with: {
          takeProfits: true,
        },
      });

      // Create export file
      const exportData = {
        version: 1,
        timestamp: Date.now(),
        signals: signalsData,
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signals-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text);

      // Validate import data
      if (!data.version || !Array.isArray(data.signals)) {
        throw new Error('Invalid import file format');
      }

      // Import signals
      for (const signal of data.signals) {
        const { takeProfits: tps, ...signalData } = signal;
        const [newSignal] = await db.insert(signals).values(signalData).returning();

        // Import take profits
        if (Array.isArray(tps)) {
          await db.insert(takeProfits).values(
            tps.map(tp => ({
              ...tp,
              signalId: newSignal.id,
            }))
          );
        }
      }

      alert('Data imported successfully');
      window.location.reload();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data');
    } finally {
      setIsImporting(false);
      setSelectedFile(null);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to clean up old data? This will remove all inactive signals older than 30 days.')) {
      return;
    }

    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      await db.delete(signals)
        .where(sql`${signals.isActive} = false AND ${signals.dateAdded} < ${thirtyDaysAgo}`);
      
      alert('Old data cleaned up successfully');
    } catch (error) {
      console.error('Cleanup failed:', error);
      alert('Failed to clean up old data');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Export your data for backup or import data from another source.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="font-medium">Export Data</h3>
            <p className="text-sm text-muted-foreground">
              Download all your signals and settings
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>

        <div className="border-t pt-6">
          <div className="space-y-1 mb-4">
            <h3 className="font-medium">Import Data</h3>
            <p className="text-sm text-muted-foreground">
              Import signals from a backup file
            </p>
          </div>
          <div className="flex gap-4">
            <Input
              type="file"
              accept=".json"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <Button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="font-medium">Clean Up Old Data</h3>
              <p className="text-sm text-muted-foreground">
                Remove inactive signals older than 30 days
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleCleanup}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clean Up
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
