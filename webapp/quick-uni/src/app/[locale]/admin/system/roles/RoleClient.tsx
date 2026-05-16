"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { 
  deleteRoleAction, 
  createRoleAction, 
  updateRoleAction,
  updateRoleAuthoritiesAction 
} from "@/actions/role";
import { ColumnDef } from "@tanstack/react-table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Role {
  id: number;
  name: string | null;
  isDefaultRole: boolean | null;
}

interface RoleWithAuthorities extends Role {
  systemRoleAuthorities: { authorityId: string }[];
}

interface Authority {
  id: string;
  name: string | null;
  des: string | null;
}

interface RoleClientProps {
  roles: RoleWithAuthorities[];
  authorities: Authority[];
}

export function RoleClient({ roles, authorities }: RoleClientProps) {
  const t = useTranslations("Role");
  const tc = useTranslations("Admin");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [selectedRole, setSelectedRole] = useState<RoleWithAuthorities | null>(null);
  const [selectedAuthorities, setSelectedAuthorities] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    isDefaultRole: false,
  });

  const columns: ColumnDef<RoleWithAuthorities>[] = [
    {
      accessorKey: "id",
      header: t("RoleID"),
    },
    {
      accessorKey: "name",
      header: t("RoleName"),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "isDefaultRole",
      header: t("IsDefault"),
      cell: ({ row }) => (
        row.getValue("isDefaultRole") ? (
          <Badge variant="secondary">{tc("Continue")}</Badge> 
        ) : null
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleOpenAuth(role)}
              title={t("UpdateAuthorities")}
            >
              <Shield className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleOpenEdit(role)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="text-destructive"
              onClick={() => handleOpenDelete(role)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setFormData({ id: 0, name: "", isDefaultRole: false });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (role: RoleWithAuthorities) => {
    setSelectedRole(role);
    setFormData({ 
      id: role.id, 
      name: role.name || "", 
      isDefaultRole: !!role.isDefaultRole 
    });
    setIsFormOpen(true);
  };

  const handleOpenAuth = (role: RoleWithAuthorities) => {
    setSelectedRole(role);
    setSelectedAuthorities(role.systemRoleAuthorities.map(a => a.authorityId));
    setIsAuthOpen(true);
  };

  const handleOpenDelete = (role: RoleWithAuthorities) => {
    setSelectedRole(role);
    setIsDeleteOpen(true);
  };

  const onSaveRole = async () => {
    try {
      setLoading(true);
      let res;
      if (selectedRole) {
        res = await updateRoleAction(selectedRole.id, { 
          name: formData.name, 
          isDefaultRole: formData.isDefaultRole 
        });
      } else {
        res = await createRoleAction(formData);
      }

      if (res.success) {
        toast.success(selectedRole ? t("UpdateSuccess") : t("CreateSuccess"));
        setIsFormOpen(false);
      } else {
        toast.error(res.error || tc("Toast.SubmitFailed"));
      }
    } catch (error) {
      toast.error(tc("Toast.SystemError"));
    } finally {
      setLoading(false);
    }
  };

  const onDeleteRole = async () => {
    if (!selectedRole) return;
    try {
      setLoading(true);
      const res = await deleteRoleAction(selectedRole.id);
      if (res.success) {
        toast.success(t("DeleteSuccess"));
        setIsDeleteOpen(false);
      } else {
        toast.error(res.error || tc("Toast.DeleteFailed"));
      }
    } catch (error) {
      toast.error(tc("Toast.SystemError"));
    } finally {
      setLoading(false);
    }
  };

  const onSaveAuthorities = async () => {
    if (!selectedRole) return;
    try {
      setLoading(true);
      const res = await updateRoleAuthoritiesAction({
        roleId: selectedRole.id,
        authorityIds: selectedAuthorities,
      });
      if (res.success) {
        toast.success(t("UpdateAuthoritiesSuccess"));
        setIsAuthOpen(false);
      } else {
        toast.error(res.error || tc("Toast.SubmitFailed"));
      }
    } catch (error) {
      toast.error(tc("Toast.SystemError"));
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthority = (id: string) => {
    setSelectedAuthorities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("Roles")}</h2>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> {t("AddRole")}
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={roles} 
        searchKey="name"
        searchPlaceholder={tc("SearchPlaceholder")}
      />

      {/* Role Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRole ? t("EditRole") : t("AddRole")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!selectedRole && (
              <div className="grid gap-2">
                <Label htmlFor="id">{t("RoleID")}</Label>
                <Input 
                  id="id" 
                  type="number" 
                  value={formData.id} 
                  onChange={(e) => setFormData({ ...formData, id: parseInt(e.target.value) })}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name">{t("RoleName")}</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isDefault" 
                checked={formData.isDefaultRole} 
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, isDefaultRole: !!checked })}
              />
              <Label htmlFor="isDefault">{t("IsDefault")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>{tc("Cancel")}</Button>
            <Button onClick={onSaveRole} disabled={loading}>{tc("Continue")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Authorities Dialog */}
      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("UpdateAuthorities")}: {selectedRole?.name}</DialogTitle>
            <DialogDescription>{t("Authorities")}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-2 gap-4">
              {authorities.map((auth) => (
                <div key={auth.id} className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                  <Checkbox 
                    id={auth.id} 
                    checked={selectedAuthorities.includes(auth.id)}
                    onCheckedChange={() => toggleAuthority(auth.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={auth.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {auth.id}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {auth.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAuthOpen(false)}>{tc("Cancel")}</Button>
            <Button onClick={onSaveAuthorities} disabled={loading}>{tc("Continue")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("DeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("DeleteDescription", { name: selectedRole?.name || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{tc("Cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                onDeleteRole();
              }} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? tc("Loading") : tc("Continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
