"use client";

import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  createProfileFieldValidator, 
  updateProfileFieldValidator, 
  CreateProfileFieldInput, 
  UpdateProfileFieldInput 
} from "@/lib/validators/profile-field";
import { createProfileFieldAction, updateProfileFieldAction } from "@/actions/profile-field";
import { toast } from "sonner";
import { profileField } from "@/db/schema";
import { z } from "zod";

type ProfileFieldType = typeof profileField.$inferSelect;

interface ProfileFieldFormProps {
  initialData?: ProfileFieldType;
  onSuccess?: () => void;
}

const DATA_TYPES = ["string", "number", "date", "boolean", "json", "select"];
const UI_SECTIONS = ["personal", "academic", "contact", "finance", "extra"];

export function ProfileFieldForm({ initialData, onSuccess }: ProfileFieldFormProps) {
  const t = useTranslations("Profile");
  const isEdit = !!initialData;

  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      datatype: initialData?.datatype ?? "string",
      uiSection: initialData?.uiSection ?? "personal",
      label: initialData?.label ?? "",
      des: initialData?.des ?? "",
    } as CreateProfileFieldInput,
    onSubmit: async ({ value }) => {
      try {
        const validator = isEdit ? updateProfileFieldValidator : createProfileFieldValidator;
        const validation = validator.safeParse(value);
        
        if (!validation.success) {
          const firstError = validation.error.issues[0]?.message || "Validation failed";
          toast.error(firstError);
          return;
        }

        let result;
        if (isEdit && initialData) {
          result = await updateProfileFieldAction(initialData.id, validation.data as UpdateProfileFieldInput);
        } else {
          result = await createProfileFieldAction(validation.data as CreateProfileFieldInput);
        }

        if (result.success) {
          toast.success(isEdit ? t("UpdateSuccess") : t("CreateSuccess"));
          onSuccess?.();
        } else {
          toast.error(result.error);
        }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    },
  });

  const getFieldError = (name: string) => {
    const validator = isEdit ? updateProfileFieldValidator : createProfileFieldValidator;
    const res = validator.safeParse(form.state.values);
    if (!res.success) {
      const err = (res.error.issues as z.ZodIssue[]).find((e) => e.path[0] === name);
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
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="name"
          validators={{
            onChange: () => getFieldError("name"),
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>{t("FieldName")}</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. graduation_year"
              />
              {field.state.meta.errors ? (
                <em className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</em>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="label"
          validators={{
            onChange: () => getFieldError("label"),
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>{t("Label")}</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. Graduation Year"
              />
              {field.state.meta.errors ? (
                <em className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</em>
              ) : null}
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="datatype"
          validators={{
            onChange: () => getFieldError("datatype"),
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>{t("DataType")}</Label>
              <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {DATA_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
              {field.state.meta.errors ? (
                <em className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</em>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="uiSection"
          validators={{
            onChange: () => getFieldError("uiSection"),
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>{t("UISection")}</Label>
              <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {UI_SECTIONS.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
              {field.state.meta.errors ? (
                <em className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</em>
              ) : null}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="des">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{t("Description")}</Label>
            <textarea
              id={field.name}
              name={field.name}
              value={(field.state.value as string) || ""}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        )}
      </form.Field>

      <div className="flex justify-end gap-2">
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "..." : isEdit ? t("Update") : t("Create")}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
