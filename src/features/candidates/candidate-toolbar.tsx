"use client";

import { useId } from "react";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCandidateUI } from "./ui-store";

export function CandidateToolbar({
  jobs,
  total,
  filtered,
  stale = false,
}: {
  jobs: string[];
  total: number;
  filtered: number;
  stale?: boolean;
}) {
  const search = useCandidateUI((state) => state.search);
  const job = useCandidateUI((state) => state.job);
  const setSearch = useCandidateUI((state) => state.setSearch);
  const setJob = useCandidateUI((state) => state.setJob);
  const resetFilters = useCandidateUI((state) => state.resetFilters);
  const id = useId();
  const hasFilters = search !== "" || job !== "all";

  return (
    <section
      aria-label="지원자 검색 및 필터"
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="relative min-w-48 flex-1 sm:max-w-sm">
        <label htmlFor={`${id}-search`} className="sr-only">
          지원자 이름 검색
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-3 left-3 size-4 text-slate-400"
        />
        <Input
          id={`${id}-search`}
          type="search"
          value={search}
          maxLength={200}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="지원자 이름 검색"
          className="h-10 border-slate-200 bg-slate-50 pl-9"
        />
      </div>
      <div className="flex items-center gap-2">
        <SlidersHorizontal
          aria-hidden="true"
          className="size-4 text-slate-400"
        />
        <label htmlFor={`${id}-job`} className="sr-only">
          직무 필터
        </label>
        <Select value={job} onValueChange={setJob}>
          <SelectTrigger id={`${id}-job`} className="h-10 min-w-44 bg-white">
            <SelectValue placeholder="전체 직무" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 직무</SelectItem>
            {Array.from(new Set(jobs))
              .filter((value) => value && value !== "all")
              .map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="ghost"
        size="sm"
        disabled={!hasFilters}
        onClick={resetFilters}
        className="text-slate-500"
      >
        <RotateCcw aria-hidden="true" className="size-3.5" />
        초기화
      </Button>
      <p
        role="status"
        aria-live="off"
        aria-label="지원자 검색 결과"
        aria-busy={stale}
        className="w-full text-sm text-slate-500 sm:ml-auto sm:w-auto"
      >
        전체 {total}명 중{" "}
        <strong className="font-semibold text-slate-900">{filtered}명</strong>
        {stale && <span className="ml-2 text-xs">결과 업데이트 중…</span>}
      </p>
    </section>
  );
}
