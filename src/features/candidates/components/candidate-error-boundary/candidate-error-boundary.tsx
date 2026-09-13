"use client";

import { Component, type ReactNode } from "react";
import { RetryButton } from "@/components/buttons/retry-button";

type Props = {
  children: ReactNode;
  label: string;
  onRecover?: () => void;
};

/** Render exceptions stay within the affected region; API errors use query feedback. */
export class CandidateErrorBoundary extends Component<
  Props,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <section role="alert" className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold">
            {this.props.label} 화면을 표시하지 못했어요
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            저장된 정보는 유지됩니다. 다시 시도해 주세요.
          </p>
          <RetryButton
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => {
              this.props.onRecover?.();
              this.setState({ failed: false });
            }}
          >
            다시 시도
          </RetryButton>
        </section>
      );
    }
    return this.props.children;
  }
}
