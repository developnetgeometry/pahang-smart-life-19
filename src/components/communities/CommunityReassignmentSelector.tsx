import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Home, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Community {
  id: string;
  name: string;
  community_type: string;
  total_units?: number;
  occupied_units?: number;
  status: string;
}

interface CommunityReassignmentSelectorProps {
  currentCommunityId: string;
  currentCommunityName: string;
  districtId: string;
  onSelectionChange: (targetCommunityId: string | null) => void;
  selectedCommunityId?: string | null;
}

export default function CommunityReassignmentSelector({
  currentCommunityId,
  currentCommunityName,
  districtId,
  onSelectionChange,
  selectedCommunityId,
}: CommunityReassignmentSelectorProps) {
  const [availableCommunities, setAvailableCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableCommunities = async () => {
      setLoading(true);
      try {
        // Simulate API call - replace with real implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual database query
        const mockCommunities: Community[] = [
          {
            id: "1",
            name: "Greenwood Heights",
            community_type: "residential",
            total_units: 150,
            occupied_units: 120,
            status: "active"
          },
          {
            id: "2", 
            name: "Downtown Commercial Plaza",
            community_type: "commercial",
            total_units: 80,
            occupied_units: 65,
            status: "active"
          },
          {
            id: "3",
            name: "Riverside Gardens",
            community_type: "mixed",
            total_units: 200,
            occupied_units: 180,
            status: "active"
          },
        ].filter(community => 
          community.id !== currentCommunityId && 
          community.status === "active"
        );
        
        setAvailableCommunities(mockCommunities);
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCommunities();
  }, [currentCommunityId, districtId]);

  const selectedCommunity = availableCommunities.find(
    community => community.id === selectedCommunityId
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "residential":
        return "bg-blue-100 text-blue-800";
      case "commercial":
        return "bg-green-100 text-green-800";
      case "mixed":
        return "bg-purple-100 text-purple-800";
      case "industrial":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOccupancyRate = (community: Community) => {
    if (!community.total_units || !community.occupied_units) return 0;
    return Math.round((community.occupied_units / community.total_units) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowRight className="h-5 w-5" />
          <span>Data Reassignment</span>
        </CardTitle>
        <CardDescription>
          Select a target community to transfer residents, bookings, and other data from "{currentCommunityName}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Community</label>
              <Select value={selectedCommunityId || ""} onValueChange={onSelectionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a community to transfer data to" />
                </SelectTrigger>
                <SelectContent>
                  {availableCommunities.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{community.name}</span>
                        <Badge className={getTypeColor(community.community_type)}>
                          {community.community_type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCommunity && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{selectedCommunity.name}</h4>
                  <Badge className={getTypeColor(selectedCommunity.community_type)}>
                    {selectedCommunity.community_type}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span>Total Units: {selectedCommunity.total_units || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Occupied: {selectedCommunity.occupied_units || 0}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Occupancy Rate</span>
                    <span>{getOccupancyRate(selectedCommunity)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getOccupancyRate(selectedCommunity)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {availableCommunities.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800">
                      No Available Communities
                    </p>
                    <p className="text-sm text-yellow-700">
                      There are no other active communities in this district to reassign data to. 
                      You may need to create a new community or use a different deletion strategy.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Data reassignment will transfer all residents, bookings, 
                  complaints, and facility associations to the selected community. This action 
                  cannot be easily undone.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}