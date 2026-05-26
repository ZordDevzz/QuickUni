"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPerson, updatePerson } from "@/actions/people";
import { useEffect, useState } from "react";
import { getFieldsForSchema, SchemaField } from "@/actions/schema-field";
import { notify } from "@/lib/custom-toast";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";

const fixedSchema = z.object({
  code: z.string().min(1, "Required"),
  fullname: z.string().min(1, "Required"),
  gender: z.enum(['male', 'female', 'others']),
  dob: z.string().min(1, "Required"),
  nationalId: z.string().min(1, "Required"),
  address: z.string().optional().nullable(),
  countryCode: z.string().optional().nullable(),
  ethnic: z.string().optional().nullable(),
  religious: z.string().optional().nullable(),
});

interface ProfileData {
  fullname?: string;
  gender?: 'male' | 'female' | 'others';
  dob?: string | Date;
  nationalId?: string;
  address?: string;
  countryCode?: string;
  ethnic?: string;
  religious?: string;
  dynamicData?: Record<string, unknown>;
}

interface PersonData {
  id?: string;
  code?: string;
  profile?: ProfileData;
}

type PersonFormProps = {
  type: 'employee' | 'student';
  schemaId: number;
  initialData?: PersonData;
  onSuccess?: () => void;
};

export function PersonForm({ type, schemaId, initialData, onSuccess }: PersonFormProps) {
  const t = useTranslations("Profile");
  const commonT = useTranslations("Admin");
  const [fields, setFields] = useState<SchemaField[]>([]);
  const router = useRouter();
  const isEdit = !!initialData;

  useEffect(() => {
    async function loadFields() {
      const data = await getFieldsForSchema(schemaId);
      setFields(data);
    }
    loadFields();
  }, [schemaId]);

  const formSchema = fixedSchema.extend({
    dynamicData: z.record(z.string(), z.unknown()),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      code: initialData.code || "",
      fullname: initialData.profile?.fullname || "",
      gender: initialData.profile?.gender || "male",
      dob: initialData.profile?.dob ? new Date(initialData.profile.dob).toISOString().split('T')[0] : "",
      nationalId: initialData.profile?.nationalId || "",
      address: initialData.profile?.address || "",
      countryCode: initialData.profile?.countryCode || "",
      ethnic: initialData.profile?.ethnic || "",
      religious: initialData.profile?.religious || "",
      dynamicData: initialData.profile?.dynamicData || {},
    } : {
      code: "",
      fullname: "",
      gender: "male",
      dob: "",
      nationalId: "",
      address: "",
      countryCode: "",
      ethnic: "",
      religious: "",
      dynamicData: {},
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        let res;
        if (isEdit && initialData?.id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            res = await updatePerson(type, initialData.id, { ...values, schemaId } as any);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            res = await createPerson(type, { ...values, schemaId } as any);
        }
        
        if (res.success) {
          notify(isEdit ? "Updated successfully" : "Created successfully", { type: "success" });
          onSuccess?.();
          router.refresh();
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          notify((res as any).error || "An error occurred", { type: "error" });
        }
    } catch (error: unknown) {
        notify((error as Error).message || "An unexpected error occurred", { type: "error" });
    }
  }

  // Group fields by uiSection
  const sections = fields.reduce((acc, field) => {
    const section = field.profileField.uiSection || "Extra";
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, SchemaField[]>);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderDynamicField = (field: SchemaField, inputField: any) => {
    const datatype = field.profileField.datatype;
    
    switch (datatype) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox 
                id={inputField.name} 
                checked={inputField.value} 
                onCheckedChange={inputField.onChange} 
            />
            <FormLabel htmlFor={inputField.name} className="cursor-pointer font-normal">
                {field.profileField.label}
            </FormLabel>
          </div>
        );
      case 'number':
        return <Input type="number" {...inputField} value={inputField.value ?? ""} />;
      case 'date':
        return <Input type="date" {...inputField} value={inputField.value ?? ""} />;
      default:
        return <Input {...inputField} value={inputField.value ?? ""} />;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">{t("Identity") || "Identity"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{commonT("Code") || "Code"}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("FullName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Gender")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("SelectGender") || "Select gender"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">{t("Male")}</SelectItem>
                      <SelectItem value="female">{t("Female")}</SelectItem>
                      <SelectItem value="others">{t("Others")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("DateOfBirth")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nationalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("NationalID")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">{t("Contact") || "Other Details"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("Address")}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("CountryCode")}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} maxLength={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ethnic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Ethnic")}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="religious"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Religious")}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {Object.entries(sections).map(([sectionName, sectionFields]) => (
          <div key={sectionName} className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 capitalize">{sectionName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionFields.map((field) => (
                <FormField
                  key={field.fieldId}
                  control={form.control}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  name={`dynamicData.${field.profileField.name}` as any}
                  render={({ field: inputField }) => (
                    <FormItem className={field.profileField.datatype === 'boolean' ? "flex flex-row items-center space-x-3 space-y-0 py-4" : ""}>
                      {field.profileField.datatype !== 'boolean' && <FormLabel>{field.profileField.label}</FormLabel>}
                      <FormControl>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {renderDynamicField(field, inputField as any)}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" className="min-w-[120px]">
                {commonT("Save")}
            </Button>
        </div>
      </form>
    </Form>
  );
}
