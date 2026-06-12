type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, eyebrow, actions }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/8 bg-[#080808]/95 px-6 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">{eyebrow}</p>
          ) : null}
          <h1 className="mt-1 text-2xl font-semibold text-white">{title}</h1>
        </div>
        {actions ? <div className="flex flex-col gap-2 sm:flex-row">{actions}</div> : null}
      </div>
    </header>
  );
}
