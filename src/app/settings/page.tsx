import { Metadata } from "next";
import { ApiKeyForm } from "@/components/settings/ApiKeyForm";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { DataManagement } from "@/components/settings/DataManagement";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your API keys and preferences.",
};

export default async function SettingsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your API keys and preferences.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">API Keys</h2>
          <ApiKeyForm />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <ThemeSelector />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Data Management</h2>
          <DataManagement />
        </div>
      </div>
    </div>
  );
}
