"use client";

import { Wifi } from "lucide-react";
import { ReloadButton } from "@/components/buttons/reload-button";
import { RetryButton } from "@/components/buttons/retry-button";
import {
  CANDIDATE_LOAD_ERROR_MESSAGES,
  DEFAULT_CANDIDATE_LOAD_ERROR_MESSAGE,
} from "@/constants/candidate";
import { MockApiError } from "@/api/candidate/mock-api-error";

function loadErrorMessage(error: Error | null) {
  if (error instanceof MockApiError) {
    return (
      CANDIDATE_LOAD_ERROR_MESSAGES[error.code] ??
      DEFAULT_CANDIDATE_LOAD_ERROR_MESSAGE
    );
  }
  return DEFAULT_CANDIDATE_LOAD_ERROR_MESSAGE;
}

export function CandidateLoadError({
  loading,
  error,
  onRetry,
}: {
  error: Error | null;
  loading: boolean;
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
      <RetryButton className="mt-5" onClick={onRetry} loading={loading} />
      <p role="status" className="mt-3 min-h-5 text-sm text-muted-foreground">
        {loading ? "다시 불러오는 중…" : ""}
      </p>
    </div>
  );
}

export function CandidateRefresh({
  failed,
  error,
  loading,
  blocked,
  onRetry,
}: {
  failed: boolean;
  error: Error | null;
  loading: boolean;
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
          {loading && "최신 지원자 정보를 불러오는 중…"}
        </p>
        {blocked && <p>단계 저장이 끝나면 새로고침할 수 있어요.</p>}
      </div>
      <ReloadButton onClick={onRetry} loading={loading} disabled={blocked}>
        {failed ? "다시 불러오기" : "새로고침"}
      </ReloadButton>
    </div>
  );
}
