import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getBuildings, 
  createBuildingAction, 
  updateBuildingAction, 
  deleteBuildingAction,
  getRoomsWithBuildings,
  createRoomAction,
  updateRoomAction,
  deleteRoomAction
} from '@/actions/facility';
import { db } from '@/db';
import { building, room } from '@/db/schema';
import { revalidatePath } from 'next/cache';

vi.mock('@/db', () => ({
  db: {
    query: {
      building: {
        findMany: vi.fn(),
      },
      room: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue([{ id: 1 }]),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([{ id: 1 }]),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue([{ id: 1 }]),
    })),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('facility actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Buildings', () => {
    it('getBuildings should call findMany', async () => {
      await getBuildings();
      expect(db.query.building.findMany).toHaveBeenCalled();
    });

    it('createBuildingAction should insert and revalidate', async () => {
      const data = { code: 'B1', name: 'Building 1' };
      const result = await createBuildingAction(data);
      expect(db.insert).toHaveBeenCalledWith(building);
      expect(revalidatePath).toHaveBeenCalledWith('/admin/academic/buildings');
      expect(result.success).toBe(true);
    });

    it('updateBuildingAction should update and revalidate', async () => {
      const data = { name: 'Updated Building' };
      const result = await updateBuildingAction(1, data);
      expect(db.update).toHaveBeenCalledWith(building);
      expect(revalidatePath).toHaveBeenCalledWith('/admin/academic/buildings');
      expect(result.success).toBe(true);
    });

    it('deleteBuildingAction should delete and revalidate', async () => {
      const result = await deleteBuildingAction(1);
      expect(db.delete).toHaveBeenCalledWith(building);
      expect(revalidatePath).toHaveBeenCalledWith('/admin/academic/buildings');
      expect(result.success).toBe(true);
    });
  });

  describe('Rooms', () => {
    it('getRoomsWithBuildings should call findMany with building', async () => {
      await getRoomsWithBuildings();
      expect(db.query.room.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          with: { building: true },
        })
      );
    });

    it('createRoomAction should insert and revalidate', async () => {
      const data = { code: 'R1', buildingId: 1, capacity: 30 };
      const result = await createRoomAction(data);
      expect(db.insert).toHaveBeenCalledWith(room);
      expect(revalidatePath).toHaveBeenCalledWith('/admin/academic/rooms');
      expect(result.success).toBe(true);
    });

    it('updateRoomAction should update and revalidate', async () => {
      const data = { capacity: 40 };
      const result = await updateRoomAction(1, data);
      expect(db.update).toHaveBeenCalledWith(room);
      expect(revalidatePath).toHaveBeenCalledWith('/admin/academic/rooms');
      expect(result.success).toBe(true);
    });

    it('deleteRoomAction should delete and revalidate', async () => {
      const result = await deleteRoomAction(1);
      expect(db.delete).toHaveBeenCalledWith(room);
      expect(revalidatePath).toHaveBeenCalledWith('/admin/academic/rooms');
      expect(result.success).toBe(true);
    });
  });
});
