import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SkeletonPage({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This module is under development. It will soon provide full management for {title.toLowerCase()}.
          </p>
          <div className="mt-6 h-48 w-full animate-pulse rounded-lg bg-muted"></div>
        </CardContent>
      </Card>
    </div>
  );
}
