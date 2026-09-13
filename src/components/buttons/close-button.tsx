import { X } from "lucide-react";
import { ActionButton, type ActionButtonProps } from "./action-button";

export function CloseButton({
  size = "sm",
  children = size === "icon" ? null : "닫기",
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      variant="ghost"
      size={size}
      aria-label={size === "icon" ? "닫기" : undefined}
      {...props}
      icon={<X className="size-4" aria-hidden="true" />}
    >
      {children}
    </ActionButton>
  );
}
