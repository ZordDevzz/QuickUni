import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProfileSchemaValidator, updateProfileSchemaValidator, CreateProfileSchemaInput, UpdateProfileSchemaInput } from "@/lib/validators/profile-schema";
import { createProfileSchemaAction, updateProfileSchemaAction } from "@/actions/profile-schema";
import { toast } from "sonner";
import { profileSchema } from "@/db/schema";
import { z } from "zod";

type ProfileSchemaType = typeof profileSchema.$inferSelect;

interface ProfileSchemaFormProps {
  initialData?: ProfileSchemaType;
  onSuccess?: () => void;
}

export function ProfileSchemaForm({ initialData, onSuccess }: ProfileSchemaFormProps) {
  const t = useTranslations("Profile");
  const isEdit = !!initialData;

  const form = useForm({
    defaultValues: {
      id: initialData?.id ?? 0,
      schemaCode: initialData?.schemaCode ?? "",
      effectiveDate: initialData?.effectiveDate ?? new Date().toISOString().split('T')[0],
      expiredDate: initialData?.expiredDate ?? "",
      des: initialData?.des ?? "",
    } as CreateProfileSchemaInput & { id: number },
    onSubmit: async ({ value }) => {
      try {
        const validator = isEdit ? updateProfileSchemaValidator : createProfileSchemaValidator;
        const validation = validator.safeParse(value);
        
        if (!validation.success) {
          const firstError = validation.error.issues[0]?.message || "Validation failed";
          toast.error(firstError);
          return;
        }

        let result;
        if (isEdit && initialData) {
          result = await updateProfileSchemaAction(initialData.id, validation.data as UpdateProfileSchemaInput);
        } else {
          result = await createProfileSchemaAction(validation.data as CreateProfileSchemaInput);
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
    const validator = isEdit ? updateProfileSchemaValidator : createProfileSchemaValidator;
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
      <form.Field
        name="schemaCode"
        validators={{
          onChange: () => getFieldError("schemaCode"),
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{t("SchemaCode")}</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors ? (
              <em className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</em>
            ) : null}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="effectiveDate"
          validators={{
            onChange: () => getFieldError("effectiveDate"),
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>{t("EffectiveDate")}</Label>
              <Input
                id={field.name}
                name={field.name}
                type="date"
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors ? (
                <em className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</em>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="expiredDate"
          validators={{
            onChange: () => getFieldError("expiredDate"),
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>{t("ExpiredDate")}</Label>
              <Input
                id={field.name}
                name={field.name}
                type="date"
                value={(field.state.value as string) || ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
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
              value={field.state.value as string}
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