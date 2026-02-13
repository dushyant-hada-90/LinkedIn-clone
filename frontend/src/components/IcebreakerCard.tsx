import { Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useIcebreaker, IcebreakerOption } from '../hooks/useIcebreaker';

interface IcebreakerCardProps {
  userId: string;
  userName: string;
}

const toneColors: Record<string, string> = {
  professional: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  friendly: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  witty: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

export default function IcebreakerCard({ userId, userName }: IcebreakerCardProps) {
  const { data, loading, error, generate } = useIcebreaker();
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!data && !loading) {
    return (
      <button
        onClick={() => generate(userId)}
        className="flex items-center gap-2 rounded-lg border border-dashed border-primary/40 px-4 py-3 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
      >
        <Sparkles className="h-4 w-4" />
        Smart Connect — Generate icebreaker for {userName}
      </button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Generating personalised icebreakers…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3 rounded-lg border border-primary/20 bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles className="h-4 w-4" />
        {data.greeting}
      </div>

      {data.sharedInterests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.sharedInterests.map((interest: string) => (
            <span
              key={interest}
              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {interest}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {data.options.map((option: IcebreakerOption, i: number) => (
          <div
            key={i}
            className="group flex items-start justify-between gap-3 rounded-md border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/60"
          >
            <div className="flex-1 space-y-1">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${toneColors[option.tone] || ''}`}
              >
                {option.tone}
              </span>
              <p className="text-sm leading-relaxed text-foreground">{option.message}</p>
            </div>
            <button
              onClick={() => handleCopy(option.message, i)}
              className="mt-1 shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              title="Copy to clipboard"
            >
              {copied === i ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
