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
import { useTranslations } from "next-intl";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoomFormProps {
  room?: typeof room.$inferSelect;
  buildings: (typeof building.$inferSelect)[];
  onSuccess?: () => void;
}

export function RoomForm({ room: roomData, buildings, onSuccess }: RoomFormProps) {
  const router = useRouter();
  const isEdit = !!roomData;
  const t = useTranslations("Admin");

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
           notify(validation.error.issues[0]?.message || t("ValidationFailed"), { type: "error" });
           return;
        }

        let result;
        if (isEdit && roomData) {
          result = await updateRoomAction(roomData.id, validation.data as RoomUpdateInput);
        } else {
          result = await createRoomAction(validation.data as RoomInsertInput);
        }

        if (result.success) {
          notify(t("Success"), { type: "success" });
          onSuccess?.();
          router.refresh();
        } else {
          notify(result.error || t("Failed"), { type: "error" });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : t("UnexpectedError");
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
            <FieldLabel htmlFor={field.name}>{t("Code")}</FieldLabel>
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
            <FieldLabel htmlFor={field.name}>{t("Building")}</FieldLabel>
            <FieldContent>
              <Select
                onValueChange={(val) => field.handleChange(Number(val))}
                value={field.state.value ? String(field.state.value) : ""}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue placeholder={t("SelectBuilding")} />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.code} - {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <form.Field name="capacity">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t("Capacity")}</FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : 0)}
              />
            </FieldContent>
          </Field>
        )}
      </form.Field>
      
      <form.Field name="type">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t("Type")}</FieldLabel>
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
            {isSubmitting ? t("Saving") : t("Save")}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
