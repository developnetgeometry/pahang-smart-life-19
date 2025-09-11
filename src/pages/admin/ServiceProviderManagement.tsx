import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Star,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Application {
  id: string;
  business_name: string;
  business_type: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  priority: string;
  created_at: string;
  service_categories: string[];
  services_offered: string[];
  applicant: {
    full_name: string;
  };
}

interface ServiceProvider {
  id: string;
  business_name: string;
  business_type: string;
  contact_phone: string;
  contact_email: string;
  is_active: boolean;
  is_verified: boolean;
  compliance_status: string;
  average_rating: number;
  total_reviews: number;
  service_categories: string[];
  user: {
    full_name: string;
  };
}

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  under_review: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  additional_info_required: "bg-orange-100 text-orange-800",
};

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export default function ServiceProviderManagement() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  useEffect(() => {
    fetchApplications();
    fetchProviders();
  }, []);

  const fetchApplications = async () => {
    try {
      console.log("Fetching applications...");
      // Build query - simplified without the profile join for now
      let query = supabase.from("service_provider_applications").select(`
          id,
          business_name,
          business_type,
          contact_person,
          contact_email,
          contact_phone,
          status,
          priority,
          created_at,
          service_categories,
          services_offered
        `);

      // Apply district filtering based on role
      if (!hasRole("state_admin")) {
        // For non-state admins, filter by their district
        const { data: me } = await supabase
          .from('profiles')
          .select('district_id')
          .eq('id', user?.id)
          .maybeSingle();
        
        if (me?.district_id) {
          query = query.eq("district_id", me.district_id);
        }
      }
      // State admins see all applications (no filter)

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      console.log("Applications query result:", { data, error });
      if (error) throw error;

      // Transform data to match expected format
      const transformedData = (data || []).map((app) => ({
        ...app,
        applicant: { full_name: app.contact_person },
      }));

      setApplications(transformedData);
      console.log("Set applications:", transformedData);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      console.log("Fetching providers...");
      // Build query - simplified without the profile join for now
      let query = supabase.from("service_provider_profiles").select(`
          id,
          business_name,
          business_type,
          contact_phone,
          contact_email,
          is_active,
          is_verified,
          compliance_status,
          average_rating,
          total_reviews,
          service_categories
        `);

      // Apply district filtering based on role
      if (!hasRole("state_admin")) {
        // For non-state admins, filter by their district
        const { data: me } = await supabase
          .from('profiles')
          .select('district_id')
          .eq('id', user?.id)
          .maybeSingle();
        
        if (me?.district_id) {
          query = query.eq("district_id", me.district_id);
        }
      }
      // State admins see all providers (no filter)

      const { data, error } = await query.order("business_name");

      console.log("Providers query result:", { data, error });
      if (error) throw error;

      // Transform data to match expected format
      const transformedData = (data || []).map((provider) => ({
        ...provider,
        user: { full_name: provider.business_name },
      }));

      setProviders(transformedData);
      console.log("Set providers:", transformedData);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const { error } = await supabase
        .from("service_provider_applications")
        .update({
          status: newStatus,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (error) throw error;

      toast.success(`Application ${newStatus} successfully`);
      fetchApplications();
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application status");
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.contact_person.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || app.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const applicationStats = {
    pending: applications.filter((app) => app.status === "pending").length,
    under_review: applications.filter((app) => app.status === "under_review")
      .length,
    approved: applications.filter((app) => app.status === "approved").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="mb-8 px-4">
        <div className="flex items-center gap-3 mb-4">
          <Building className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Service Provider Management</h1>
            <p className="text-muted-foreground">
              Manage service provider applications and approved providers
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {applicationStats.pending}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {applicationStats.under_review}
                  </p>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {applicationStats.approved}
                  </p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{providers.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Active Providers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="applications" className="w-full px-4">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="providers">Active Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Applications Found
                  </h3>
                  <p className="text-muted-foreground">
                    {applications.length === 0
                      ? "No service provider applications have been submitted yet."
                      : "No applications match your current filters."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredApplications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar>
                            <AvatarFallback>
                              {app.business_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {app.business_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {app.business_type} • Contact:{" "}
                              {app.contact_person}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge
                            className={
                              STATUS_COLORS[
                                app.status as keyof typeof STATUS_COLORS
                              ]
                            }
                          >
                            {app.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge
                            className={
                              PRIORITY_COLORS[
                                app.priority as keyof typeof PRIORITY_COLORS
                              ]
                            }
                          >
                            {app.priority.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground mb-1">
                            Services:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {app.service_categories
                              .slice(0, 3)
                              .map((category) => (
                                <Badge
                                  key={category}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {category}
                                </Badge>
                              ))}
                            {app.service_categories.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{app.service_categories.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Applied:{" "}
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/admin/service-providers/review/${app.id}`
                            )
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="space-y-4">
            {providers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Active Providers
                  </h3>
                  <p className="text-muted-foreground">
                    No service providers have been approved yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              providers.map((provider) => (
                <Card key={provider.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar>
                            <AvatarFallback>
                              {provider.business_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {provider.business_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {provider.business_type} •{" "}
                              {provider.user?.full_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">
                              {provider.average_rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({provider.total_reviews} reviews)
                            </span>
                          </div>

                          <Badge
                            variant={
                              provider.is_verified ? "default" : "secondary"
                            }
                          >
                            {provider.is_verified ? "Verified" : "Unverified"}
                          </Badge>

                          <Badge
                            variant={
                              provider.is_active ? "default" : "destructive"
                            }
                          >
                            {provider.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {provider.service_categories.map((category) => (
                              <Badge
                                key={category}
                                variant="outline"
                                className="text-xs"
                              >
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{provider.contact_email}</span>
                          <span>{provider.contact_phone}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
