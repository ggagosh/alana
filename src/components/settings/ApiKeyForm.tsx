"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveApiKeys, getApiKeys, deleteApiKeys } from "@/app/actions";
import { Loader2, Save, Trash2 } from "lucide-react";

export function ApiKeyForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [key, setKey] = useState("");
  const [secret, setSecret] = useState("");
  const [hasExistingKeys, setHasExistingKeys] = useState(false);

  useEffect(() => {
    async function loadKeys() {
      try {
        const keys = await getApiKeys("binance");
        if (keys) {
          setKey(keys.key);
          setSecret(keys.secret);
          setHasExistingKeys(true);
        }
      } catch (error) {
        console.error("Failed to load API keys:", error);
      } finally {
        setIsInitialized(true);
      }
    }
    loadKeys();
  }, []);

  const handleSave = async () => {
    if (!key || !secret) return;

    setIsLoading(true);
    try {
      await saveApiKeys("binance", key, secret);
      setHasExistingKeys(true);
      router.refresh();
    } catch (error) {
      console.error("Failed to save API keys:", error);
      alert("Failed to save API keys. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your API keys?")) return;

    setIsLoading(true);
    try {
      await deleteApiKeys("binance");
      setKey("");
      setSecret("");
      setHasExistingKeys(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete API keys:", error);
      alert("Failed to delete API keys. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSave();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your Binance API key"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiSecret">API Secret</Label>
          <Input
            id="apiSecret"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter your Binance API secret"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={isLoading || !key || !secret}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Keys
          </Button>

          {hasExistingKeys && (
            <Button
              type="button"
              variant="destructive"
              disabled={isLoading}
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Keys
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Your API keys are stored securely and encrypted in the database. They are
          only used to fetch current prices and never leave your system.
        </div>
      </form>
    </Card>
  );
}
