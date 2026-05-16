import { describe, it, expect } from "vitest";
import { profileSectionValidator, structureBatchUpdateValidator } from "./profile-structure";

describe("profileSectionValidator", () => {
  it("should validate a correct profile section", () => {
    const data = {
      name: "Personal Info",
      schemaId: 1,
      order: 1,
    };
    expect(profileSectionValidator.parse(data)).toEqual(data);
  });

  it("should fail if name is empty", () => {
    const data = {
      name: "",
      schemaId: 1,
      order: 1,
    };
    expect(() => profileSectionValidator.parse(data)).toThrow();
  });
});

describe("structureBatchUpdateValidator", () => {
  it("should validate a correct batch update", () => {
    const data = {
      schemaId: 1,
      sections: [
        {
          id: 1,
          name: "Section 1",
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
          fields: [],
        },
      ],
    };
    expect(structureBatchUpdateValidator.parse(data)).toEqual(data);
  });
});
