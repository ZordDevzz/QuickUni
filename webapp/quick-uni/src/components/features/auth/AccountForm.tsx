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
import { Account } from "@/types/profile";
import { useTranslations } from "next-intl";

interface AccountFormProps {
  account?: Account; // If provided, we are in edit mode
  onSuccess?: () => void;
}

export function AccountForm({ account, onSuccess }: AccountFormProps) {
  const router = useRouter();
  const isEdit = !!account;
  const t = useTranslations("Account");
  const toastT = useTranslations("Toast");

  const form = useForm({
    defaultValues: {
      username: account?.username || "",
      email: account?.email || "",
      phone: account?.phone || "",
      type: (account?.type as "student" | "employee" | "tech" | "dev") || "student",
      status: (account?.status as "active" | "suspended" | "banned" | "expired") || "active",
      password: "",
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
          const { password, ...rest } = value;
          const updateData = password ? value : rest;
          result = await updateAccountAction(account.id, updateData as z.infer<typeof updateAccountAdminSchema>);
        } else {
          result = await createAccountAction(value as z.infer<typeof createAccountSchema>);
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
                placeholder="johndoe"
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
                placeholder="john@example.com"
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
                placeholder="+1234567890"
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
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as "student" | "employee" | "tech" | "dev")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                >
                  <option value="student">Student</option>
                  <option value="employee">Employee</option>
                  <option value="tech">Tech</option>
                  <option value="dev">Dev</option>
                </select>
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
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as "active" | "suspended" | "banned" | "expired")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                  <option value="expired">Expired</option>
                </select>
                <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
              </FieldContent>
            </Field>
          )}
        </form.Field>
      </div>

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