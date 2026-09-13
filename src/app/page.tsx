import { BriefcaseBusiness } from "lucide-react";
import { WorkspaceHeader } from "@/components/candidate/workspace-header/workspace-header";
import { CandidatesApp } from "@/components/candidate/app/candidates-app";

export default function Page() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 rounded bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        본문으로 바로가기
      </a>
      <WorkspaceHeader />
      <main
        id="main-content"
        className="mx-auto max-w-420 px-5 py-8 sm:px-8 lg:px-10"
      >
        <section
          className="mb-8 flex flex-wrap items-end justify-between gap-6"
          aria-labelledby="page-title"
        >
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground">
              <BriefcaseBusiness className="size-3.5" aria-hidden />
              WORKSPACE<span className="mx-1 text-border">/</span>
              <span>채용 관리</span>
            </div>
            <h1
              id="page-title"
              className="text-[28px] font-bold tracking-tight sm:text-[32px]"
            >
              좋은 동료를 만나는 여정
            </h1>
            <p className="mt-2 text-sm/6  text-muted-foreground">
              지원부터 합류까지, 채용의 모든 단계를 한눈에 관리하세요.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>내 브라우저에 자동 저장</span>
          </div>
        </section>

        <CandidatesApp />
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-[11px]/5  text-muted-foreground">
          <span>ORBIT · 작은 연결에서 시작되는 큰 가능성</span>
          <span>
            데모 데이터 · 요청 지연 200–800ms · 약 15% 확률로 실패를 재현합니다.
          </span>
        </footer>
      </main>
    </>
  );
}
