# Fix Onboarding UI and Action Errors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve type errors in the onboarding workflow by improving server action return types and applying appropriate casting in UI components.

**Architecture:** Update `getSessionAction` to return a typed Drizzle entity and refine component props/state to eliminate `unknown` and `any` usages where possible.

**Tech Stack:** Next.js Server Actions, Drizzle ORM, React (TypeScript), Lucide Icons, Shadcn UI.

---

### Task 1: Improve `getSessionAction` return type

**Files:**
- Modify: `src/actions/onboarding.ts`

- [ ] **Step 1: Update `getSessionAction` return type**

Modify the signature and return type of `getSessionAction` to include the typed session data.

```typescript
import { onboardingSession } from "@/db/schema";
// ... existing imports

export async function getSessionAction(sessionId: string): Promise<ActionResponse & { data?: typeof onboardingSession.$inferSelect }> {
  try {
    await checkAdmin();

    const session = await db.query.onboardingSession.findFirst({
      where: eq(onboardingSession.id, sessionId),
    });

    if (!session) throw new Error("Session not found");

    return { success: true, data: session };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? (error as Error).message : "Failed to fetch session" 
    };
  }
}
```

- [ ] **Step 2: Commit changes**

```bash
git add src/actions/onboarding.ts
git commit -m "fix(types): add explicit return type to getSessionAction"
```

---

### Task 2: Fix OnboardingStep1 types

**Files:**
- Modify: `src/components/features/admin/onboarding/OnboardingStep1.tsx`

- [ ] **Step 1: Update `OnboardingStep1Props` and state**

Replace `unknown` with actual types or pragmatic casts.

```tsx
// src/components/features/admin/onboarding/OnboardingStep1.tsx

interface OnboardingStep1Props {
  schemas: any[]; // Use any for now or a proper Schema type if available
  onNext: (sessionId: string) => void;
  initialData?: any;
}

export function OnboardingStep1({ schemas, onNext, initialData }: OnboardingStep1Props) {
  const [name, setName] = useState((initialData as any)?.name || "");
  const [entityType, setEntityType] = useState<"student" | "employee">((initialData as any)?.entityType || "student");
  const [schemaId, setSchemaId] = useState<string>((initialData as any)?.schemaId?.toString() || "");
  const [isSaving, setIsSaving] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>((initialData as any)?.id || null);
  // ... rest of component
```

- [ ] **Step 2: Commit changes**

```bash
git add src/components/features/admin/onboarding/OnboardingStep1.tsx
git commit -m "fix(types): resolve unknown types in OnboardingStep1"
```

---

### Task 3: Fix OnboardingStep2 types

**Files:**
- Modify: `src/components/features/admin/onboarding/OnboardingStep2.tsx`

- [ ] **Step 1: Update `OnboardingStep2` types**

Refine `any` and `unknown` in `OnboardingStep2`.

```tsx
// src/components/features/admin/onboarding/OnboardingStep2.tsx
import { OnboardingSummary } from "@/types/onboarding";

interface OnboardingStep2Props {
  sessionId: string;
  onBack: () => void;
  onNext: (summary: OnboardingSummary) => void;
}

// Inside OnboardingStep2 component:
const [summary, setSummary] = useState<OnboardingSummary | null>(null);

// Update handleUpload result handling:
const result = await validateOnboardingExcel(sessionId, formData);
if (result.success && result.summary) {
  const typedSummary = result.summary as OnboardingSummary;
  setValidationResults(typedSummary.results);
  setSummary(typedSummary);
  toast.success(t("ValidationComplete"));
}

// Update columns and table:
const columns = useMemo<ColumnDef<any>[]>(() => {
  if (validationResults.length === 0) return [];
  const firstRow = validationResults[0].data as Record<string, any>;
  // ...
```

- [ ] **Step 2: Commit changes**

```bash
git add src/components/features/admin/onboarding/OnboardingStep2.tsx
git commit -m "fix(types): refine types in OnboardingStep2 using OnboardingSummary"
```

---

### Task 4: Fix OnboardingStep3 and OnboardingWizard types

**Files:**
- Modify: `src/components/features/admin/onboarding/OnboardingStep3.tsx`
- Modify: `src/components/features/admin/onboarding/OnboardingWizard.tsx`

- [ ] **Step 1: Update `OnboardingStep3` types**

```tsx
// src/components/features/admin/onboarding/OnboardingStep3.tsx
import { onboardingSession } from "@/db/schema";
type OnboardingSession = typeof onboardingSession.$inferSelect;

export function OnboardingStep3({ sessionId, onComplete }: OnboardingStep3Props) {
  const [session, setSession] = useState<OnboardingSession | null>(null);
  // ... update fetchSession
  const fetchSession = async () => {
    const res = await getSessionAction(sessionId);
    if (res.success && res.data) {
      setSession(res.data);
      if (res.data.status !== "processing") {
        setExecuting(false);
      } else {
        setExecuting(true);
      }
    }
    setLoading(false);
  };
  // ...
```

- [ ] **Step 2: Update `OnboardingWizard` types**

```tsx
// src/components/features/admin/onboarding/OnboardingWizard.tsx

const res = await getSessionAction(initialSessionId);
if (res.success && res.data) {
  const status = res.data.status;
  // ...
}
```

- [ ] **Step 3: Commit changes**

```bash
git add src/components/features/admin/onboarding/OnboardingStep3.tsx src/components/features/admin/onboarding/OnboardingWizard.tsx
git commit -m "fix(types): resolve type errors in OnboardingStep3 and OnboardingWizard"
```

---

### Task 5: Verify and Finalize

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit src/actions/onboarding.ts src/components/features/admin/onboarding/*.tsx`
Expected: No errors in these files.

- [ ] **Step 2: Final commit**

```bash
git add .
git commit -m "chore: final type cleanup for onboarding workflow"
```
