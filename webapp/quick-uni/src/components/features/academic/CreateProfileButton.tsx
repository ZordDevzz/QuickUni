"use client";

import { useState } from "react";
import { UserPlus, KeyRound, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ProfileForm } from "./ProfileForm";
import { AccountForm } from "../auth/AccountForm";
import { useTranslations } from "next-intl";

interface CreateProfileButtonProps {
  schemas?: { id: number; schemaCode: string }[];
}

export function CreateProfileButton({ schemas = [] }: CreateProfileButtonProps) {
  const [open, setOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<{ id: string; name: string; code?: string } | null>(null);

  const t = useTranslations("Profile");
  const accT = useTranslations("Account");

  // Determine schema type (student vs personnel) based on active schemas
  const isStudentType = schemas.some(s => s.schemaCode.startsWith("STD"));

  const handleProfileSuccess = (profileId?: string, fullname?: string, code?: string) => {
    setOpen(false);
    if (profileId && fullname) {
      setCreatedProfile({ id: profileId, name: fullname, code });
      // Short delay to allow first dialog to close smoothly before opening prompt
      setTimeout(() => {
        setPromptOpen(true);
      }, 300);
    }
  };

  return (
    <>
      {/* 1. Add Profile Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            <UserPlus className="h-4 w-4" /> {t("AddProfile")}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] border border-border/40 bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              {t("AddProfile")}
            </DialogTitle>
          </DialogHeader>
          <ProfileForm schemas={schemas} onSuccess={handleProfileSuccess} />
        </DialogContent>
      </Dialog>

      {/* 2. Fast Account Issuance Prompt Modal */}
      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent className="sm:max-w-[480px] p-6 border border-emerald-500/25 bg-background/95 backdrop-blur-md shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center space-y-4 pt-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
              <div className="relative rounded-2xl p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Sparkles className="h-8 w-8 animate-bounce" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <DialogTitle className="text-xl font-bold text-foreground">
                Tạo hồ sơ thành công!
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Hồ sơ của <strong className="text-foreground font-semibold">{createdProfile?.name}</strong> đã được tạo. Bạn có muốn tiến hành cấp tài khoản đăng nhập cho hồ sơ này ngay không?
              </DialogDescription>
            </div>
          </div>

          <DialogFooter className="mt-6 flex flex-row items-center justify-center gap-3 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setPromptOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-border/60 hover:bg-muted text-sm font-medium transition-all"
            >
              Để sau
            </Button>
            <Button
              onClick={() => {
                setPromptOpen(false);
                setTimeout(() => {
                  setAccountFormOpen(true);
                }, 300);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 gap-2"
            >
              <KeyRound className="h-4 w-4" /> Cấp tài khoản ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Issue Account Form Dialog */}
      <Dialog open={accountFormOpen} onOpenChange={setAccountFormOpen}>
        <DialogContent className="sm:max-w-106.25 border border-border/40 bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-emerald-500" /> {accT("CreateTitle")}
            </DialogTitle>
          </DialogHeader>
          {createdProfile && (
            <AccountForm
              initialProfileId={createdProfile.id}
              initialProfileName={createdProfile.name}
              initialCode={createdProfile.code}
              restrictType={isStudentType ? "student" : "personnel"}
              onSuccess={() => {
                setAccountFormOpen(false);
                setCreatedProfile(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
