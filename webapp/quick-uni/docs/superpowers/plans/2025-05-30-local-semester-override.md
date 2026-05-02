# Local Semester Override in ScheduleManager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow `ScheduleManager` to have its own local semester selection that defaults to the global selection from `useSemester`.

**Architecture:** Update `ScheduleManager` to use `useSemester` hook. Initialize local `semesterId` state with global `selectedSemesterId`. Add a local `SemesterSelector` to the `ScheduleManager` toolbar to allow overriding the selection locally for the scheduling view. Pass this `semesterId` down to child components (`EntitySidebar`, `TimeGrid`, `ScheduleSlotDialog`) to ensure data is filtered correctly.

**Tech Stack:** React, Next.js, `useSemester` context, server actions.

---

### Task 1: Update ScheduleManager to use Global Context

**Files:**
- Modify: `src/components/features/academic/ScheduleManager.tsx`

- [ ] **Step 1: Import `useSemester` and update state initialization**

```typescript
// Add imports
import { useSemester } from "@/components/providers/semester-provider";
import { getSemesters } from "@/actions/scheduling-data";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown } from "lucide-react";

// Inside ScheduleManager component:
const { selectedSemesterId } = useSemester();
const [semesterId, setSemesterId] = useState<number | null>(selectedSemesterId);
const [semesters, setSemesters] = useState<any[]>([]);

// Replace existing useEffect for getCurrentSemester with:
useEffect(() => {
  getSemesters().then(setSemesters);
}, []);

useEffect(() => {
  // Sync with global if not manually overridden or just always sync on change if desired
  // User wanted: "defaults to the global selection"
  if (selectedSemesterId) {
    setSemesterId(selectedSemesterId);
  }
}, [selectedSemesterId]);
```

- [ ] **Step 2: Add local semester selector to the toolbar**

```typescript
// Find where the title and buttons are
const selectedSemester = semesters.find(s => s.id === semesterId);

// Add this before the AlertDialogs in the toolbar:
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm" className="h-9 gap-1 pr-2">
      <Calendar className="h-4 w-4" />
      <span className="text-xs">
        {selectedSemester?.name || t("SelectSemester")}
      </span>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
    {semesters.map((s) => (
      <DropdownMenuItem 
        key={s.id} 
        onClick={() => setSemesterId(s.id)}
        className={s.id === semesterId ? "bg-accent" : ""}
      >
        {s.name}
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/features/academic/ScheduleManager.tsx
git commit -m "feat(scheduling): add local semester override to ScheduleManager"
```

### Task 2: Pass semesterId to child components

**Files:**
- Modify: `src/components/features/academic/ScheduleManager.tsx`
- Modify: `src/components/features/academic/EntitySidebar.tsx`
- Modify: `src/components/features/academic/TimeGrid.tsx`
- Modify: `src/components/features/academic/ScheduleSlotDialog.tsx`

- [ ] **Step 1: Update ScheduleManager to pass semesterId**

```typescript
// In ScheduleManager render:
<EntitySidebar 
    type={activeTab} 
    onSelect={setSelectedId} 
    selectedId={selectedId}
    semesterId={semesterId} // Add this
/>

<TimeGrid 
    key={`${activeTab}-${selectedId}-${refreshKey}-${semesterId}`} // Add semesterId to key
    type={activeTab} 
    entityId={selectedId} 
    semesterId={semesterId} // Add this
    onCellClick={handleCellClick}
    onAssignmentClick={handleAssignmentClick}
/>

<ScheduleSlotDialog
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
  initialData={dialogData}
  semesterId={semesterId} // Add this
  onSuccess={handleSuccess}
/>
```

- [ ] **Step 2: Update EntitySidebar to accept and use semesterId**

```typescript
// In src/components/features/academic/EntitySidebar.tsx
interface EntitySidebarProps {
  type: EntityType;
  selectedId: string | null;
  onSelect: (id: string) => void;
  semesterId: number | null; // Add this
}

export function EntitySidebar({ type, selectedId, onSelect, semesterId }: EntitySidebarProps) {
  // ...
  useEffect(() => {
    async function loadData() {
      if (type === "classes" && !semesterId) {
        setEntities([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let data: Entity[] = [];
        if (type === "rooms") data = await getRooms() as Entity[];
        else if (type === "teachers") data = await getTeachers() as Entity[];
        else if (type === "classes" && semesterId) data = await getCourseClasses(semesterId) as Entity[]; // Use semesterId
        setEntities(data);
      } catch (error) {
        console.error("Failed to load entities", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [type, semesterId]); // Add semesterId to deps
  // ...
}
```

- [ ] **Step 3: Update TimeGrid to accept semesterId (even if not used yet, good for future filtering)**

```typescript
// In src/components/features/academic/TimeGrid.tsx
interface TimeGridProps {
  type: EntityType;
  entityId: string | null;
  semesterId: number | null; // Add this
  onCellClick?: (dayIndex: number, period: number) => void;
  onAssignmentClick?: (assignment: AssignmentWithRelations) => void;
}

export function TimeGrid({ type, entityId, semesterId, onCellClick, onAssignmentClick }: TimeGridProps) {
    // semesterId is already used in the key in ScheduleManager, so this component re-mounts
    // If we want to be more efficient, we could use it in deps, but re-mount is fine for now.
}
```

- [ ] **Step 4: Update ScheduleSlotDialog to accept and use semesterId**

```typescript
// In src/components/features/academic/ScheduleSlotDialog.tsx
interface ScheduleSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<WeeklyTemplateInput> | null;
  semesterId: number | null; // Add this
  onSuccess: () => void;
}

export function ScheduleSlotDialog({ 
  isOpen, 
  onClose, 
  initialData, 
  semesterId, // Add this
  onSuccess 
}: ScheduleSlotDialogProps) {
  // ...
  async function loadOptions() {
    setLoading(true);
    try {
      const roomsData = await getRooms(); // semester is already passed in props
      setRooms(roomsData);
      
      if (semesterId) { // Use semesterId from props
        const classesData = await getCourseClasses(semesterId);
        setCourseClasses(classesData);
      }
    } catch (error) {
      toast.error("Failed to load form options");
    } finally {
      setLoading(false);
    }
  }
  // ...
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/features/academic/ScheduleManager.tsx src/components/features/academic/EntitySidebar.tsx src/components/features/academic/TimeGrid.tsx src/components/features/academic/ScheduleSlotDialog.tsx
git commit -m "feat(scheduling): propagate semesterId to scheduling components"
```

### Task 3: Verification

- [ ] **Step 1: Check UI**
- Verify that `ScheduleManager` shows a semester selector.
- Verify that changing the global semester (in the main header) updates the local selector in `ScheduleManager`.
- Verify that changing the local selector in `ScheduleManager` updates the sidebar (specifically "Course Classes") and the TimeGrid.
- Verify that `AutoGenerate` and `Publish` actions use the local `semesterId`.

- [ ] **Step 2: Commit final changes**

```bash
git commit -m "feat(scheduling): complete local semester override implementation"
```
