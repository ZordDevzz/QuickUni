# Database Clearing Utility Design Spec

**Topic:** Implementation of a database clearing utility for the Modular Test Data Seeder.
**Date:** 2026-05-26
**Status:** Approved

## Goals
- Provide a reliable way to clear test data from specific tables in the database.
- Ensure foreign key constraints are handled (using `CASCADE`).
- Reset identity sequences (using `RESTART IDENTITY`).
- Support the Modular Test Data Seeder workflow.

## Target Tables
The utility will clear the following tables:
1. `"users"."student"`
2. `"users"."employee"`
3. `"users"."profile"`
4. `"users"."profile_schema_field"`
5. `"users"."profile_field"`
6. `"users"."profile_section"`
7. `"users"."profile_schema"`
8. `"course"."enrollment"`
9. `"course"."course_class"`
10. `"course"."main_class"`
11. `"schedule"."schedule"`
12. `"schedule"."weekly_template"`
13. `"schedule"."room"`
14. `"schedule"."building"`
15. `"academic"."department"`
16. `"academic"."major"`
17. `"academic"."subject"`
18. `"academic"."semester"`
19. `"auth"."user_system_role"`
20. `"auth"."system_role"`
21. `"auth"."account"`
22. `"system"."onboarding_session"`
23. `"system"."system_audit_log"`

## Implementation Details
- **File Path:** `src/db/seeders/clear.ts`
- **Technology:** Drizzle ORM, `sql.raw` helper.
- **Method:** Single `TRUNCATE TABLE ... RESTART IDENTITY CASCADE` command.
- **Execution:** Can be imported as a function `clearDatabase` or run directly via `tsx`.

## Error Handling
- Catch and log errors during the truncation process.
- Re-throw the error to ensure the calling process (e.g., a test runner or seeder script) is aware of the failure.

## Testing Strategy
- Manual verification by running the script and checking the database state.
- Integration with future seeder tasks.
