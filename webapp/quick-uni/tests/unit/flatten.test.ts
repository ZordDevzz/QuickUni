import { describe, it, expect } from "vitest";
import { flattenObject } from "../../scripts/utils/flatten";

describe("flattenObject", () => {
  it("should flatten a nested object into dot notation keys", () => {
    const input = {
      Admin: {
        Title: "Admin Dashboard",
        Users: {
          Add: "Add User"
        }
      },
      Common: "Save"
    };
    
    const result = flattenObject(input);
    expect(result).toEqual({
      "Admin.Title": "Admin Dashboard",
      "Admin.Users.Add": "Add User",
      "Common": "Save"
    });
  });
});