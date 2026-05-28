import { getMainClasses } from "@/actions/academic";
import ClassClient from "./ClassClient";

export default async function ClassesPage() {
  const classes = await getMainClasses();

  return <ClassClient initialClasses={classes} />;
}
