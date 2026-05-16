"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/actions/account";
import { notify } from "@/lib/custom-toast";
import { Loader2 } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { changePasswordSchema } from "@/lib/validators/account";
import { useTranslations } from "next-intl";

export function SecurityTab() {
  const t = useTranslations("AccountSettings");
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      // Manual validation
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("ChangePassword")}</CardTitle>
          <CardDescription>
            {t("PasswordDescription")}
          </CardDescription>
        </CardHeader>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <CardContent className="space-y-4">
            <form.Field
              name="currentPassword"
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t("CurrentPassword")}</Label>
                  <Input
                    id={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field
              name="newPassword"
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t("NewPassword")}</Label>
                  <Input
                    id={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field
              name="confirmPassword"
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t("ConfirmNewPassword")}</Label>
                  <Input
                    id={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </CardContent>
          <CardFooter>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={loading || isSubmitting}>
                  {(loading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("UpdatePassword")}
                </Button>
              )}
            </form.Subscribe>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
