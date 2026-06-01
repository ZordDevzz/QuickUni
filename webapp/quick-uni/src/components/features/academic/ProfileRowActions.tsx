"use client";

import { useState } from "react";
import { 
  Pencil, 
  UserPlus, 
  MoreHorizontal,
  GraduationCap,
  Briefcase,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileForm } from "./ProfileForm";
import { ProfileWithAccount } from "@/types/profile";
import { useTranslations } from "next-intl";
import { AccountForm } from "../auth/AccountForm";
import { PersonnelAssignmentDialog } from "./PersonnelAssignmentDialog";

interface ProfileRowActionsProps {
  profile: ProfileWithAccount;
}

export function ProfileRowActions({ profile }: ProfileRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const t = useTranslations("Profile");
  const accT = useTranslations("Account");
  const tCommon = useTranslations("Common");

  const isStudent = ((profile as any).students && (profile as any).students.length > 0) || (profile as any).profileSchema?.schemaCode?.startsWith("STD");
  const employeeObj = (profile as any).employees?.[0];

  return (
    <div className="flex justify-end items-center gap-2">
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>{t("EditTitle", { name: profile.fullname || "N/A" })}</DialogTitle>
          </DialogHeader>
          <ProfileForm profile={profile} onSuccess={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>{accT("CreateTitle")}</DialogTitle>
          </DialogHeader>
          <AccountForm 
            onSuccess={() => setIsAccountOpen(false)} 
            initialProfileId={profile.id}
            initialProfileName={profile.fullname || undefined}
            initialCode={isStudent ? (profile as any).students?.[0]?.code : (profile as any).employees?.[0]?.code}
            restrictType={isStudent ? "student" : "personnel"}
          />
        </DialogContent>
      </Dialog>

      {employeeObj && (
        <PersonnelAssignmentDialog 
          open={isAssignOpen} 
          onOpenChange={setIsAssignOpen}
          employeeId={employeeObj.id}
          employeeName={profile.fullname || ""}
        />
      )}

      {!profile.accountId && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAccountOpen(true)}
          className="h-8 px-3 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 dark:border-emerald-500/30 hover:border-emerald-500/40 font-bold gap-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Cấp tài khoản
        </Button>
      )}
 
       <DropdownMenu>
         <DropdownMenuTrigger asChild>
           <Button variant="ghost" className="h-8 w-8 p-0">
             <span className="sr-only">{tCommon("OpenMenu")}</span>
             <MoreHorizontal className="h-4 w-4" />
           </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end">
           <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
           <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
             <Pencil className="mr-2 h-4 w-4" />
             {t("EditProfile")}
           </DropdownMenuItem>
           
           {!profile.accountId && (
             <>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => setIsAccountOpen(true)}>
                 <UserPlus className="mr-2 h-4 w-4" />
                 {t("IssueAccount")}
               </DropdownMenuItem>
             </>
           )}

           {!isStudent && employeeObj && (
             <>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => setIsAssignOpen(true)}>
                 <Building className="mr-2 h-4 w-4" />
                 Gán vào Khoa/Phòng
               </DropdownMenuItem>
             </>
           )}
         </DropdownMenuContent>
       </DropdownMenu>
     </div>
   );
 }