import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: string;
}

export function StatusPill({ status }: StatusPillProps) {
  const s = (status || "").toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border transition-colors",
        s === "pending" && "bg-amber-50 text-amber-700 border-amber-200/50",
        s === "confirmed" && "bg-indigo-50 text-indigo-700 border-indigo-200/50",
        s === "accepted" && "bg-emerald-50 text-emerald-700 border-emerald-200/50",
        s === "completed" && "bg-emerald-50 text-emerald-700 border-emerald-200/50",
        s === "scheduled" && "bg-blue-50 text-blue-700 border-blue-200/50",
        s === "cancelled" && "bg-red-50 text-red-700 border-red-200/50"
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );
}
