"use client";

import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { RetryButton } from "@/components/buttons/retry-button";

type Props = {
  children: ReactNode;
  label: string;
  onRecover?: () => void;
};

/** Render exceptions stay within the affected region; API errors use query feedback. */
export function CandidateErrorBoundary({ children, label, onRecover }: Props) {
  return (
    <ErrorBoundary
      onReset={onRecover}
      fallbackRender={({ resetErrorBoundary }) => (
        <section role="alert" className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold">{label} 화면을 표시하지 못했어요</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            저장된 정보는 유지됩니다. 다시 시도해 주세요.
          </p>
          <RetryButton
            type="button"
            variant="outline"
            className="mt-4"
            onClick={resetErrorBoundary}
          >
            다시 시도
          </RetryButton>
        </section>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
