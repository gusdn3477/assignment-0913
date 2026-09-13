import { CloseButton as BaseCloseButton } from "@/components/buttons/close-button";
import type { ActionButtonProps } from "@/components/buttons/action-button";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// The sheet owns positioning and its accessible name; the shared button stays generic.
export function CloseButton({ className, ...props }: ActionButtonProps) {
  return (
    <SheetClose asChild>
      <BaseCloseButton
        size="icon"
        aria-label="상세 닫기"
        className={cn("absolute top-5 right-5 z-10", className)}
        {...props}
      />
    </SheetClose>
  );
}
