import type { Stage } from "@/features/candidates/types/candidate";
export const stageStyles: Record<Stage, { dot: string; badge: string }> = {
  review: { dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700" },
  interview: { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700" },
  offer: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-800" },
  hired: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
  rejected: { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600" },
};
