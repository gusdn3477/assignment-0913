"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section
        role="alert"
        className="max-w-md rounded-2xl border bg-white p-10 text-center shadow-sm"
      >
        <AlertCircle
          className="mx-auto mb-5 size-10 text-destructive"
          aria-hidden
        />
        <h1 className="text-xl font-semibold">화면을 불러오지 못했어요</h1>
        <p className="my-3 text-sm/6  text-muted-foreground">
          일시적인 문제가 발생했습니다. 다시 시도해 주세요. 저장된 지원자 정보는
          그대로 유지됩니다.
        </p>
        <Button onClick={reset} className="mt-3">
          <RotateCcw className="size-4" />
          다시 시도
        </Button>
      </section>
    </main>
  );
}
