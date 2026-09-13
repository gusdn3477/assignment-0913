"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NativeInputProps = React.ComponentProps<"input">;
type InputProps = NativeInputProps & {
  wrapperClassName?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
} & (
    | { clearButton?: undefined }
    | {
        value: NonNullable<NativeInputProps["value"]>;
        clearButton: { onClear: () => void; label?: string };
      }
  );

function Input({
  className,
  type,
  ref,
  clearButton,
  wrapperClassName,
  left,
  right,
  ...props
}: InputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => inputRef.current!);
  const canClear =
    clearButton &&
    !props.disabled &&
    !props.readOnly &&
    props.value !== undefined &&
    String(props.value).length > 0;
  const hasSlots = left != null || right != null || Boolean(clearButton);
  const input = (
    <input
      ref={inputRef}
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        hasSlots &&
          "flex-1 rounded-none border-0 px-0 shadow-none focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        clearButton && "[&::-webkit-search-cancel-button]:appearance-none",
        className,
      )}
      {...props}
    />
  );

  if (!hasSlots) return input;

  return (
    <div
      data-slot="input-wrapper"
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-md border border-input bg-transparent px-3 shadow-xs transition-[color,box-shadow] dark:bg-input/30",
        "has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
        "has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20",
        "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50",
        wrapperClassName,
      )}
    >
      {left != null && (
        <div
          data-slot="input-left"
          className="flex max-w-2/5 shrink-0 items-center gap-2 wrap-anywhere text-muted-foreground"
        >
          {left}
        </div>
      )}
      {input}
      {(right != null || canClear) && (
        <div
          data-slot="input-right"
          className="flex max-w-2/5 shrink-0 items-center gap-2 wrap-anywhere text-muted-foreground"
        >
          {right}
          {canClear && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={clearButton.label ?? "입력 지우기"}
              className="shrink-0 text-muted-foreground"
              onClick={() => {
                clearButton.onClear();
                inputRef.current?.focus();
              }}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export { Input, type InputProps };
