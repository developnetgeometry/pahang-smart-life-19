import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, Wrench, Users } from "lucide-react";

export function ResidentDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Resident Dashboard</h1>
        <p className="text-muted-foreground">Access your personal services and community information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Unread</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complaints</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitors</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Expected today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Pool Maintenance</p>
                <p className="text-sm text-muted-foreground">Scheduled for this weekend</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Community Event</p>
                <p className="text-sm text-muted-foreground">Family day on Saturday</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Security Update</p>
                <p className="text-sm text-muted-foreground">New access cards available</p>
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
              Book Facilities
            </button>
            <button className="w-full p-3 text-left bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
              Submit Complaint
            </button>
            <button className="w-full p-3 text-left bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
              Register Visitor
            </button>
            <button className="w-full p-3 text-left bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
              Community Chat
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}