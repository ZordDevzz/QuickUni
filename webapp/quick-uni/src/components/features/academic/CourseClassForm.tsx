"use client";

import { useForm } from "@tanstack/react-form";
import { courseClassInsertSchema, courseClassUpdateSchema } from "@/lib/validators/course";
import { createCourseClassAction, updateCourseClassAction } from "@/actions/course";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Field, FieldLabel, FieldError, FieldContent } from "@/components/ui/field";
import { notify } from "@/lib/custom-toast";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface DependencyItem {
  id: string | number;
  code?: string | null;
  name?: string | null;
  profile?: {
    fullname?: string | null;
  } | null;
  startDate?: string;
  endDate?: string;
}

export interface Dependencies {
  teachers: DependencyItem[];
  subjects: DependencyItem[];
  semesters: DependencyItem[];
  types: DependencyItem[];
}

export interface CourseClass {
  id: string;
  code: string;
  teacherId: string;
  subjectId: string;
  cap: number;
  semesterId: string;
  type: number;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
}

interface CourseClassFormProps {
  courseClass?: CourseClass;
  dependencies: Dependencies;
  onSuccess?: () => void;
}

export function CourseClassForm({ courseClass, dependencies, onSuccess }: CourseClassFormProps) {
  const router = useRouter();
  const isEdit = !!courseClass;
  const { teachers, subjects, semesters, types } = dependencies;
  const t = useTranslations("Admin");

  const form = useForm({
    defaultValues: {
      code: courseClass?.code || "",
      teacherId: courseClass?.teacherId || "",
      subjectId: courseClass?.subjectId || "",
      cap: courseClass?.cap || 30,
      type: courseClass?.type || (types.length > 0 ? types[0].id : ""),
      semesterId: courseClass?.semesterId || (semesters.length > 0 ? semesters[0].id : ""),
      status: courseClass?.status || "opened",
      startDate: courseClass?.startDate || "",
      endDate: courseClass?.endDate || "",
    },
    onSubmit: async ({ value }) => {
      try {
        const schema = isEdit ? courseClassUpdateSchema : courseClassInsertSchema;
        const validation = schema.safeParse(value);
        if (!validation.success) {
           notify(validation.error.issues[0]?.message || t("ValidationFailed"), { type: "error" });
           return;
        }

        let result;
        if (isEdit && courseClass) {
          result = await updateCourseClassAction(courseClass.id, validation.data);
        } else {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
          result = await createCourseClassAction(validation.data as any);
        }

        if (result.success) {
          notify(t("Success"), { type: "success" });
          onSuccess?.();
          router.refresh();
        } else {
          notify(result.error || t("Failed"), { type: "error" });
        }
      } catch (error: unknown) {
        notify((error as Error).message || t("Failed"), { type: "error" });
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
      <div className="grid grid-cols-2 gap-4">
        <form.Field name="code">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("ClassCode")}</FieldLabel>
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

        <form.Field name="cap">
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
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
              </FieldContent>
            </Field>
          )}
        </form.Field>
      </div>

      <form.Field name="subjectId">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t("Subject")}</FieldLabel>
            <FieldContent>
              <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="">{t("SelectSubject")}</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <form.Field name="teacherId">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t("Teacher")}</FieldLabel>
            <FieldContent>
              <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="">{t("SelectTeacher")}</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.profile?.fullname || t.code} ({t.code})
                    </option>
                  ))}
                </select>
            </FieldContent>
          </Field>
        )}
      </form.Field>
      
      <div className="grid grid-cols-2 gap-4">
        <form.Field name="semesterId">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("Semester")}</FieldLabel>
              <FieldContent>
                <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  >
                    <option value="">{t("SelectSemester")}</option>
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="type">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("Type")}</FieldLabel>
              <FieldContent>
                <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  >
                    <option value="">{t("SelectType")}</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name || t.code}
                      </option>
                    ))}
                  </select>
              </FieldContent>
            </Field>
          )}
        </form.Field>
      </div>

      <form.Field name="status">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t("Status")}</FieldLabel>
            <FieldContent>
              <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="opened">{t("Opened")}</option>
                  <option value="closed">{t("Closed")}</option>
                  <option value="cancelled">{t("Cancelled")}</option>
                </select>
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="startDate">
          {(field) => {
            const selectedSemesterId = form.getFieldValue("semesterId");
            const selectedSemester = semesters.find(s => s.id === Number(selectedSemesterId));
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("StartDateOptional")}</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    min={selectedSemester?.startDate || undefined}
                    max={selectedSemester?.endDate || undefined}
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </FieldContent>
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="endDate">
          {(field) => {
            const selectedSemesterId = form.getFieldValue("semesterId");
            const selectedSemester = semesters.find(s => s.id === Number(selectedSemesterId));
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("EndDateOptional")}</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    min={selectedSemester?.startDate || undefined}
                    max={selectedSemester?.endDate || undefined}
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </FieldContent>
              </Field>
            );
          }}
        </form.Field>
      </div>

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
