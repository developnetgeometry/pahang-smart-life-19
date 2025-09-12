import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users, MessageSquare, Camera, FileText, Settings, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DataImpact {
  residents: number;
  announcements: number;
  discussions: number;
  cctvCameras: number;
  facilities: number;
  complaints: number;
  bookings: number;
}

interface CommunityDataImpactAnalyzerProps {
  communityId: string;
  communityName: string;
}

export default function CommunityDataImpactAnalyzer({
  communityId,
  communityName,
}: CommunityDataImpactAnalyzerProps) {
  const [impact, setImpact] = useState<DataImpact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpactData = async () => {
      setLoading(true);
      try {
        // Simulate API call - replace with real implementation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data - replace with actual database queries
        const mockImpact: DataImpact = {
          residents: Math.floor(Math.random() * 150) + 10,
          announcements: Math.floor(Math.random() * 25) + 5,
          discussions: Math.floor(Math.random() * 40) + 8,
          cctvCameras: Math.floor(Math.random() * 12) + 2,
          facilities: Math.floor(Math.random() * 8) + 1,
          complaints: Math.floor(Math.random() * 15) + 2,
          bookings: Math.floor(Math.random() * 30) + 5,
        };
        
        setImpact(mockImpact);
      } catch (error) {
        console.error("Error fetching impact data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImpactData();
  }, [communityId]);

  const impactItems = [
    {
      icon: Users,
      label: "Active Residents",
      value: impact?.residents || 0,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      severity: "high" as const,
    },
    {
      icon: FileText,
      label: "Announcements",
      value: impact?.announcements || 0,
      color: "text-green-600",
      bgColor: "bg-green-50", 
      severity: "medium" as const,
    },
    {
      icon: MessageSquare,
      label: "Discussion Posts",
      value: impact?.discussions || 0,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      severity: "medium" as const,
    },
    {
      icon: Camera,
      label: "CCTV Cameras",
      value: impact?.cctvCameras || 0,
      color: "text-red-600",
      bgColor: "bg-red-50",
      severity: "high" as const,
    },
    {
      icon: Home,
      label: "Facilities",
      value: impact?.facilities || 0,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      severity: "medium" as const,
    },
    {
      icon: Settings,
      label: "Complaints",
      value: impact?.complaints || 0,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      severity: "medium" as const,
    },
    {
      icon: FileText,
      label: "Facility Bookings",
      value: impact?.bookings || 0,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      severity: "low" as const,
    },
  ];

  const totalImpactedItems = impactItems.reduce((sum, item) => sum + item.value, 0);
  const highSeverityItems = impactItems.filter(item => item.severity === "high" && item.value > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <CardTitle className="text-lg">Data Impact Analysis</CardTitle>
            <CardDescription>
              Deleting "{communityName}" will affect the following data:
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {impactItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                      item.value > 0 ? "border-destructive/20 bg-destructive/5" : "border-border"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", item.bgColor)}>
                      <Icon className={cn("h-4 w-4", item.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{item.label}</p>
                        <Badge variant={item.value > 0 ? "destructive" : "secondary"}>
                          {item.value}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalImpactedItems > 0 && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">
                      Critical Warning
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This action will affect <strong>{totalImpactedItems}</strong> total records across multiple systems.
                      {highSeverityItems.length > 0 && (
                        <span className="block mt-1 text-destructive">
                          Particularly critical: {highSeverityItems.map(item => item.label).join(", ")}.
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please carefully consider your deletion strategy to minimize data loss and system impact.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}