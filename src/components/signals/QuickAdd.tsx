'use client';

import { useState, useRef } from 'react';
import { experimental_useObject as useObject } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { parsedSignalSchema, type Signal } from '@/lib/schema';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ParsedSignalsPreview } from './ParsedSignalsPreview';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface QuickAddProps {
  onSubmit: (data: Signal) => Promise<Signal[]>;
}

export function QuickAdd({ onSubmit }: QuickAddProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [finalObject, setFinalObject] = useState<Signal | null>(null);
  const { toast } = useToast();

  const {
    object,
    isLoading,
    submit,
    stop,
  } = useObject({
    api: '/api/parse-signal',
    schema: parsedSignalSchema,
    onError: (error) => {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
    onFinish(result) {
      if (result.error) {
        setError(result.error.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error.message,
        });
      }

      if (result.object?.parsed) {
        setFinalObject(result.object.parsed as Signal);
        toast({
          title: "Success",
          description: "Signal parsed successfully!",
        });
      } else {
        setError('Failed to parse signal');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to parse signal",
        });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = textareaRef.current?.value;
    if (!text) return;

    setError(null);
    try {
      submit({ prompt: text });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse signal';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleAddSignal = async () => {
    if (!finalObject) {
      return;
    }

    setIsAdding(true);
    try {
      await onSubmit(finalObject);
      toast({
        title: "Success",
        description: "Signal added successfully!",
      });
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add signal';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    stop();
    setOpen(false);
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }
    setError(null);
    setFinalObject(null);
    setIsAdding(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Signal</Button>
      </DialogTrigger>
      <DialogContent className={
        cn("sm:max-w-[600px] flex flex-col", {
          'h-[90vh]': (isLoading && object?.parsed) || finalObject
        })
      }>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add New Signal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-hidden flex flex-col pt-4">
          <div className="grid gap-4 overflow-y-auto p-2">
            <div className="grid gap-2">
              <Textarea
                ref={textareaRef}
                placeholder="Paste your signal here..."
                rows={10}
                disabled={isLoading || isAdding}
                className="resize-none font-mono min-h-[200px]"
              />
              <p className="text-sm text-muted-foreground">
                Paste your trading signal here. The AI will automatically parse the coin pair,
                entry points, stop loss, and take profit levels.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {((isLoading && object?.parsed) || finalObject) && (
              <div className="overflow-auto">
                <ParsedSignalsPreview signals={[
                  ...(isLoading && object?.parsed) ? [object.parsed as Signal] : [finalObject]
                ] as Signal[]} />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 flex-shrink-0 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose()}
              disabled={isLoading || isAdding}
            >
              Cancel
            </Button>
            {finalObject ? (
              <Button
                type="button"
                onClick={handleAddSignal}
                disabled={isLoading || isAdding}
              >
                {(isLoading || isAdding) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAdding ? 'Adding Signal...' : 'Add Signal'}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || isAdding}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Parse Signal
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}