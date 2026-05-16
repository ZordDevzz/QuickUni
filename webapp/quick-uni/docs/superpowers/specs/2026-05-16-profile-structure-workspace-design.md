# Design Spec: Profile Structure Workspace Redesign

**Status:** Draft
**Author:** Gemini CLI
**Date:** 2026-05-16

## 1. Goal
Redesign the UX/UI for managing Profile Structures (Schemas, Sections, and Fields) into a unified "Master-Detail Workspace". This will replace the current fragmented pages with a single-page experience focused on two primary entities (e.g., Students and Employees) and support hierarchical grouping (Sections) with drag-and-drop capabilities.

## 2. Architecture

### 2.1 Database Changes
Existing tables `profile_schema`, `profile_field`, and `profile_schema_field` will be enhanced, and a new table will be introduced.

#### New Table: `users.profile_section`
Tracks groupings of fields within a specific schema.
- `id`: `bigserial` (Primary Key)
- `schemaId`: `bigint` (FK to `profile_schema.id`)
- `name`: `varchar(255)` (Display name of the section)
- `order`: `integer` (Sorting order within the schema)
- `createAt`: `timestamp`
- `updateAt`: `timestamp`

#### Updated Table: `users.profile_schema_field`
Links fields to schemas with section and ordering context. Note that `profile_field` contains the shared definition of a field (e.g., "Full Name" data type), while this mapping table handles schema-specific configuration.
- `sectionId`: `bigint` (FK to `profile_section.id`) - **Mandatory** to ensure every field belongs to a logical group.
- `order`: `integer` (Sorting order within the section)
- `isRequired`: `boolean` (Schema-specific requirement toggle)

### 2.2 UI/UX Design

#### Unified Workspace Page (`/admin/profiles/structure`)
- **Master Sidebar (Left):**
  - List of available Schemas (Student, Employee).
  - Quick summary: Status, Effective Date.
  - Active state highlighting.
- **Detail Canvas (Center):**
  - **Header:** Schema Name, "Add Section" button, "Save Changes" (Global Save or Auto-save).
  - **Section Cards:**
    - Collapsible cards representing `profile_section`.
    - Handle for Drag-and-Drop (DND) to reorder sections.
    - "Add Field" button within the card.
    - **Field List (Inside Card):**
      - List items representing `profile_schema_field` + `profile_field`.
      - Handle for DND to reorder fields within or across sections.
      - Indicators for "Required", "Data Type".
- **Property Drawer (Right):**
  - Appears when a Field or Section is clicked.
  - Form to edit: Label, Help Text, Validation Rules (for fields) or Name (for sections).
  - Delete/Remove action.

### 2.3 Data Flow & Logic
- **Initial Load:** Fetch selected Schema with all joined Sections and Fields.
- **DND Operations:** Track local state changes for `order` and `sectionId`.
- **Batch Update Action:** Send the entire structure (or optimized diff) to a server action `updateSchemaStructureAction` to update sections and field mappings in a single transaction.

## 3. Implementation Phases

1.  **Phase 1: Database Migration**
    - Create `profile_section` table.
    - Update `profile_schema_field` columns.
    - Data Migration: Create default sections (e.g., "General Information") and assign existing fields.
2.  **Phase 2: Core Server Actions**
    - CRUD for `profile_section`.
    - Batch update action for schema structure.
3.  **Phase 3: Workspace UI Shell**
    - Layout with Sidebar and Canvas.
    - Schema selection logic.
4.  **Phase 4: Drag-and-Drop & Section Management**
    - Implement DND using `@dnd-kit/core`.
    - Section creation/deletion.
5.  **Phase 5: Field Editor Drawer**
    - Dynamic form for field properties.

## 4. Testing Strategy
- **Database:** Verify foreign keys and cascade delete behavior.
- **Logic:** Unit tests for the batch update algorithm (ensuring no data loss).
- **UI:** Integration tests for drag-and-drop reordering (re-calculating `order` indices).
- **i18n:** Ensure all labels and help texts in the workspace are translatable.

## 5. Success Criteria
- Admin can reorder sections and fields via drag-and-drop.
- Profile structure is clearly grouped into sections.
- Unified interface reduces navigation time between schemas and fields.
