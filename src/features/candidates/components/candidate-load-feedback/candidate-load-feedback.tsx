"use client";

import { Wifi } from "lucide-react";
import { RetryButton } from "@/components/buttons/retry-button";
import { MockApiError } from "@/features/candidates/api/mock-api-error";

function loadErrorMessage(error: Error | null) {
  if (error instanceof MockApiError) {
    if (error.code === "corrupt-storage")
      return "저장된 지원자 정보를 읽을 수 없어요. 브라우저 저장 데이터를 확인한 뒤 다시 불러와 주세요.";
    if (error.code === "storage")
      return "브라우저 저장소에 접근할 수 없어요. 사이트의 저장소 사용 설정을 확인한 뒤 다시 불러와 주세요.";
  }
  return "잠시 후 다시 불러와 주세요.";
}

export function CandidateLoadError({
  pending,
  error,
  onRetry,
}: {
  error: Error | null;
  pending: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed bg-white p-8 text-center">
      <Wifi className="mb-4 size-8 text-muted-foreground" aria-hidden />
      <div role="alert">
        <h3 className="font-semibold">지원자를 불러오지 못했어요</h3>
        <p className="mt-2 max-w-md text-sm/6  text-muted-foreground">
          {loadErrorMessage(error)}
        </p>
      </div>
      <RetryButton className="mt-5" onClick={onRetry} pending={pending} />
      <p role="status" className="mt-3 min-h-5 text-sm text-muted-foreground">
        {pending ? "다시 불러오는 중…" : ""}
      </p>
    </div>
  );
}

export function CandidateRefresh({
  failed,
  error,
  pending,
  blocked,
  onRetry,
}: {
  failed: boolean;
  error: Error | null;
  pending: boolean;
  blocked: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
      <div>
        {failed && (
          <p role="alert" className="text-destructive">
            최신 정보를 불러오지 못했어요. 현재 표시된 지원자 정보는 유지됩니다.{" "}
            {loadErrorMessage(error)}
          </p>
        )}
        <p role="status" className="min-h-4">
          {pending && "최신 지원자 정보를 불러오는 중…"}
        </p>
        {blocked && <p>단계 저장이 끝나면 새로고침할 수 있어요.</p>}
      </div>
      <RetryButton
        variant="ghost"
        size="sm"
        onClick={onRetry}
        pending={pending}
        disabled={blocked}
      >
        {failed ? "다시 불러오기" : "새로고침"}
      </RetryButton>
    </div>
  );
}
