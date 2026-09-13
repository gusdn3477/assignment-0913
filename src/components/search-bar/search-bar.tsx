"use client";

import { useImperativeHandle, useRef } from "react";
import { Search } from "lucide-react";
import { CloseButton } from "@/components/buttons/close-button";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchBarProps = Omit<InputProps, "clearButton" | "type"> & {
  onClear?: () => void;
};

export function SearchBar({
  onClear,
  ref,
  disabled,
  readOnly,
  left = <Search className="size-4" aria-hidden="true" />,
  right,
  className,
  wrapperClassName,
  ...props
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!);

  return (
    <Input
      {...props}
      ref={inputRef}
      type="search"
      disabled={disabled}
      readOnly={readOnly}
      className={cn(
        "h-10 [&::-webkit-search-cancel-button]:appearance-none",
        className,
      )}
      wrapperClassName={cn("border-slate-200 bg-slate-50", wrapperClassName)}
      left={left}
      right={
        onClear ? (
          <>
            {right}
            <CloseButton
              size="icon"
              disabled={disabled || readOnly}
              aria-label="검색어 지우기"
              className="size-7 shrink-0 text-muted-foreground"
              onClick={() => {
                onClear();
                inputRef.current?.focus();
              }}
            />
          </>
        ) : (
          right
        )
      }
    />
  );
}
