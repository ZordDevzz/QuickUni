"use client";

import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { getFieldsForSchema, SchemaField } from "@/actions/schema-field";

interface ProfileFormProps {
  profile?: ProfileWithAccount | Profile; // Optional for creation
  onSuccess?: (profileId?: string, fullname?: string, code?: string) => void;
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
      dynamicData: (profile?.dynamicData || {}) as Record<string, any>,
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
          onSuccess?.((result as any).profileId, value.fullname, (result as any).code);
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

      <form.Subscribe selector={(state) => state.values.schemaId}>
        {(schemaId) => (
          <DynamicFields schemaId={Number(schemaId)} form={form} />
        )}
      </form.Subscribe>

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

interface DynamicFieldsProps {
  schemaId: number;
  form: any;
}

function DynamicFields({ schemaId, form }: DynamicFieldsProps) {
  const [fields, setFields] = useState<SchemaField[]>([]);

  useEffect(() => {
    async function loadFields() {
      if (schemaId) {
        const data = await getFieldsForSchema(schemaId);
        setFields(data);
      } else {
        setFields([]);
      }
    }
    loadFields();
  }, [schemaId]);

  if (fields.length === 0) return null;

  const sections = fields.reduce((acc, field) => {
    const section = field.profileField.uiSection || "Extra";
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, SchemaField[]>);

  return (
    <form.Field name="dynamicData">
      {(dynamicDataField: any) => {
        const dynamicValue = (dynamicDataField.state.value || {}) as Record<string, any>;
        return (
          <div className="space-y-6 pt-4 border-t border-border/40">
            {Object.entries(sections).map(([sectionName, sectionFields]) => (
              <div key={sectionName} className="space-y-4">
                <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground border-b pb-1.5 capitalize">
                  {sectionName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sectionFields.map((field) => {
                    const fieldName = field.profileField.name;
                    if (!fieldName) return null;
                    const value = dynamicValue[fieldName] ?? "";
                    const isRequired = field.isRequired;

                    const handleFieldChange = (val: any) => {
                      dynamicDataField.handleChange({
                        ...dynamicValue,
                        [fieldName]: val,
                      });
                    };

                    const datatype = field.profileField.datatype;

                    return (
                      <Field key={field.fieldId}>
                        {datatype !== "boolean" && (
                          <FieldLabel htmlFor={fieldName}>
                            {field.profileField.label}
                            {isRequired && <span className="text-destructive ml-1">*</span>}
                          </FieldLabel>
                        )}
                        <FieldContent>
                          {datatype === "boolean" ? (
                            <div className="flex items-center space-x-2 py-2">
                              <Checkbox
                                id={fieldName}
                                checked={!!value}
                                onCheckedChange={handleFieldChange}
                              />
                              <FieldLabel
                                htmlFor={fieldName}
                                className="cursor-pointer font-normal text-sm"
                              >
                                {field.profileField.label}
                                {isRequired && <span className="text-destructive ml-1">*</span>}
                              </FieldLabel>
                            </div>
                          ) : datatype === "number" ? (
                            <Input
                              id={fieldName}
                              type="number"
                              value={value}
                              onChange={(e) =>
                                handleFieldChange(
                                  e.target.value === "" ? "" : Number(e.target.value)
                                )
                              }
                              placeholder={field.profileField.label || ""}
                              required={isRequired}
                            />
                          ) : datatype === "date" ? (
                            <Input
                              id={fieldName}
                              type="date"
                              value={value}
                              onChange={(e) => handleFieldChange(e.target.value)}
                              required={isRequired}
                            />
                          ) : (
                            <Input
                              id={fieldName}
                              value={value}
                              onChange={(e) => handleFieldChange(e.target.value)}
                              placeholder={field.profileField.label || ""}
                              required={isRequired}
                            />
                          )}
                        </FieldContent>
                      </Field>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      }}
    </form.Field>
  );
}
