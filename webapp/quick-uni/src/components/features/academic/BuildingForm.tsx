"use client";

import { useForm } from "@tanstack/react-form";
import { BuildingInsertInput, buildingInsertSchema, buildingUpdateSchema } from "@/lib/validators/facility";
import { createBuildingAction, updateBuildingAction } from "@/actions/facility";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { notify } from "@/lib/custom-toast";
import { useRouter } from "next/navigation";

interface Building {
  id: number;
  code: string;
  name: string;
  des?: string | null;
}

interface BuildingFormProps {
  building?: Building;
  onSuccess?: () => void;
}

export function BuildingForm({ building, onSuccess }: BuildingFormProps) {
  const router = useRouter();
  const isEdit = !!building;

  const form = useForm({
    defaultValues: {
      code: building?.code || "",
      name: building?.name || "",
      des: building?.des || "",
    },
    onSubmit: async ({ value }) => {
      try {
        const schema = isEdit ? buildingUpdateSchema : buildingInsertSchema;
        const validation = schema.safeParse(value);
        if (!validation.success) {
           notify(validation.error.issues[0]?.message || "Validation failed", { type: "error" });
           return;
        }

        let result;
        if (isEdit && building) {
          result = await updateBuildingAction(building.id, validation.data);
        } else {
          result = await createBuildingAction(validation.data as BuildingInsertInput);
        }

        if (result.success) {
          notify("Success", { type: "success" });
          onSuccess?.();
          router.refresh();
        } else {
          notify(result.error || "Failed", { type: "error" });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        notify(message, { type: "error" });
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="code">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Code</FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <form.Field name="name">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <form.Field name="des">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Description</FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
