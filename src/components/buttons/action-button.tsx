import type { ComponentProps, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ActionButtonProps = Omit<
  ComponentProps<typeof Button>,
  "asChild"
> & {
  loading?: boolean;
};

export function ActionButton({
  loading = false,
  disabled,
  type = "button",
  icon,
  children,
  ...props
}: ActionButtonProps & { icon: ReactNode }) {
  return (
    <Button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || props["aria-busy"]}
    >
      {loading ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}
      {children}
    </Button>
  );
}
