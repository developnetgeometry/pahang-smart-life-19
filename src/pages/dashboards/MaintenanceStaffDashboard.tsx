import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, CheckCircle, AlertCircle, Clock } from "lucide-react";

export function MaintenanceStaffDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Maintenance Staff Dashboard</h1>
        <p className="text-muted-foreground">Manage maintenance tasks, tickets, and work orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg border-red-200">
                <p className="font-medium text-red-600">URGENT: Water leak - Block A</p>
                <p className="text-sm text-muted-foreground">Reported 30 mins ago</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Light bulb replacement - Lobby</p>
                <p className="text-sm text-muted-foreground">Scheduled maintenance</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">AC filter cleaning - Gym</p>
                <p className="text-sm text-muted-foreground">Monthly maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-3 text-left bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors">
              Report Emergency
            </button>
            <button className="w-full p-3 text-left bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
              My Work Orders
            </button>
            <button className="w-full p-3 text-left bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
              Inventory Check
            </button>
            <button className="w-full p-3 text-left bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
              Log Work Hours
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}