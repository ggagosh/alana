import { Metadata } from "next";
import { ApiKeyForm } from "@/components/settings/ApiKeyForm";

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
          Manage your settings.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">API Keys</h2>
          <ApiKeyForm />
        </div>
      </div>
    </div>
  );
}
