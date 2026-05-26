# Modular Test Data Seeder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a modular, realistic test data generation system using Faker.js that ensures database schema integrity through pre-flight migration checks and an emergency reset capability.

**Architecture:** A main orchestrator (`seed.ts`) that handles database synchronization and executes domain-specific seeders located in `src/db/seeders/`. Each seeder is an independent module returning created IDs to maintain referential integrity.

**Tech Stack:** TypeScript, Drizzle ORM, @faker-js/faker, bcryptjs, tsx.

---

### Task 1: Setup & Dependencies

**Files:**
- Modify: `package.json`
- Create: `src/db/seeders/.gitkeep`

- [ ] **Step 1: Install dependencies**

Run: `npm install @faker-js/faker --save-dev`

- [ ] **Step 2: Create seeders directory**

Run: `mkdir src/db/seeders` and `touch src/db/seeders/.gitkeep`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add faker dependency and create seeders directory"
```

---

### Task 2: Database Clearing Utility

**Files:**
- Create: `src/db/seeders/clear.ts`

- [ ] **Step 1: Implement clearDatabase function**

```typescript
import { db } from "../index";
import { sql } from "drizzle-orm";

export const clearDatabase = async () => {
  console.log("🧹 Clearing database...");
  const tables = [
    '"users"."student"',
    '"users"."employee"',
    '"users"."profile"',
    '"users"."profile_schema_field"',
    '"users"."profile_field"',
    '"users"."profile_section"',
    '"users"."profile_schema"',
    '"course"."enrollment"',
    '"course"."course_class"',
    '"course"."course_module"',
    '"course"."course"',
    '"schedule"."actual_schedule"',
    '"schedule"."weekly_schedule_template"',
    '"academic"."room"',
    '"academic"."department"',
    '"academic"."faculty"',
    '"academic"."semester"',
    '"auth"."user_system_role"',
    '"auth"."system_role"',
    '"auth"."account"',
    '"system"."onboarding_session"',
    '"system"."system_audit_log"',
  ];

  for (const table of tables) {
    try {
      await db.execute(sql.raw(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`));
    } catch (e) {
      console.warn(`Could not truncate ${table}:`, e.message);
    }
  }
  console.log("✅ Database cleared.");
};
```

- [ ] **Step 2: Commit**

```bash
git add src/db/seeders/clear.ts
git commit -m "feat: add database clearing utility"
```

---

### Task 3: System Seeder (Roles & Profile Schema)

**Files:**
- Create: `src/db/seeders/system.ts`

- [ ] **Step 1: Implement seedSystem function**

```typescript
import { db } from "../index";
import { systemRole, account, userSystemRole, profileSchema, profileField, profileSchemaField } from "../schema";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";

export const seedSystem = async () => {
  console.log("⚙️ Seeding system data...");

  // 1. Roles
  const roles = [
    { id: 1, name: "Admin", isDefaultRole: false },
    { id: 2, name: "Teacher", isDefaultRole: false },
    { id: 3, name: "Student", isDefaultRole: true },
  ];
  await db.insert(systemRole).values(roles);

  // 2. Admin Account
  const adminId = randomUUID();
  await db.insert(account).values({
    id: adminId,
    username: "admin",
    pwdHash: await hash("admin", 10),
    type: "dev",
    status: "active",
    email: "admin@quickuni.edu.vn",
  });
  await db.insert(userSystemRole).values({ userId: adminId, systemRole: 1 });

  // 3. Profile Schema
  const [schema] = await db.insert(profileSchema).values({
    schemaCode: "STD_V1",
    effectiveDate: new Date().toISOString().split('T')[0],
    des: "Standard University Profile V1",
    createAt: new Date().toISOString(),
  }).returning();

  // 4. Profile Fields
  const fields = [
    { name: "personal_email", datatype: "string", uiSection: "contact", label: "Personal Email", des: "External email address", createAt: new Date().toISOString() },
    { name: "phone", datatype: "string", uiSection: "contact", label: "Phone Number", des: "Contact phone", createAt: new Date().toISOString() },
  ];
  const insertedFields = await db.insert(profileField).values(fields).returning();

  // 5. Link Fields to Schema
  await db.insert(profileSchemaField).values(
    insertedFields.map((f, i) => ({
      fieldId: f.id,
      schemaId: schema.id,
      order: i,
      isRequired: true,
    }))
  );

  console.log("✅ System data seeded.");
  return { schemaId: schema.id, roles: { admin: 1, teacher: 2, student: 3 } };
};
```

- [ ] **Step 2: Commit**

```bash
git add src/db/seeders/system.ts
git commit -m "feat: add system seeder (roles, admin, profile schema)"
```

---

### Task 4: Organization Seeder (Faculties & Rooms)

**Files:**
- Create: `src/db/seeders/org.ts`

- [ ] **Step 1: Implement seedOrg function**

```typescript
import { db } from "../index";
import { faculty, department, room } from "../schema";
import { faker } from "@faker-js/faker";

export const seedOrg = async () => {
  console.log("🏢 Seeding organization data...");

  // 1. Faculties
  const faculties = Array.from({ length: 3 }).map(() => ({
    name: `Faculty of ${faker.commerce.department()}`,
    code: faker.string.alphanumeric(5).toUpperCase(),
    des: faker.lorem.sentence(),
  }));
  const insertedFaculties = await db.insert(faculty).values(faculties).returning();

  // 2. Departments
  const departments = insertedFaculties.flatMap((f) => 
    Array.from({ length: 2 }).map(() => ({
      facultyId: f.id,
      name: `Dept of ${faker.commerce.productName()}`,
      code: faker.string.alphanumeric(5).toUpperCase(),
    }))
  );
  const insertedDepts = await db.insert(department).values(departments).returning();

  // 3. Rooms
  const rooms = Array.from({ length: 10 }).map(() => ({
    name: `Room ${faker.number.int({ min: 100, max: 900 })}`,
    type: faker.helpers.arrayElement(["lecture_hall", "lab", "classroom"]),
    capacity: faker.number.int({ min: 20, max: 150 }),
    building: faker.helpers.arrayElement(["Building A", "Building B", "Building C"]),
    floor: faker.number.int({ min: 1, max: 10 }),
  }));
  const insertedRooms = await db.insert(room).values(rooms).returning();

  console.log("✅ Organization data seeded.");
  return { faculties: insertedFaculties, departments: insertedDepts, rooms: insertedRooms };
};
```

- [ ] **Step 2: Commit**

```bash
git add src/db/seeders/org.ts
git commit -m "feat: add organization seeder (faculties, depts, rooms)"
```

---

### Task 5: People Seeder (Teachers & Students)

**Files:**
- Create: `src/db/seeders/people.ts`

- [ ] **Step 1: Implement seedPeople function**

```typescript
import { db } from "../index";
import { account, profile, employee, student, userSystemRole } from "../schema";
import { hash } from "bcryptjs";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

export const seedPeople = async (schemaId: number, roles: any, departments: any[]) => {
  console.log("👥 Seeding people...");
  const pwdHash = await hash("password123", 10);

  // 1. Teachers (Employees)
  for (let i = 0; i < 5; i++) {
    const accountId = randomUUID();
    const profileId = randomUUID();
    const email = faker.internet.email();
    
    await db.insert(account).values({ id: accountId, username: email, pwdHash, email, type: "employee", status: "active" });
    await db.insert(userSystemRole).values({ userId: accountId, systemRole: roles.teacher });
    await db.insert(profile).values({
      id: profileId, accountId, schemaId,
      fullname: faker.person.fullName(),
      gender: faker.helpers.arrayElement(["male", "female"]),
      dob: faker.date.birthdate({ min: 25, max: 60, mode: 'age' }).toISOString().split('T')[0],
      nationalId: faker.string.numeric(12),
      dynamicData: { personal_email: email, phone: faker.phone.number() }
    });
    await db.insert(employee).values({ id: randomUUID(), profileId, code: `GV${faker.string.numeric(5)}` });
  }

  // 2. Students
  for (let i = 0; i < 20; i++) {
    const accountId = randomUUID();
    const profileId = randomUUID();
    const email = faker.internet.email();
    
    await db.insert(account).values({ id: accountId, username: email, pwdHash, email, type: "student", status: "active" });
    await db.insert(userSystemRole).values({ userId: accountId, systemRole: roles.student });
    await db.insert(profile).values({
      id: profileId, accountId, schemaId,
      fullname: faker.person.fullName(),
      gender: faker.helpers.arrayElement(["male", "female"]),
      dob: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }).toISOString().split('T')[0],
      nationalId: faker.string.numeric(12),
      dynamicData: { personal_email: email, phone: faker.phone.number() }
    });
    await db.insert(student).values({ id: randomUUID(), profileId, code: `SV${faker.string.numeric(8)}` });
  }

  console.log("✅ People seeded.");
};
```

- [ ] **Step 2: Commit**

```bash
git add src/db/seeders/people.ts
git commit -m "feat: add people seeder (teachers, students)"
```

---

### Task 6: Academic & Scheduling Seeder

**Files:**
- Create: `src/db/seeders/academic.ts`
- Create: `src/db/seeders/scheduling.ts`

- [ ] **Step 1: Implement seedAcademic function**

```typescript
import { db } from "../index";
import { semester, course } from "../schema";
import { faker } from "@faker-js/faker";

export const seedAcademic = async () => {
  console.log("📚 Seeding academic data...");
  const [currentSemester] = await db.insert(semester).values({
    name: "Học kỳ 1 năm học 2025-2026",
    code: "2025.1",
    startDate: "2025-08-15",
    endDate: "2026-01-15",
    status: "active",
  }).returning();

  const courses = Array.from({ length: 5 }).map(() => ({
    name: faker.company.catchPhrase(),
    code: faker.string.alphanumeric(6).toUpperCase(),
    credits: faker.number.int({ min: 2, max: 4 }),
  }));
  const insertedCourses = await db.insert(course).values(courses).returning();

  return { semesterId: currentSemester.id, courses: insertedCourses };
};
```

- [ ] **Step 2: Implement seedScheduling function**

```typescript
import { db } from "../index";
import { courseClass, weeklyScheduleTemplate, employee, room } from "../schema";
import { faker } from "@faker-js/faker";

export const seedScheduling = async (semesterId: string, courses: any[], teachers: any[], rooms: any[]) => {
  console.log("🗓️ Seeding scheduling data...");
  
  for (const c of courses) {
    const [cClass] = await db.insert(courseClass).values({
      courseId: c.id,
      semesterId: semesterId,
      code: `${c.code}-L01`,
      status: "open",
      capacity: 40,
    }).returning();

    // Random weekly template
    await db.insert(weeklyScheduleTemplate).values({
      classId: cClass.id,
      dayOfWeek: faker.number.int({ min: 1, max: 6 }),
      startSlot: faker.number.int({ min: 1, max: 5 }),
      duration: 3,
      roomId: faker.helpers.arrayElement(rooms).id,
      teacherId: faker.helpers.arrayElement(teachers).id,
      slotBitmask: 0x07 // Simple 3-slot bitmask for testing
    });
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add src/db/seeders/academic.ts src/db/seeders/scheduling.ts
git commit -m "feat: add academic and scheduling seeders"
```

---

### Task 7: Main Orchestrator

**Files:**
- Modify: `src/db/seed.ts`

- [ ] **Step 1: Implement main orchestrator with Migration Check**

```typescript
import { clearDatabase } from "./seeders/clear";
import { seedSystem } from "./seeders/system";
import { seedOrg } from "./seeders/org";
import { seedPeople } from "./seeders/people";
import { seedAcademic } from "./seeders/academic";
import { seedScheduling } from "./seeders/scheduling";
import { execSync } from "child_process";
import { db } from "./index";
import { employee, room } from "./schema";

const runMigration = () => {
  try {
    console.log("🔄 Running migrations (drizzle-kit push)...");
    execSync("npx drizzle-kit push", { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    return false;
  }
};

const emergencyReset = async () => {
  console.log("🚨 EMERGENCY RESET: Wiping database structure...");
  // Drop all schemas (users, academic, course, schedule, auth, system)
  const schemas = ["users", "academic", "course", "schedule", "auth", "system", "drizzle"];
  for (const schema of schemas) {
    try {
      await db.execute(sql.raw(`DROP SCHEMA IF EXISTS ${schema} CASCADE`));
    } catch (e) {}
  }
  console.log("✅ Database structure wiped.");
  runMigration();
};

const main = async () => {
  console.log("🌱 STARTING MODULAR SEEDING...");

  const syncSuccess = runMigration();
  if (!syncSuccess) {
    await emergencyReset();
  } else {
    await clearDatabase();
  }

  try {
    const { schemaId, roles } = await seedSystem();
    const { departments, rooms } = await seedOrg();
    await seedPeople(schemaId, roles, departments);
    const { semesterId, courses } = await seedAcademic();
    
    const teachers = await db.select().from(employee);
    await seedScheduling(semesterId, courses, teachers, rooms);

    console.log("✨ SEEDING COMPLETED SUCCESSFULLY.");
    process.exit(0);
  } catch (error) {
    console.error("❌ SEEDING FAILED AT EXECUTION:", error);
    process.exit(1);
  }
};

main();
```

- [ ] **Step 2: Commit**

```bash
git add src/db/seed.ts
git commit -m "feat: update main seed orchestrator with migration check and emergency reset"
```

---

### Task 8: Verification

- [ ] **Step 1: Run the seed script**

Run: `npm run db:seed`
Expected: Output showing migration push, clearing, and then each seeder module reporting success.

- [ ] **Step 2: Verify in DB**

Check some tables (e.g., `academic.faculty`, `users.profile`) to ensure data exists and looks realistic.

- [ ] **Step 3: Commit final cleanup**

```bash
git commit --allow-empty -m "chore: test data generation system complete"
```
