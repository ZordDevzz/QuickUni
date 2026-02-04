"use client";

import { useForm } from "@tanstack/react-form";
import { updateProfileSchema } from "@/lib/validators/profile";
import { updateProfileAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError, FieldContent } from "@/components/ui/field";
import { notify } from "@/lib/custom-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ProfileWithAccount } from "@/types/profile";
import { useTranslations } from "next-intl";

interface ProfileFormProps {
  profile: ProfileWithAccount;
  onSuccess?: () => void;
}

export function ProfileForm({ profile, onSuccess }: ProfileFormProps) {
  const router = useRouter();
  const t = useTranslations("Profile");
  const toastT = useTranslations("Toast");

  const form = useForm({
    defaultValues: {
      fullname: profile?.fullname || "",
      gender: (profile?.gender as "male" | "female" | "others") || "male",
      dob: profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : "",
      address: profile?.address || "",
      countryCode: profile?.countryCode || "",
      nationalId: profile?.nationalId || "",
      ethnic: profile?.ethnic || "",
      religious: profile?.religious || "",
    },
    onSubmit: async ({ value }) => {
      try {
        const validation = updateProfileSchema.safeParse(value);
        if (!validation.success) {
           const firstError = validation.error.issues[0]?.message || toastT("ValidationFailed");
           notify(firstError, { type: "error" });
           return;
        }

        const result = await updateProfileAction(profile.id, validation.data);

        if (result.success) {
          notify(toastT("ProfileUpdated"), { type: "success" });
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
    const res = updateProfileSchema.safeParse(form.state.values);
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
        name="fullname"
        validators={{ onChange: () => getFieldError('fullname') }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t("FullName")}</FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="John Doe"
              />
              <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field 
          name="gender"
          validators={{ onChange: () => getFieldError('gender') }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("Gender")}</FieldLabel>
              <FieldContent>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as "male" | "female" | "others")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                >
                  <option value="male">{t("Male")}</option>
                  <option value="female">{t("Female")}</option>
                  <option value="others">{t("Others")}</option>
                </select>
                <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field 
          name="dob"
          validators={{ onChange: () => getFieldError('dob') }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("DateOfBirth")}</FieldLabel>
              <FieldContent>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
              </FieldContent>
            </Field>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field 
          name="nationalId"
          validators={{ onChange: () => getFieldError('nationalId') }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("NationalID")}</FieldLabel>
              <FieldContent>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="123456789"
                />
                <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field 
          name="countryCode"
          validators={{ onChange: () => getFieldError('countryCode') }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("CountryCode")}</FieldLabel>
              <FieldContent>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="US"
                  maxLength={2}
                />
                <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
              </FieldContent>
            </Field>
          )}
        </form.Field>
      </div>

      <form.Field 
        name="address"
        validators={{ onChange: () => getFieldError('address') }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t("Address")}</FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="123 Main St, City, Country"
              />
              <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field 
          name="ethnic"
          validators={{ onChange: () => getFieldError('ethnic') }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("Ethnic")}</FieldLabel>
              <FieldContent>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Caucasian"
                />
                <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field 
          name="religious"
          validators={{ onChange: () => getFieldError('religious') }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("Religious")}</FieldLabel>
              <FieldContent>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. None"
                />
                <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
              </FieldContent>
            </Field>
          )}
        </form.Field>
      </div>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? t("Saving") : t("UpdateButton")}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}