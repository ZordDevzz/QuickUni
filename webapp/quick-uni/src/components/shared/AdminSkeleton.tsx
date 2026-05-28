"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export default function SkeletonPage({ title }: { title: string }) {
  const t = useTranslations("Common");
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t("ComingSoon")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("ComingSoonDesc", { title: title.toLowerCase() })}
          </p>
          <div className="mt-6 h-48 w-full animate-pulse rounded-lg bg-muted"></div>
        </CardContent>
      </Card>
    </div>
  );
}
