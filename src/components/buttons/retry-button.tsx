import { RotateCcw } from "lucide-react";
import { ActionButton, type ActionButtonProps } from "./action-button";

export function RetryButton({
  children = "다시 불러오기",
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      variant="outline"
      {...props}
      icon={<RotateCcw className="size-4" aria-hidden="true" />}
    >
      {children}
    </ActionButton>
  );
}
