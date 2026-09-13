"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NativeInputProps = React.ComponentProps<"input">;
type InputProps = NativeInputProps & {
  wrapperClassName?: string;
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
  const input = (
    <input
      ref={inputRef}
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
        clearButton &&
          "pr-10 [&::-webkit-search-cancel-button]:appearance-none",
      )}
      {...props}
    />
  );

  if (!clearButton) return input;

  return (
    <div
      data-slot="input-wrapper"
      className={cn("relative min-w-0", wrapperClassName)}
    >
      {input}
      {canClear && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={clearButton.label ?? "입력 지우기"}
          className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
          onClick={() => {
            clearButton.onClear();
            inputRef.current?.focus();
          }}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

export { Input, type InputProps };
