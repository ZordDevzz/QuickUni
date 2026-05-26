"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CourseClassForm, Dependencies } from "./CourseClassForm";

export function CreateCourseClassButton({ dependencies }: { dependencies: Dependencies }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Course Class</DialogTitle>
        </DialogHeader>
        <CourseClassForm dependencies={dependencies} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
