import { cn } from "../../lib/utils";

type FilterChipProps = {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
};

export function FilterChip({
  active,
  count,
  label,
  onClick,
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      <span className="leading-none">{label}</span>
      <span
        className={cn(
          "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-none tabular-nums",
          active
            ? "bg-primary/15 text-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}
