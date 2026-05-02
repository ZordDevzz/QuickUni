"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getHolidays, addHolidayAction, deleteHolidayAction } from "@/actions/scheduling-data";
import { Loader2, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

interface HolidayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  semesterId?: number | null;
}

export function HolidayDialog({ isOpen, onClose, semesterId }: HolidayDialogProps) {
  const t = useTranslations("Admin");
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newHoliday, setNewHoliday] = useState({
    name: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    if (isOpen) {
      loadHolidays();
    }
  }, [isOpen]);

  async function loadHolidays() {
    setLoading(true);
    try {
      const data = await getHolidays();
      setHolidays(data);
    } catch (error) {
      toast.error("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newHoliday.startDate || !newHoliday.endDate) {
      toast.error("Start and end dates are required");
      return;
    }
    
    setIsAdding(true);
    try {
      const result = await addHolidayAction({
        ...newHoliday,
        semesterId: semesterId || undefined
      });
      if (result.success) {
        toast.success("Holiday added successfully");
        setNewHoliday({ name: "", startDate: "", endDate: "" });
        loadHolidays();
      }
    } catch (error) {
      toast.error("Failed to add holiday");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const result = await deleteHolidayAction(id);
      if (result.success) {
        toast.success("Holiday removed");
        loadHolidays();
      }
    } catch (error) {
      toast.error("Failed to remove holiday");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("ManageHolidays")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-muted/20">
            <div className="col-span-2 space-y-2">
              <Label>{t("HolidayName")}</Label>
              <Input 
                value={newHoliday.name} 
                onChange={e => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t("HolidayNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("StartDate")}</Label>
              <Input 
                type="date" 
                value={newHoliday.startDate} 
                onChange={e => setNewHoliday(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("EndDate")}</Label>
              <Input 
                type="date" 
                value={newHoliday.endDate} 
                onChange={e => setNewHoliday(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <Button 
                className="col-span-2" 
                onClick={handleAdd} 
                disabled={isAdding}
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {t("AddHoliday")}
            </Button>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : holidays.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">{t("NoHolidays")}</p>
            ) : (
              holidays.map(h => (
                <div key={h.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <p className="font-medium text-sm">{h.name || t("UnnamedHoliday")}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(h.startDate), "dd/MM/yyyy")} - {format(new Date(h.endDate), "dd/MM/yyyy")}
                      {h.semesterId && <span className="ml-2 text-primary">(Semester specific)</span>}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(h.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("Close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
