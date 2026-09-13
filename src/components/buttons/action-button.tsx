import type { ComponentProps, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ActionButtonProps = Omit<
  ComponentProps<typeof Button>,
  "asChild"
> & {
  pending?: boolean;
};

export function ActionButton({
  pending = false,
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
      disabled={disabled || pending}
      aria-busy={pending || props["aria-busy"]}
    >
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}
      {children}
    </Button>
  );
}
