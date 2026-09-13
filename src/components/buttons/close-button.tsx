import { X } from "lucide-react";
import { ActionButton, type ActionButtonProps } from "./action-button";

export function CloseButton({
  children = "닫기",
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      variant="ghost"
      size="sm"
      {...props}
      icon={<X className="size-4" aria-hidden="true" />}
    >
      {children}
    </ActionButton>
  );
}
