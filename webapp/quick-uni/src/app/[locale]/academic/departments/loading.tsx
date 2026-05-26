export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden border rounded-lg bg-background animate-pulse">
      <div className="w-80 border-r bg-muted/5 flex flex-col">
        <div className="p-4 border-b space-y-4 bg-background">
          <div className="h-6 w-32 bg-muted rounded"></div>
          <div className="h-9 w-full bg-muted rounded"></div>
        </div>
        <div className="p-2 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 w-full bg-muted rounded"></div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-8 space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-muted rounded"></div>
            <div className="h-6 w-32 bg-muted rounded"></div>
          </div>
          <div className="h-10 w-32 bg-muted rounded"></div>
        </div>
        <div className="h-64 w-full bg-muted rounded border-dashed border-2"></div>
      </div>
    </div>
  );
}
