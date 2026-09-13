import { RefreshCw } from "lucide-react";
import { ActionButton, type ActionButtonProps } from "./action-button";

export function ReloadButton({
  children = "새로고침",
  ...props
}: ActionButtonProps) {
  return (
    <ActionButton
      variant="ghost"
      size="sm"
      {...props}
      icon={<RefreshCw className="size-4" aria-hidden="true" />}
    >
      {children}
    </ActionButton>
  );
}
