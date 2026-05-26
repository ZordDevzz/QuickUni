import { randomUUID } from "crypto";
import { PROFILE_TEMPLATES } from "../profiles/templates";

export type UserRole = "teacher" | "student" | "academic_office";

export const createUserProfileData = (role: UserRole) => {
  const template = PROFILE_TEMPLATES[role] || {};
  return {
    id: randomUUID(),
    dynamicData: template,
  };
};
