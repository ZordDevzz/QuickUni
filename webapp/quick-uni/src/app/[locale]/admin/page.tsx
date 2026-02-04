import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, ShieldCheck, Database } from "lucide-react";
import { getAccounts } from "@/services/user";
import { getProfiles } from "@/services/profile";

export default async function AdminDashboard() {
  const accounts = await getAccounts();
  const profiles = await getProfiles();

  const stats = [
    {
      title: "Total Accounts",
      value: accounts.length,
      icon: Users,
      description: "Registered system accounts",
    },
    {
      title: "Total Profiles",
      value: profiles.length,
      icon: User,
      description: "Personal data records",
    },
    {
      title: "Admin Users",
      value: accounts.filter(a => a.type === 'tech' || a.type === 'dev').length,
      icon: ShieldCheck,
      description: "Users with system privileges",
    },
    {
        title: "Database Status",
        value: "Healthy",
        icon: Database,
        description: "PostgreSQL Connection",
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-muted-foreground text-xs">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
