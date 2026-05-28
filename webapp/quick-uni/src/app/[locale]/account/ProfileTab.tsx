"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePersonalProfileAction } from "@/actions/account";
import { notify } from "@/lib/custom-toast";
import { Loader2, ShieldCheck, Lock, User, Calendar, MapPin, BadgeCheck, BookOpen, Landmark } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ProfileField {
  id: number;
  name: string;
  label: string;
  uiSection: string;
  isRequired: boolean;
  datatype: string;
}

interface ProfileTabProps {
  profile: any;
  fields: ProfileField[];
}

export function ProfileTab({ profile, fields }: ProfileTabProps) {
  const t = useTranslations("AccountSettings");
  const tProfile = useTranslations("Profile");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    fullname: profile?.fullname || "",
    gender: profile?.gender || "others",
    dob: profile?.dob ? profile.dob.split("T")[0] : "",
    address: profile?.address || "",
    ethnic: profile?.ethnic || "",
    religious: profile?.religious || "",
    ...(profile?.dynamicData || {})
  });

  const sections = Array.from(new Set(fields.map(f => f.uiSection)));

  const handleInputChange = (name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updatePersonalProfileAction(formData);
      if (result.success) {
        notify(t("ProfileSuccess"), { type: "success" });
      } else {
        notify(result.error || t("ProfileNotFound"), { type: "error" });
      }
    } catch (error) {
      notify("System error", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Safe extraction of academic details
  const student = profile?.students?.[0];
  const employee = profile?.employees?.[0];
  
  const classMember = student?.mainClassMembers?.[0];
  const mainClass = classMember?.mainClass;
  const major = mainClass?.major;
  const department = major?.department;
  const educationType = mainClass?.educationType;
  const classRole = classMember?.classRole;

  const employments = employee?.departmentEmployments || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      
      {/* SECTION 1: BIOGRAPHICAL DETAILS */}
      <Card className="border border-border/80 shadow-md overflow-hidden bg-card/45 backdrop-blur-md">
        <CardHeader className="bg-muted/40 border-b border-border/50 py-4 px-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">{t("BiographicalInfo")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullname" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tProfile("FullName")}
              </Label>
              <Input
                id="fullname"
                className="bg-background/80"
                value={formData.fullname}
                onChange={(e) => handleInputChange("fullname", e.target.value)}
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tProfile("DateOfBirth")}
              </Label>
              <div className="relative">
                <Input
                  id="dob"
                  type="date"
                  className="bg-background/80"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tProfile("Gender")}
              </Label>
              <Select 
                value={formData.gender} 
                onValueChange={(val) => handleInputChange("gender", val)}
              >
                <SelectTrigger id="gender" className="bg-background/80">
                  <SelectValue placeholder={tProfile("SelectGender")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{tProfile("Male")}</SelectItem>
                  <SelectItem value="female">{tProfile("Female")}</SelectItem>
                  <SelectItem value="others">{tProfile("Others")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tProfile("Address")}
              </Label>
              <Input
                id="address"
                className="bg-background/80"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            {/* Ethnic */}
            <div className="space-y-2">
              <Label htmlFor="ethnic" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tProfile("Ethnic")}
              </Label>
              <Input
                id="ethnic"
                className="bg-background/80"
                value={formData.ethnic}
                onChange={(e) => handleInputChange("ethnic", e.target.value)}
              />
            </div>

            {/* Religion */}
            <div className="space-y-2">
              <Label htmlFor="religious" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tProfile("Religious")}
              </Label>
              <Input
                id="religious"
                className="bg-background/80"
                value={formData.religious}
                onChange={(e) => handleInputChange("religious", e.target.value)}
              />
            </div>
          </div>

          <Separator className="my-6" />

          {/* Secure / Read-only biographical info */}
          <div className="grid gap-6 md:grid-cols-2 bg-muted/30 p-4 rounded-2xl border border-border/50">
            {/* National ID */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
                <span>{tProfile("NationalID")}</span>
                <Lock className="h-3 w-3 text-amber-500" />
              </div>
              <div className="relative">
                <Input
                  className="bg-background/45 border-dashed font-mono text-muted-foreground cursor-not-allowed pr-10"
                  value={profile?.nationalId || "N/A"}
                  disabled
                />
                <ShieldCheck className="absolute right-3 top-2.5 h-5 w-5 text-emerald-500" />
              </div>
            </div>

            {/* Country Code */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
                <span>{tProfile("CountryCode")}</span>
                <Lock className="h-3 w-3 text-amber-500" />
              </div>
              <div className="relative">
                <Input
                  className="bg-background/45 border-dashed font-mono text-muted-foreground cursor-not-allowed pr-10"
                  value={profile?.countryCode || "VN"}
                  disabled
                />
                <ShieldCheck className="absolute right-3 top-2.5 h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: DYNAMIC CUSTOM FIELDS */}
      {sections.map(section => (
        <Card key={section} className="border border-border/80 shadow-md overflow-hidden bg-card/45 backdrop-blur-md">
          <CardHeader className="bg-muted/40 border-b border-border/50 py-4 px-6">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-bold capitalize">{section === "contact" ? t("ContactInfo") : section}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 grid gap-6 md:grid-cols-2">
            {fields
              .filter(f => f.uiSection === section)
              .map(field => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {field.label}
                    {field.isRequired && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    className="bg-background/80"
                    type={field.datatype === "number" ? "number" : "text"}
                    value={String(formData[field.name] || "")}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.isRequired}
                  />
                </div>
              ))}
          </CardContent>
        </Card>
      ))}

      {/* SECTION 3: VERIFIED ACADEMIC / EMPLOYMENT DETAILS (READ-ONLY) */}
      {(student || employee) && (
        <Card className="border border-border/80 shadow-md overflow-hidden bg-card/45 backdrop-blur-md relative">
          <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10 py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{t("AcademicInfo")}</CardTitle>
              </div>
              <Badge className="bg-emerald-500/15 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {student && (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {/* MSSV */}
                <div className="bg-background/45 border rounded-xl p-3 space-y-1">
                  <span className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">{t("StudentId")}</span>
                  <p className="font-mono font-bold text-foreground">{student.code}</p>
                </div>
                {/* Cohort/Class */}
                <div className="bg-background/45 border rounded-xl p-3 space-y-1">
                  <span className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">{t("ClassCode")}</span>
                  <p className="font-bold text-foreground">{mainClass?.code || "N/A"}</p>
                </div>
                {/* Class Role */}
                <div className="bg-background/45 border rounded-xl p-3 space-y-1">
                  <span className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">{t("Role")}</span>
                  <p className="font-bold text-primary">{classRole?.name || "N/A"}</p>
                </div>
                {/* Major */}
                <div className="bg-background/45 border rounded-xl p-3 space-y-1 sm:col-span-2">
                  <span className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">{t("Major")}</span>
                  <p className="font-bold text-foreground">{major?.des || major?.code || "N/A"}</p>
                </div>
                {/* Education Type */}
                <div className="bg-background/45 border rounded-xl p-3 space-y-1">
                  <span className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">{t("EducationType")}</span>
                  <p className="font-bold text-foreground">{educationType?.name || "N/A"}</p>
                </div>
                {/* Department */}
                <div className="bg-background/45 border rounded-xl p-3 space-y-1 sm:col-span-3">
                  <span className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">{t("Department")}</span>
                  <p className="font-bold text-foreground">{department?.name || "N/A"}</p>
                </div>
              </div>
            )}

            {employee && (
              <div className="space-y-4">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* MSG */}
                  <div className="bg-background/45 border rounded-xl p-3 space-y-1">
                    <span className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">{t("EmployeeId")}</span>
                    <p className="font-mono font-bold text-foreground">{employee.code}</p>
                  </div>
                  {/* Schema Code */}
                  <div className="bg-background/45 border rounded-xl p-3 space-y-1">
                    <span className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">Profile Schema</span>
                    <p className="font-bold text-foreground">{profile?.profileSchema?.schemaCode || "N/A"}</p>
                  </div>
                </div>

                {employments.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Landmark className="h-4 w-4 text-emerald-500" />
                      Department Employment
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {employments.map((emp: any, index: number) => (
                        <div key={index} className="bg-background/45 border border-border/80 rounded-2xl p-4 flex flex-col justify-between space-y-2">
                          <p className="font-bold text-foreground">{emp.department?.name}</p>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-primary font-medium">{emp.roleName || emp.roleCode}</span>
                            <span className="text-muted-foreground font-mono">{emp.assignDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save Changes button */}
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading} className="px-6 py-5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("SaveChanges")}
        </Button>
      </div>
    </form>
  );
}
