"use client";

import { useForm } from "@tanstack/react-form";
import { createProfileSchema, updateProfileSchema } from "@/lib/validators/profile";
import { createProfileAction, updateProfileAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError, FieldContent } from "@/components/ui/field";
import { notify } from "@/lib/custom-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ProfileWithAccount, Profile } from "@/types/profile";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileFormProps {
  profile?: ProfileWithAccount | Profile; // Optional for creation
  onSuccess?: () => void;
  schemas?: { id: number; schemaCode: string }[];
}

export function ProfileForm({ profile, onSuccess, schemas = [] }: ProfileFormProps) {
  const router = useRouter();
  const isEdit = !!profile;
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
      schemaId: profile?.schemaId || (schemas.length > 0 ? schemas[0].id : 0),
    },
    onSubmit: async ({ value }) => {
      try {
        const schema = isEdit ? updateProfileSchema : createProfileSchema;
        const validation = schema.safeParse(value);
        if (!validation.success) {
           const firstError = validation.error.issues[0]?.message || toastT("ValidationFailed");
           notify(firstError, { type: "error" });
           return;
        }

        let result;
        if (isEdit && profile) {
          result = await updateProfileAction(profile.id, validation.data as z.infer<typeof updateProfileSchema>);
        } else {
          result = await createProfileAction(value as z.infer<typeof createProfileSchema>);
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
    const schema = isEdit ? updateProfileSchema : createProfileSchema;
    const res = schema.safeParse(form.state.values);
    if (!res.success) {
      const err = res.error.issues.find((e: z.core.$ZodIssue) => e.path[0] === name);
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
      {!isEdit && (
        <form.Field 
          name="schemaId"
          validators={{ onChange: () => getFieldError('schemaId') }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("ProfileSchema")}</FieldLabel>
              <FieldContent>
                <Select
                  onValueChange={(val) => field.handleChange(Number(val))}
                  value={field.state.value ? String(field.state.value) : ""}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder={t("SelectSchema")} />
                  </SelectTrigger>
                  <SelectContent>
                    {schemas.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.schemaCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors.map(e => ({ message: e as unknown as string }))} />
              </FieldContent>
            </Field>
          )}
        </form.Field>
      )}

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
                placeholder={t("FullNamePlaceholder")}
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
                <Select
                  onValueChange={(val) => field.handleChange(val as "male" | "female" | "others")}
                  value={field.state.value}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder={t("SelectGender") || "Select gender"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("Male")}</SelectItem>
                    <SelectItem value="female">{t("Female")}</SelectItem>
                    <SelectItem value="others">{t("Others")}</SelectItem>
                  </SelectContent>
                </Select>
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
                  placeholder={t("NationalIDPlaceholder")}
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
                  placeholder={t("CountryCodePlaceholder")}
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
                placeholder={t("AddressPlaceholder")}
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
                  placeholder={t("EthnicPlaceholder")}
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
                  placeholder={t("ReligiousPlaceholder")}
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
            {isSubmitting ? t("Saving") : isEdit ? t("UpdateButton") : t("CreateButton")}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
