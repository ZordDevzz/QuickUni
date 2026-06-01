import { db } from "@/db";
import { getAutoCodeRules, getDefaultSchemaId } from "@/actions/admin";
import { SettingsClient } from "./SettingsClient";

export default async function SystemSettingsPage() {
  const schemas = await db.query.profileSchema.findMany();
  const defaultStudentSchemaId = await getDefaultSchemaId("student");
  const defaultEmployeeSchemaId = await getDefaultSchemaId("employee");
  const autoCodeRules = await getAutoCodeRules();

  return (
    <SettingsClient
      schemas={schemas}
      defaultStudentSchemaId={defaultStudentSchemaId}
      defaultEmployeeSchemaId={defaultEmployeeSchemaId}
      autoCodeRules={autoCodeRules}
    />
  );
}
