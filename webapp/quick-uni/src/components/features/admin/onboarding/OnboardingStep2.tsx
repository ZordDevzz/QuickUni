"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Upload, 
  FileSpreadsheet, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  X
} from "lucide-react";
import { validateOnboardingExcel } from "@/actions/onboarding";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef
} from "@tanstack/react-table";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OnboardingStep2Props {
  sessionId: string;
  onBack: () => void;
  onNext: (summary: unknown) => void;
}

export function OnboardingStep2({ sessionId, onBack, onNext }: OnboardingStep2Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [validationResults, setValidationResults] = useState<any[]>([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [summary, setSummary] = useState<any>(null);
  const t = useTranslations("Onboarding");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsValidating(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await validateOnboardingExcel(sessionId, formData);
      if (result.success && result.summary) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValidationResults((result.summary as any).results);
        setSummary(result.summary);
        toast.success(t("ValidationComplete"));
      } else {
        toast.error(result.error || "Failed to validate file");
      }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsValidating(false);
    }
  };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (validationResults.length === 0) return [];

    const firstRow = validationResults[0].data;
    const keys = Object.keys(firstRow);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cols: ColumnDef<any>[] = [
      {
        id: "status",
        header: t("Status"),
        cell: ({ row }) => {
          const isValid = row.original.isValid;
          return isValid ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          );
        },
      },
      ...keys.map((key) => ({
        accessorKey: `data.${key}`,
        header: key,
      })),
      {
        id: "errors",
        header: t("Errors"),
        cell: ({ row }) => {
          const errors = row.original.errors as string[];
          if (errors.length === 0) return null;
          return (
            <div className="text-xs text-red-500">
              {errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          );
        },
      },
    ];

    return cols;
  }, [validationResults, t]);

  const table = useReactTable({
    data: validationResults,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("Step2Title")}</CardTitle>
        <CardDescription>{t("Step2Description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!summary ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 transition-colors hover:bg-muted/50">
            {file ? (
              <div className="flex flex-col items-center space-y-4">
                <FileSpreadsheet className="h-12 w-12 text-primary" />
                <div className="text-center">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setFile(null)}>
                    <X className="mr-2 h-4 w-4" />
                    {t("Remove")}
                  </Button>
                  <Button onClick={handleUpload} disabled={isValidating}>
                    {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("ValidateFile")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">{t("UploadExcelPrompt")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("UploadExcelHelp")}
                  </p>
                </div>
                <Input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button asChild>
                  <Label htmlFor="excel-upload" className="cursor-pointer">
                    {t("SelectFile")}
                  </Label>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{summary.total}</div>
                  <p className="text-xs text-muted-foreground">{t("TotalRows")}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-500/10">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{summary.valid}</div>
                  <p className="text-xs text-muted-foreground text-green-600">{t("ValidRows")}</p>
                </CardContent>
              </Card>
              <Card className="bg-red-500/10">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{summary.error}</div>
                  <p className="text-xs text-muted-foreground text-red-600">{t("InvalidRows")}</p>
                </CardContent>
              </Card>
            </div>

            <ScrollArea className="h-[400px] border rounded-md">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className={row.original.isValid ? "" : "bg-red-50/50"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setSummary(null)}>
                <X className="mr-2 h-4 w-4" />
                {t("Reupload")}
              </Button>
              <div className="text-sm text-muted-foreground flex items-center italic">
                {summary.error > 0 && t("InvalidRowsWarning")}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Previous")}
          </Button>
          <Button 
            onClick={() => onNext(summary)} 
            disabled={!summary || summary.valid === 0}
          >
            {t("Next")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
