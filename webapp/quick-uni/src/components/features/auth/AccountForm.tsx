"use client";

import { useForm } from "@tanstack/react-form";
import { createAccountSchema, updateAccountAdminSchema } from "@/lib/validators/account";
import { createAccountAction, updateAccountAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError, FieldContent } from "@/components/ui/field";
import { notify } from "@/lib/custom-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Account, Profile } from "@/types/profile";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AccountFormProps {
  account?: Account; // If provided, we are in edit mode
  onSuccess?: () => void;
  profiles?: Profile[]; // List of available profiles to link
  restrictType?: "student" | "personnel";
  initialProfileId?: string;
  initialProfileName?: string;
}

export function AccountForm({ 
  account, 
  onSuccess, 
  profiles = [], 
  restrictType,
  initialProfileId,
  initialProfileName 
}: AccountFormProps) {
  const router = useRouter();
  const isEdit = !!account;
  const t = useTranslations("Account");
  const toastT = useTranslations("Toast");

  const defaultType = restrictType === "student" ? "student" : "employee";

  const form = useForm({
    defaultValues: {
      username: account?.username || "",
      email: account?.email || "",
      phone: account?.phone || "",
      type: (account?.type as "student" | "employee" | "tech" | "dev") || defaultType,
      status: (account?.status as "active" | "suspended" | "banned" | "expired") || "active",
      password: "",
      profileId: initialProfileId || "",
    },
    onSubmit: async ({ value }) => {
      try {
        const schema = isEdit ? updateAccountAdminSchema : createAccountSchema;
        const validation = schema.safeParse(value);
        
        if (!validation.success) {
          const firstError = validation.error.issues[0]?.message || toastT("ValidationFailed");
          notify(firstError, { type: "error" });
          return;
        }

        let result;
        if (isEdit && account) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, profileId, ...rest } = value;
          const updateData = password ? value : rest;
          result = await updateAccountAction(account.id, updateData as z.infer<typeof updateAccountAdminSchema>);
        } else {
          result = await createAccountAction(value as z.infer<typeof createAccountSchema>, value.profileId || undefined);
        }

        if (result.success) {
          notify(isEdit ? toastT("AccountUpdated") : toastT("AccountCreated"), { type: "success" });
          onSuccess?.();
          router.refresh();
        } else {
          notify(result.error || toastT("SubmitFailed"), { type: "error" });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : toastT("SubmitFailed");
        notify(message, { type: "error" });
      }
    },
  });

  const getFieldError = (name: string) => {
    const schema = isEdit ? updateAccountAdminSchema : createAccountSchema;
    const res = schema.safeParse(form.state.values);
    if (!res.success) {
      const err = res.error.issues.find((e: z.ZodIssue) => e.path[0] === name);
      return err?.message;
    }
    return undefined;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field 
        name="username"
        validators={{
          onChange: () => getFieldError('username')
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t("Username")}</FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t("UsernamePlaceholder")}
              />
              <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <form.Field 
        name="email"
        validators={{
          onChange: () => getFieldError('email')
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t("Email")}</FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t("EmailPlaceholder")}
              />
              <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <form.Field 
        name="phone"
        validators={{
          onChange: () => getFieldError('phone')
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t("Phone")}</FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t("PhonePlaceholder")}
              />
              <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="type">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("Type")}</FieldLabel>
              <FieldContent>
                <Select
                  onValueChange={(val) => field.handleChange(val as "student" | "employee" | "tech" | "dev")}
                  value={field.state.value}
                  disabled={restrictType === "student" && !isEdit}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder={t("SelectType") || "Select type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(!restrictType || restrictType === "student") && <SelectItem value="student">{t("TypeStudent")}</SelectItem>}
                    {(!restrictType || restrictType === "personnel") && (
                      <>
                        <SelectItem value="employee">{t("TypeEmployee")}</SelectItem>
                        <SelectItem value="tech">{t("TypeTech")}</SelectItem>
                        <SelectItem value="dev">{t("TypeDev")}</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="status">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("Status")}</FieldLabel>
              <FieldContent>
                <Select
                  onValueChange={(val) => field.handleChange(val as "active" | "suspended" | "banned" | "expired")}
                  value={field.state.value}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder={t("SelectStatus") || "Select status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("StatusActive")}</SelectItem>
                    <SelectItem value="suspended">{t("StatusSuspended")}</SelectItem>
                    <SelectItem value="banned">{t("StatusBanned")}</SelectItem>
                    <SelectItem value="expired">{t("StatusExpired")}</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
              </FieldContent>
            </Field>
          )}
        </form.Field>
      </div>

      {!isEdit && (
        <form.Subscribe selector={(state) => state.values.type}>
          {(type) => type !== "dev" && (
            <form.Field name="profileId">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>{t("LinkToProfile")}</FieldLabel>
                  <FieldContent>
                    {initialProfileId ? (
                      <div className="p-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in zoom-in-95 duration-200">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-sm text-foreground">{initialProfileName || "Hồ sơ đã chọn"}</span>
                          <p className="text-[10px] font-mono text-muted-foreground/80">{initialProfileId}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold tracking-wider uppercase">
                          Đã liên kết
                        </span>
                      </div>
                    ) : (
                      <Select
                        onValueChange={(val) => field.handleChange(val)}
                        value={field.state.value}
                      >
                        <SelectTrigger id={field.name} className="w-full">
                          <SelectValue placeholder={t("SelectProfile")} />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles
                            .filter((p: any) => {
                              if (p.accountId) return false;
                              const isStudent = (p.students && p.students.length > 0) || p.profileSchema?.schemaCode?.startsWith("STD");
                              if (restrictType === "student") {
                                return isStudent;
                              }
                              if (restrictType === "personnel") {
                                return !isStudent;
                              }
                              return true;
                            })
                            .map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.fullname} ({p.nationalId})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
                  </FieldContent>
                </Field>
              )}
            </form.Field>
          )}
        </form.Subscribe>
      )}

      <form.Field 
        name="password"
        validators={{
          onChange: () => getFieldError('password')
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {isEdit ? t("PasswordOptional") : t("Password")}
            </FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="******"
              />
              <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? t("Saving") : isEdit ? t("UpdateButton") : t("CreateButton")}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}