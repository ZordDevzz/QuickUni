import { describe, it, expect } from "vitest";
import { changePasswordSchema, profileUpdateSchema } from "./account";

describe("Account Validators", () => {
  console.log('changePasswordSchema:', !!changePasswordSchema);
  console.log('profileUpdateSchema:', !!profileUpdateSchema);
  it("should validate password change correctly", () => {
    const valid = changePasswordSchema.safeParse({
      currentPassword: "old-password",
      newPassword: "new-password-123",
      confirmPassword: "new-password-123",
    });
    expect(valid.success).toBe(true);
    
    const mismatch = changePasswordSchema.safeParse({
      currentPassword: "old-password",
      newPassword: "new-password-123",
      confirmPassword: "mismatch",
    });
    expect(mismatch.success).toBe(false);
  });

  it("should validate profile update correctly", () => {
    const valid = profileUpdateSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
    });
    expect(valid.success).toBe(true);
  });
});
