import * as XLSX from "xlsx";

/**
 * Generates an Excel template for admin onboarding.
 * Includes fixed profile fields and dynamic fields from the chosen schema.
 */
export async function generateOnboardingTemplate(fields: { label: string, name: string, isRequired: boolean }[]) {
  const fixedHeaders = ["Full Name", "Gender", "DOB", "National ID", "Address", "Ethnic", "Religious", "Entity Code"];
  const dynamicHeaders = fields.map(f => f.label);
  const allHeaders = [...fixedHeaders, ...dynamicHeaders];

  // 1. Create Template Sheet
  const worksheet = XLSX.utils.aoa_to_sheet([allHeaders]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

  // 2. Create Instructions Sheet
  const instructions = [
    ["Column", "Description", "Format / Options", "Required"],
    ["Full Name", "User's full name", "Text", "Yes"],
    ["Gender", "User's gender", "male / female / other", "Yes"],
    ["DOB", "Date of Birth", "YYYY-MM-DD (e.g., 2000-01-01)", "Yes"],
    ["National ID", "ID number or Passport", "Numeric string", "Yes"],
    ["Address", "Current living address", "Text", "No"],
    ["Ethnic", "Ethnic group", "Text", "No"],
    ["Religious", "Religious affiliation", "Text", "No"],
    ["Entity Code", "Student ID or Employee Code", "Text", "Yes"],
  ];

  // Add dynamic fields to instructions
  fields.forEach(f => {
    instructions.push([f.label, "Custom profile field", "Text", f.isRequired ? "Yes" : "No"]);
  });

  const instrSheet = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(workbook, instrSheet, "Instructions");

  // 3. Set Column Widths for readability
  const max_width = allHeaders.reduce((w, h) => Math.max(w, h.length), 15);
  worksheet["!cols"] = allHeaders.map(() => ({ wch: max_width }));
  
  // Also set widths for Instructions sheet
  instrSheet["!cols"] = [
    { wch: 20 }, // Column
    { wch: 30 }, // Description
    { wch: 30 }, // Format
    { wch: 10 }  // Required
  ];

  // 4. Write to Buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer as Buffer;
}

/**
 * Parses an uploaded onboarding Excel file and validates its content.
 */
export async function parseAndValidateOnboardingExcel(buffer: Buffer, fields: { label: string, name: string, isRequired: boolean }[]) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets["Template"] || workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet);
  
  return rawData.map((row: any) => {
    const errors: string[] = [];
    
    // Fixed validations
    if (!row["Full Name"]) errors.push("Missing required field: Full Name");
    if (!row["National ID"]) errors.push("Missing required field: National ID");
    if (!row["Entity Code"]) errors.push("Missing required field: Entity Code");
    
    // Dynamic validations
    fields.forEach(f => {
      if (f.isRequired && !row[f.label]) {
        errors.push(`Missing required field: ${f.label}`);
      }
    });

    return {
      data: row,
      errors,
      isValid: errors.length === 0
    };
  });
}

/**
 * Generates an Excel report of the onboarding execution.
 */
export async function generateOnboardingReport(results: any[]) {
  const data = results.map(r => ({
    "Full Name": r.data["Full Name"],
    "Entity Code": r.data["Entity Code"],
    "Status": r.processed ? "SUCCESS" : "FAILED",
    "Error Message": r.error || "",
    "Username": r.data["Entity Code"],
    "Password": r.data["National ID"] || r.data["Entity Code"],
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer as Buffer;
}
