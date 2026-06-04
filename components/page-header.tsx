import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, eyebrow, actions }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/95 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          {eyebrow ? <p className="text-sm font-medium text-mint">{eyebrow}</p> : null}
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{title}</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" className="h-11 shadow-sm">
            <Search size={18} />
            Rechercher
          </Button>
          {actions}
        </div>
      </div>
    </header>
  );
}

