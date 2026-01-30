import { getServerSession } from "next-auth";
import { authOptions } from "./options";

export const getAuthSession = () => getServerSession(authOptions);