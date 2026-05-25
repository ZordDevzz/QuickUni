'use client';

import { useEffect, useState } from 'react';
import { getDepartmentDetails } from '@/actions/academic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users, BookOpen, Info } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

interface DetailViewProps {
  departmentId: string;
}

export function DetailView({ departmentId }: DetailViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await getDepartmentDetails(departmentId);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch department details', error);
      } finally {
        setLoading(false);
      }
    }
    if (departmentId) {
      load();
    }
  }, [departmentId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="text-muted-foreground">Department not found or error loading details.</div>
    </div>
  );

  const majorColumns: ColumnDef<any>[] = [
    { 
      accessorKey: 'code', 
      header: 'Code',
      cell: ({ row }) => <span className="font-mono">{row.original.code}</span>
    },
    { 
      accessorKey: 'des', 
      header: 'Description',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.des || 'No description'}</span>
    },
  ];

  const personnelColumns: ColumnDef<any>[] = [
    { 
      id: 'fullname',
      header: 'Full Name',
      cell: ({ row }) => row.original.employee?.profile?.fullname || 'N/A'
    },
    { 
      accessorKey: 'roleName', 
      header: 'Role',
      cell: ({ row }) => row.original.roleName || row.original.roleCode || 'Staff'
    },
    { 
      accessorKey: 'assignDate', 
      header: 'Assign Date',
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-muted rounded text-xs font-mono font-medium">
              {data.code || 'N/A'}
            </span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
              Department
            </span>
          </div>
        </div>
        <Button>Edit Department</Button>
      </div>

      <Tabs defaultValue="majors" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="majors" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Majors
          </TabsTrigger>
          <TabsTrigger value="personnel" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Personnel
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="majors" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold">Chuyên ngành</CardTitle>
              <Button size="sm">Add Major</Button>
            </CardHeader>
            <CardContent>
               <DataTable 
                 columns={majorColumns} 
                 data={data.majors || []} 
                 searchKey="code"
                 searchPlaceholder="Search majors by code..."
               />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold">Personnel</CardTitle>
              <Button size="sm">Assign Staff</Button>
            </CardHeader>
            <CardContent>
               <DataTable 
                 columns={personnelColumns} 
                 data={data.departmentEmployments || []} 
               />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={data.name} readOnly className="bg-muted/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" value={data.code || ''} readOnly className="bg-muted/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description" 
                  value={data.des || ''} 
                  readOnly 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
