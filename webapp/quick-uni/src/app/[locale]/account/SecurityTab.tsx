"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/actions/account";
import { notify } from "@/lib/custom-toast";
import { Loader2, KeyRound, ShieldCheck, Eye, EyeOff, Globe, Monitor, ShieldAlert, History } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { changePasswordSchema } from "@/lib/validators/account";
import { useTranslations } from "next-intl";

interface SecurityTabProps {
  audits?: any[];
}

export function SecurityTab({ audits = [] }: SecurityTabProps) {
  const t = useTranslations("AccountSettings");
  const [loading, setLoading] = useState(false);
  
  // Show/Hide password toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      const validation = changePasswordSchema.safeParse(value);
      if (!validation.success) {
        notify(validation.error.issues[0]?.message || "Validation failed", { type: "error" });
        return;
      }

      setLoading(true);
      try {
        const result = await changePasswordAction(value);
        if (result.success) {
          notify(t("PasswordSuccess"), { type: "success" });
          form.reset();
        } else {
          notify(result.error || "Failed to change password", { type: "error" });
        }
      } catch (error) {
        notify("System error", { type: "error" });
      } finally {
        setLoading(false);
      }
    },
  });

  // Action formatters for activity log
  const getActionLabel = (action: string) => {
    switch (action) {
      case "change_password":
        return "Password Changed";
      case "update_profile":
        return "Profile Updated";
      case "update_status":
        return "Status Updated";
      default:
        return action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "change_password":
        return <KeyRound className="h-4 w-4 text-amber-500" />;
      case "update_status":
        return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      default:
        return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
    }
  };

  const getBrowser = (userAgent: string) => {
    if (!userAgent) return "Unknown Device";
    if (userAgent.includes("Chrome")) return "Google Chrome";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
    if (userAgent.includes("Firefox")) return "Mozilla Firefox";
    if (userAgent.includes("Edge")) return "Microsoft Edge";
    return "Browser/Device";
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* PASSWORD CHANGE CARD */}
      <Card className="border border-border/80 shadow-md overflow-hidden bg-card/45 backdrop-blur-md">
        <CardHeader className="bg-muted/40 border-b border-border/50 py-4 px-6">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg font-bold">{t("ChangePassword")}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{t("PasswordDescription")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <CardContent className="p-6 space-y-6">
            {/* Current Password */}
            <form.Field name="currentPassword">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("CurrentPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      type={showCurrent ? "text" : "password"}
                      className="bg-background/80 pr-10"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </form.Field>

            {/* New Password */}
            <form.Field name="newPassword">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("NewPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      type={showNew ? "text" : "password"}
                      className="bg-background/80 pr-10"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </form.Field>

            {/* Confirm Password */}
            <form.Field name="confirmPassword">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("ConfirmNewPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      type={showConfirm ? "text" : "password"}
                      className="bg-background/80 pr-10"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </form.Field>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t border-border/50 py-4 px-6 flex justify-end">
            <form.Subscribe selector={(state) => [state.isSubmitting]}>
              {([isSubmitting]) => (
                <Button type="submit" disabled={loading || isSubmitting} className="rounded-xl shadow-lg hover:shadow-primary/20 transition-all select-none">
                  {(loading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("UpdatePassword")}
                </Button>
              )}
            </form.Subscribe>
          </CardFooter>
        </form>
      </Card>

      {/* SECURITY ACTIVITY LOG TIMELINE */}
      <Card className="border border-border/80 shadow-md overflow-hidden bg-card/45 backdrop-blur-md">
        <CardHeader className="bg-muted/40 border-b border-border/50 py-4 px-6">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg font-bold">{t("SecurityAudit")}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{t("SecurityAuditDesc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {audits.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground select-none">
              No recent security activity logs found.
            </div>
          ) : (
            <div className="relative pl-6 border-l border-border/80 space-y-6">
              {audits.map((audit) => {
                const actionLabel = getActionLabel(audit.action);
                const browser = getBrowser(audit.userAgent);

                return (
                  <div key={audit.id} className="relative group">
                    {/* Circle Node Indicator */}
                    <div className="absolute -left-[35px] top-1 bg-background border-2 border-border/90 rounded-full p-1.5 flex items-center justify-center shadow-sm group-hover:border-primary transition-all select-none">
                      {getActionIcon(audit.action)}
                    </div>
                    
                    {/* Log Details Container */}
                    <div className="space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-semibold text-foreground text-sm tracking-tight">
                          {actionLabel}
                        </span>
                        <span className="text-xxs font-mono text-muted-foreground">
                          {formatTime(audit.createAt)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/80 select-none">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground/50" />
                          <span>IP: <code className="font-mono bg-muted/80 px-1.5 py-0.5 rounded text-foreground">{audit.ipAddress || "127.0.0.1"}</code></span>
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Monitor className="h-3.5 w-3.5 text-muted-foreground/50" />
                          <span>{browser}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
