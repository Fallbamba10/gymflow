import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  inverse?: boolean;
};

export function BrandMark({ className, inverse = false }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-md",
        inverse ? "bg-white text-ink" : "bg-ink text-white",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="size-7">
        <path d="M18 36h28v7H18z" fill="#1E8A6A" />
        <path d="M14 25h8v18h-8zM42 25h8v18h-8z" fill="currentColor" />
        <path d="M25 19h14v7H25z" fill="#D7932F" />
        <path d="M25 36h14v7H25z" fill="currentColor" />
      </svg>
    </span>
  );
}
