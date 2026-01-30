export const getUserByEmail = async (email: string) => {
  // Mock database call
  if (email === "test@example.com") {
    return {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      password: "password123", // In a real app, this should be hashed
    };
  }
  return null;
};
