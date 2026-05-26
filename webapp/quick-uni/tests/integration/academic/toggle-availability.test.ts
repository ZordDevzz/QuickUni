import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleAvailabilityAction } from '@/actions/scheduling-data';
import { db } from '@/db';
import { availability } from '@/db/schemas/schedule';

vi.mock('@/db', () => ({
  db: {
    query: {
      availability: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(),
    })),
  },
}));

vi.mock('@/db/schemas/schedule', () => ({
  availability: {
    id: 'availability_id',
  },
}));

describe('toggleAvailabilityAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should insert new availability if it does not exist', async () => {
    const params = {
      entityId: 'teacher-1',
      entityType: 'teacher' as const,
      dayOfWeek: 1,
      slotMask: 0b1,
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.availability.findFirst as any).mockResolvedValue(null);
    const mockInsertValues = vi.fn().mockResolvedValue({ success: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.insert as any).mockReturnValue({ values: mockInsertValues });

    const result = await toggleAvailabilityAction(params);

    expect(db.query.availability.findFirst).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalledWith(availability);
    expect(mockInsertValues).toHaveBeenCalledWith({
      entityId: params.entityId,
      entityType: params.entityType,
      dayOfWeek: params.dayOfWeek,
      occupiedMask: params.slotMask,
    });
    expect(result.success).toBe(true);
  });

  it('should update existing availability if it exists (XOR mask)', async () => {
    const params = {
      entityId: 'teacher-1',
      entityType: 'teacher' as const,
      dayOfWeek: 1,
      slotMask: 0b10,
    };

    const existingAvailability = {
      id: 'uuid-123',
      occupiedMask: 0b11,
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.availability.findFirst as any).mockResolvedValue(existingAvailability);
    
    const mockWhere = vi.fn().mockResolvedValue({ success: true });
    const mockSet = vi.fn(() => ({ where: mockWhere }));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.update as any).mockReturnValue({ set: mockSet });

    const result = await toggleAvailabilityAction(params);

    expect(db.query.availability.findFirst).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalledWith(availability);
    expect(mockSet).toHaveBeenCalledWith({ occupiedMask: 0b01 }); // 0b11 ^ 0b10 = 0b01
    expect(result.success).toBe(true);
  });
});
