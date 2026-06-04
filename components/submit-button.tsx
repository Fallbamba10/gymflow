"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

type SubmitButtonProps = ButtonProps & {
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  disabled,
  pendingLabel = "Traitement...",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} disabled={disabled || pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
