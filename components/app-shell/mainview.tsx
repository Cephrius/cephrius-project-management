
export function MainView({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex md:flex-1 md:min-h-0 flex-col overflow-hidden rounded-xl border border-primary/0 bg-mainview/10 shadow-sm backdrop-blur supports-backdrop-filter:bg-mainview/40">
      {children}
    </div>
  );
}