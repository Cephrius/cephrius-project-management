
export function MainView({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex-1 flex flex-col overflow-y-auto rounded-xl border border-primary/0 bg-mainview/10 shadow-sm backdrop-blur supports-backdrop-filter:bg-mainview/40">
      {children}
    </div>
  );
}