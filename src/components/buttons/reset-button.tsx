import { RotateCcw } from "lucide-react";
import { ActionButton, type ActionButtonProps } from "./action-button";

export function ResetButton({
  children = "초기화",
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      variant="ghost"
      size="sm"
      {...props}
      icon={<RotateCcw className="size-3.5" aria-hidden="true" />}
    >
      {children}
    </ActionButton>
  );
}
