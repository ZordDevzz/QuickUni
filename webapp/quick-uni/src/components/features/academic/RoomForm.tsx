"use client";

import { useForm } from "@tanstack/react-form";
import { roomInsertSchema, roomUpdateSchema, RoomInsertInput, RoomUpdateInput } from "@/lib/validators/facility";
import { createRoomAction, updateRoomAction } from "@/actions/facility";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { notify } from "@/lib/custom-toast";
import { useRouter } from "next/navigation";
import { building, room } from "@/db/schemas/schedule";

interface RoomFormProps {
  room?: typeof room.$inferSelect;
  buildings: (typeof building.$inferSelect)[];
  onSuccess?: () => void;
}

export function RoomForm({ room: roomData, buildings, onSuccess }: RoomFormProps) {
  const router = useRouter();
  const isEdit = !!roomData;

  const form = useForm({
    defaultValues: {
      code: roomData?.code || "",
      buildingId: roomData?.buildingId || (buildings.length > 0 ? buildings[0].id : ""),
      capacity: roomData?.capacity || 0,
      type: roomData?.type || "",
    },
    onSubmit: async ({ value }) => {
      try {
        const schema = isEdit ? roomUpdateSchema : roomInsertSchema;
        const validation = schema.safeParse(value);
        if (!validation.success) {
           notify(validation.error.issues[0]?.message || "Validation failed", { type: "error" });
           return;
        }

        let result;
        if (isEdit && roomData) {
          result = await updateRoomAction(roomData.id, validation.data as RoomUpdateInput);
        } else {
          result = await createRoomAction(validation.data as RoomInsertInput);
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

      <form.Field name="buildingId">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Building</FieldLabel>
            <FieldContent>
              <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                >
                  <option value="">Select Building</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <form.Field name="capacity">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Capacity</FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : "")}
              />
            </FieldContent>
          </Field>
        )}
      </form.Field>
      
      <form.Field name="type">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Type</FieldLabel>
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
