interface SpinnerProps {
  label?: string;
  full?: boolean;
}

export function Spinner({ label, full }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${full ? 'h-screen w-full' : 'py-6'}`}>
      <div className="flex items-center gap-3 rounded-full bg-card/70 px-4 py-2 shadow">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        {label && <span className="text-sm font-semibold">{label}</span>}
      </div>
    </div>
  );
}
