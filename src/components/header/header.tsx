import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeaderProps = Omit<ComponentProps<"header">, "children"> & {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  contentClassName?: string;
};

export function Header({
  left,
  center,
  right,
  className,
  contentClassName,
  ...props
}: HeaderProps) {
  return (
    <header {...props} className={cn("border-b bg-white", className)}>
      <div
        className={cn(
          "mx-auto grid min-h-[72px] max-w-[1680px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-5 py-3 sm:px-8 lg:px-10",
          center != null &&
            "md:grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)]",
          contentClassName,
        )}
      >
        <div
          data-slot="header-left"
          className="min-w-0 [overflow-wrap:anywhere]"
        >
          {left}
        </div>
        {center != null && (
          <div
            data-slot="header-center"
            className="col-span-2 row-start-2 min-w-0 text-center [overflow-wrap:anywhere] md:col-span-1 md:col-start-2 md:row-start-1"
          >
            {center}
          </div>
        )}
        <div
          data-slot="header-right"
          className={cn(
            "col-start-2 row-start-1 min-w-0 justify-self-end [overflow-wrap:anywhere]",
            center != null && "md:col-start-3",
          )}
        >
          {right}
        </div>
      </div>
    </header>
  );
}
