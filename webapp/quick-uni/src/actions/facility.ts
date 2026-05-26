"use server";

import { db } from "../db";
import { building, room } from "../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { 
  BuildingInsertInput, 
  BuildingUpdateInput, 
  RoomInsertInput, 
  RoomUpdateInput,
  buildingInsertSchema,
  buildingUpdateSchema,
  roomInsertSchema,
  roomUpdateSchema
} from "../lib/validators/facility";

export type ActionResponse = {
  success: boolean;
  error?: string;
};

// --- Buildings ---

export async function getBuildings() {
  return await db.query.building.findMany({
    orderBy: (b, { asc }) => [asc(b.code)],
  });
}

export async function createBuildingAction(data: BuildingInsertInput): Promise<ActionResponse> {
  try {
    const validatedData = buildingInsertSchema.parse(data);
    await db.insert(building).values(validatedData);
    revalidatePath("/[locale]/academic/buildings", "page");
    revalidatePath("/academic/buildings");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to create building:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create building" 
    };
  }
}

export async function updateBuildingAction(id: number, data: BuildingUpdateInput): Promise<ActionResponse> {
  try {
    const validatedData = buildingUpdateSchema.parse(data);
    await db.update(building).set(validatedData).where(eq(building.id, id));
    revalidatePath("/[locale]/academic/buildings", "page");
    revalidatePath("/academic/buildings");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update building:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update building" 
    };
  }
}

export async function deleteBuildingAction(id: number): Promise<ActionResponse> {
  try {
    await db.delete(building).where(eq(building.id, id));
    revalidatePath("/[locale]/academic/buildings", "page");
    revalidatePath("/academic/buildings");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete building:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete building. It might be in use." 
    };
  }
}

// --- Rooms ---

export async function getRoomsWithBuildings() {
  return await db.query.room.findMany({
    orderBy: (r, { asc }) => [asc(r.code)],
    with: {
      building: true,
    }
  });
}

export async function createRoomAction(data: RoomInsertInput): Promise<ActionResponse> {
  try {
    const validatedData = roomInsertSchema.parse(data);
    await db.insert(room).values(validatedData);
    revalidatePath("/[locale]/academic/rooms", "page");
    revalidatePath("/academic/rooms");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to create room:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create room" 
    };
  }
}

export async function updateRoomAction(id: number, data: RoomUpdateInput): Promise<ActionResponse> {
  try {
    const validatedData = roomUpdateSchema.parse(data);
    await db.update(room).set(validatedData).where(eq(room.id, id));
    revalidatePath("/[locale]/academic/rooms", "page");
    revalidatePath("/academic/rooms");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update room:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update room" 
    };
  }
}

export async function deleteRoomAction(id: number): Promise<ActionResponse> {
  try {
    await db.delete(room).where(eq(room.id, id));
    revalidatePath("/[locale]/academic/rooms", "page");
    revalidatePath("/academic/rooms");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete room:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete room. It might be in use." 
    };
  }
}
