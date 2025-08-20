import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, BarChart3, Users, CheckCircle } from "lucide-react";

export function StateServiceManagerDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">State Service Manager Dashboard</h1>
        <p className="text-muted-foreground">Coordinate services, ensure quality, and manage state-wide service delivery</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Providers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Registered providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
            <Settings className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Average satisfaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97%</div>
            <p className="text-xs text-muted-foreground">On-time delivery</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Cleaning Services</span>
                <span className="text-sm text-green-600">96% satisfaction</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Maintenance Services</span>
                <span className="text-sm text-green-600">94% satisfaction</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Security Services</span>
                <span className="text-sm text-yellow-600">88% satisfaction</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Services</span>
                <span className="text-sm text-green-600">92% satisfaction</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-3 text-left bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
              Quality Assurance
            </button>
            <button className="w-full p-3 text-left bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
              Provider Management
            </button>
            <button className="w-full p-3 text-left bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
              Service Analytics
            </button>
            <button className="w-full p-3 text-left bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
              Performance Reports
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}