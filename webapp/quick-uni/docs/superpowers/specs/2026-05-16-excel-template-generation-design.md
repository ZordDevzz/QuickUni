# Excel Template Generation Service Design

## Overview
This service provides functionality to generate a downloadable Excel (`.xlsx`) template for admin onboarding. The template includes standard profile fields and dynamic fields based on a chosen `profile_schema`.

## Goals
- Provide a standardized Excel format for bulk student/employee onboarding.
- Support dynamic fields defined in the database.
- Include an instruction sheet to guide users on data formats.

## Architecture

### Component: `src/services/excel.ts`
- **Function**: `generateOnboardingTemplate(fields: { label: string, name: string, isRequired: boolean }[])`
- **Dependency**: `xlsx` (SheetJS)
- **Output**: `Buffer` (Node.js)

### Headers
1. **Fixed Headers**:
   - `Full Name` (Maps to `fullname`)
   - `Gender` (Maps to `gender`, options: `male`, `female`, `other`)
   - `DOB` (Maps to `dob`, format: `YYYY-MM-DD`)
   - `National ID` (Maps to `nationalId`)
   - `Address` (Maps to `address`)
   - `Ethnic` (Maps to `ethnic`)
   - `Religious` (Maps to `religious`)
   - `Entity Code` (Maps to `student.code` or `employee.code`)

2. **Dynamic Headers**:
   - Appended after fixed headers using the `label` of each field in the `fields` array.

### Sheet Structure
- **Sheet 1: "Template"**: Contains the header row.
- **Sheet 2: "Instructions"**:
  - Columns: `Column`, `Description`, `Format / Options`, `Required`
  - Rows for each fixed header with specific formatting instructions.
  - Rows for dynamic headers indicating they are custom fields.

## Error Handling
- The service will throw errors if `fields` is not an array.
- It assumes the caller has already fetched and validated the schema fields.

## Testing Strategy
- **Unit Tests (`src/services/excel.test.ts`)**:
  - Verify `Buffer` return type.
  - Verify "Template" sheet contains all expected headers in the correct order.
  - Verify "Instructions" sheet exists and contains rows.
  - Verify dynamic headers are correctly appended.

## Integration
- This service will be used by a Server Action or API Route that handles the file download response.
