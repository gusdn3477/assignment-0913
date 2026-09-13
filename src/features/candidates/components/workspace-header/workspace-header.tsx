import Link from "next/link";
import { Orbit } from "lucide-react";
import { Header } from "@/components/header/header";

export function WorkspaceHeader() {
  return (
    <Header
      left={
        <Link
          href="/"
          aria-label="Orbit 채용 보드 홈"
          className="flex items-center gap-2.5"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
            <Orbit className="size-6" aria-hidden />
          </span>
          <span className="text-[23px] font-bold tracking-tight">
            orbit<span className="text-primary">.</span>
          </span>
          <span className="ml-4 hidden border-l pl-5 text-sm text-muted-foreground sm:inline">
            채용 워크스페이스
          </span>
        </Link>
      }
      right={
        <div className="flex items-center gap-3">
          <span className="hidden text-right text-xs leading-5 sm:block">
            <span className="block font-medium">채용 담당자</span>
            <span className="text-muted-foreground">Orbit 팀</span>
          </span>
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-full border border-purple-100 bg-purple-50 text-xs font-semibold text-primary"
          >
            OR
          </span>
        </div>
      }
    />
  );
}
