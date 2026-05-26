"use client";

import { useState, useEffect } from "react";
import { 
  getSessionAction, 
  executeOnboardingSession, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  ActionResponse 
} from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  LayoutDashboard 
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";

interface OnboardingStep3Props {
  sessionId: string;
  onComplete?: () => void;
}

export function OnboardingStep3({ sessionId, onComplete }: OnboardingStep3Props) {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const t = useTranslations("Onboarding");

  const fetchSession = async () => {
    const res = await getSessionAction(sessionId);
    if (res.success && res.data) {
      setSession(res.data);
      if ((res.data as any).status !== "processing") {
        setExecuting(false);
      } else {
        setExecuting(true);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSession();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Polling during processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (executing) {
      interval = setInterval(fetchSession, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executing]);

  const handleStart = async () => {
    setExecuting(true);
    const res = await executeOnboardingSession(sessionId);
    if (!res.success) {
      toast.error(res.error || t("Failed"));
      setExecuting(false);
    } else {
      toast.success(t("ExecutionComplete"));
      fetchSession();
      if (onComplete) onComplete();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const summary = session?.summary || {};
  const totalToProcess = summary.valid || 0;
  const processed = summary.currentProcessed || 0;
  const successCount = summary.success || 0;
  const failCount = summary.failed || 0;
  const progress = totalToProcess > 0 ? (processed / totalToProcess) * 100 : 0;

  const isCompleted = session?.status === "completed" || session?.status === "failed";
  const isProcessing = session?.status === "processing";

  return (
    <Card className="max-w-3xl mx-auto border-2">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isCompleted ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <AlertCircle className="h-6 w-6 text-primary" />
          )}
          <span>{t("Step3Title")}</span>
        </CardTitle>
        <CardDescription>{t("Step3Description")}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">{t("Name")}</p>
            <p className="font-semibold">{session?.name}</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">{t("Type")}</p>
            <p className="font-semibold capitalize">{session?.entityType}</p>
          </div>
        </div>

        {(isProcessing || isCompleted) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{isProcessing ? t("ProcessingOnboarding") : t("ExecutionComplete")}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{processed} / {totalToProcess} {t("TotalRows")}</span>
              <div className="space-x-4">
                <span className="text-green-600">{t("Success")}: {successCount}</span>
                <span className="text-red-600">{t("Failed")}: {failCount}</span>
              </div>
            </div>
          </div>
        )}

        {!isProcessing && !isCompleted && (
          <div className="text-center p-8 bg-primary/5 rounded-xl border border-primary/20">
            <p className="mb-4 text-muted-foreground">
              {t("ReadyToProcess", { count: totalToProcess })}
            </p>
            <Button size="lg" onClick={handleStart} className="px-8">
              <PlayCircle className="mr-2 h-5 w-5" />
              {t("StartProvisioning")}
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
        <Button variant="outline" asChild>
          <Link href="/admin/onboarding">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {t("BackToDashboard")}
          </Link>
        </Button>
        
        {isCompleted && (
          <Button variant="default" asChild>
            <a href={`/api/admin/onboarding/report/${sessionId}`} download>
              <Download className="mr-2 h-4 w-4" />
              {t("DownloadReport")}
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Add PlayCircle icon to lucide-react import
import { PlayCircle } from "lucide-react";
