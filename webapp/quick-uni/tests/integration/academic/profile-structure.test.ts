import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProfileStructureAction } from '@/actions/profile-structure';
import { db } from '@/db';
import { revalidatePath } from 'next/cache';

vi.mock('@/db', () => ({
  db: {
    transaction: vi.fn((callback) => callback({
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([{ id: 999 }]),
          onConflictDoUpdate: vi.fn().mockResolvedValue({}),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn().mockResolvedValue({}),
        })),
      })),
    })),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('updateProfileStructureAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process sections and fields correctly', async () => {
    const data = {
      schemaId: 1,
      sections: [
        {
          id: 1,
          name: "Existing Section",
          order: 1,
          fields: [
            {
              fieldId: 10,
              order: 1,
              isRequired: true,
            },
          ],
        },
        {
          name: "New Section",
          order: 2,
          fields: [
             {
              fieldId: 11,
              order: 1,
              isRequired: false,
            },
          ],
        },
      ],
    };

    const response = await updateProfileStructureAction(data);
    
    expect(db.transaction).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/profiles/structure');
    expect(response.success).toBe(true);
  });
});
