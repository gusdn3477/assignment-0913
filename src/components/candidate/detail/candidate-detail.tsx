"use client";

import { useRef } from "react";
import { Mail, CalendarDays, BriefcaseBusiness } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { STAGE_LABELS } from "@/features/candidates/constants/candidate";
import { type Candidate } from "@/features/candidates/types/candidate";
import { useCandidateUI } from "@/features/candidates/stores/ui-store";

export function CandidateDetail({
  candidate,
}: {
  candidate: Candidate | null;
}) {
  const selectedId = useCandidateUI((state) => state.selectedId);
  const selectCandidate = useCandidateUI((state) => state.selectCandidate);
  const returnId = useRef<string | null>(null);
  return (
    <Sheet
      open={selectedId !== null}
      onOpenChange={(open) => {
        if (!open) selectCandidate(null);
      }}
    >
      <SheetContent
        closeButtonProps={{ "aria-label": "상세 닫기" }}
        className="w-full overflow-y-auto border-slate-200 bg-white p-0 sm:max-w-lg"
        onOpenAutoFocus={() => {
          returnId.current = selectedId;
        }}
        onCloseAutoFocus={(event) => {
          const trigger = Array.from(
            document.querySelectorAll<HTMLButtonElement>(
              "[data-candidate-detail]",
            ),
          ).find(
            (element) => element.dataset.candidateDetail === returnId.current,
          );
          if (trigger) {
            event.preventDefault();
            trigger.focus();
          }
        }}
      >
        <SheetHeader className="border-b border-slate-100 bg-slate-50 px-7 pt-10 pb-7">
          <p className="mb-4 text-xs font-semibold tracking-widest text-slate-500">
            CANDIDATE PROFILE
          </p>
          <div
            aria-hidden="true"
            className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-semibold text-indigo-700"
          >
            {candidate?.name.slice(0, 1) ?? "?"}
          </div>
          <SheetTitle className="text-2xl tracking-tight">
            {candidate?.name ?? "지원자 정보"}
          </SheetTitle>
          <SheetDescription>
            {candidate?.job ?? "지원자 정보를 찾을 수 없습니다."}
          </SheetDescription>
        </SheetHeader>
        {candidate && (
          <div className="space-y-8 px-7 py-4">
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">
                현재 채용 단계
              </p>
              <Badge
                variant="secondary"
                className="bg-indigo-50 px-3 py-1 text-indigo-700"
              >
                {STAGE_LABELS[candidate.stage]}
              </Badge>
            </div>
            <dl className="space-y-5 text-sm">
              <div>
                <dt className="mb-1.5 flex items-center gap-2 text-slate-500">
                  <BriefcaseBusiness aria-hidden="true" className="size-4" />
                  지원 직무
                </dt>
                <dd className="pl-6 text-slate-900">{candidate.job}</dd>
              </div>
              <div>
                <dt className="mb-1.5 flex items-center gap-2 text-slate-500">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  지원일
                </dt>
                <dd className="pl-6 text-slate-900">
                  <time dateTime={candidate.appliedAt}>
                    {candidate.appliedAt.slice(0, 10).replaceAll("-", ". ")}
                  </time>
                </dd>
              </div>
              <div>
                <dt className="mb-1.5 flex items-center gap-2 text-slate-500">
                  <Mail aria-hidden="true" className="size-4" />
                  이메일
                </dt>
                <dd className="break-all pl-6 text-slate-900">
                  {candidate.email}
                </dd>
              </div>
            </dl>
            <div className="border-t border-slate-100 pt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                지원자 소개
              </h3>
              <p className="whitespace-pre-wrap text-sm/7  text-slate-600">
                {candidate.summary}
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
