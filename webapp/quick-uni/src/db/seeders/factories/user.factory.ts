import { v4 as uuidv4 } from "uuid";
import { PROFILE_TEMPLATES } from "../profiles/templates";

export type UserRole = "teacher" | "student" | "academic_office";

export const createUserProfileData = (role: UserRole) => {
  const template = PROFILE_TEMPLATES[role] || {};
  return {
    id: uuidv4(),
    dynamicData: template,
  };
};
