import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
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
  Loader2,
  ChevronLeft,
  ChevronRight,
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

// Memoized Application Card component
const ApplicationCard = memo(
  ({
    application,
    onStatusUpdate,
  }: {
    application: Application;
    onStatusUpdate: (id: string, status: string) => void;
  }) => {
    const navigate = useNavigate();

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Avatar>
                  <AvatarFallback>
                    {application.business_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {application.business_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {application.business_type} • Contact:{" "}
                    {application.contact_person}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge
                  className={
                    STATUS_COLORS[
                      application.status as keyof typeof STATUS_COLORS
                    ]
                  }
                >
                  {application.status.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge
                  className={
                    PRIORITY_COLORS[
                      application.priority as keyof typeof PRIORITY_COLORS
                    ]
                  }
                >
                  {application.priority.toUpperCase()}
                </Badge>
              </div>

              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-1">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {application.service_categories
                    .slice(0, 3)
                    .map((category: string) => (
                      <Badge
                        key={category}
                        variant="outline"
                        className="text-xs"
                      >
                        {category}
                      </Badge>
                    ))}
                  {application.service_categories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{application.service_categories.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Applied: {new Date(application.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  navigate(`/admin/service-providers/review/${application.id}`)
                }
              >
                <Eye className="h-4 w-4 mr-1" />
                Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

// Memoized Provider Card component
const ProviderCard = memo(({ provider }: { provider: ServiceProvider }) => {
  return (
    <Card>
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
                  {provider.business_type} • {provider.user?.full_name}
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

              <Badge variant={provider.is_verified ? "default" : "secondary"}>
                {provider.is_verified ? "Verified" : "Unverified"}
              </Badge>

              <Badge variant={provider.is_active ? "default" : "destructive"}>
                {provider.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {provider.service_categories.map((category: string) => (
                  <Badge key={category} variant="outline" className="text-xs">
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
  );
});

ApplicationCard.displayName = "ApplicationCard";
ProviderCard.displayName = "ProviderCard";

/**
 * Service Provider Management Component with Performance Optimizations
 *
 * Features:
 * - Server-side pagination (15 records per page)
 * - Debounced search (300ms delay to reduce API calls)
 * - Memoized components and functions to prevent unnecessary re-renders
 * - Loading states for better UX
 * - Client-side filtering for status and priority
 * - Responsive pagination controls
 * - Separate pagination for Applications and Active Providers
 */

export default function ServiceProviderManagement() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [applications, setApplications] = useState<Application[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [providerStatusFilter, setProviderStatusFilter] =
    useState<string>("all");

  // Pagination states for Applications
  const [applicationsCurrentPage, setApplicationsCurrentPage] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);

  // Pagination states for Providers
  const [providersCurrentPage, setProvidersCurrentPage] = useState(1);
  const [totalProviders, setTotalProviders] = useState(0);

  // Common pagination settings
  const itemsPerPage = 15;

  // Modal operation flags
  const [isModalOperation, setIsModalOperation] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Active tab state
  const [activeTab, setActiveTab] = useState("applications");

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to first page when search changes
      if (activeTab === "applications") {
        setApplicationsCurrentPage(1);
      } else {
        setProvidersCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, activeTab]);

  // Reset pages when filters change
  useEffect(() => {
    if (activeTab === "applications") {
      setApplicationsCurrentPage(1);
    } else {
      setProvidersCurrentPage(1);
    }
  }, [statusFilter, priorityFilter, providerStatusFilter, activeTab]);

  // Load data when component mounts or pagination changes
  useEffect(() => {
    if (!isModalOperation) {
      // Save scroll position before data loads to restore later
      setScrollPosition(window.scrollY);

      if (activeTab === "applications") {
        loadApplications();
      } else {
        loadProviders();
      }
    }
  }, [
    activeTab,
    applicationsCurrentPage,
    providersCurrentPage,
    debouncedSearchTerm,
    statusFilter,
    priorityFilter,
    providerStatusFilter,
    isModalOperation,
  ]);

  // Restore scroll position after modal operations
  useEffect(() => {
    if (!isModalOperation && scrollPosition > 0) {
      const timer = setTimeout(() => {
        window.scrollTo(0, scrollPosition);
        setScrollPosition(0);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isModalOperation, scrollPosition]);

  // Load applications with server-side pagination and filtering
  const loadApplications = useCallback(async () => {
    if (isModalOperation) return;

    try {
      setLoading(true);
      console.log("Fetching applications...");

      // Build query with pagination
      let query = supabase.from("service_provider_applications").select(
        `
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
        `,
        { count: "exact" }
      );

      // Apply district filtering based on role
      if (!hasRole("state_admin")) {
        const { data: me } = await supabase
          .from("profiles")
          .select("district_id")
          .eq("id", user?.id)
          .maybeSingle();

        if (me?.district_id) {
          query = query.eq("district_id", me.district_id);
        }
      }

      // Apply search filter
      if (debouncedSearchTerm) {
        query = query.or(
          `business_name.ilike.%${debouncedSearchTerm}%,contact_person.ilike.%${debouncedSearchTerm}%`
        );
      }

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Apply priority filter
      if (priorityFilter !== "all") {
        query = query.eq("priority", priorityFilter);
      }

      // Apply pagination
      const from = (applicationsCurrentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query.order("created_at", {
        ascending: false,
      });

      console.log("Applications query result:", { data, error, count });
      if (error) throw error;

      // Transform data to match expected format
      const transformedData = (data || []).map((app) => ({
        ...app,
        applicant: { full_name: app.contact_person },
      }));

      setApplications(transformedData);
      setTotalApplications(count || 0);
      console.log("Set applications:", transformedData);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [
    hasRole,
    user?.id,
    debouncedSearchTerm,
    statusFilter,
    priorityFilter,
    applicationsCurrentPage,
    itemsPerPage,
    isModalOperation,
  ]);

  // Load providers with server-side pagination and filtering
  const loadProviders = useCallback(async () => {
    if (isModalOperation) return;

    try {
      setLoading(true);
      console.log("Fetching providers...");

      // Build query with pagination
      let query = supabase.from("service_provider_profiles").select(
        `
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
        `,
        { count: "exact" }
      );

      // Apply district filtering based on role
      if (!hasRole("state_admin")) {
        const { data: me } = await supabase
          .from("profiles")
          .select("district_id")
          .eq("id", user?.id)
          .maybeSingle();

        if (me?.district_id) {
          query = query.eq("district_id", me.district_id);
        }
      }

      // Apply search filter
      if (debouncedSearchTerm) {
        query = query.or(
          `business_name.ilike.%${debouncedSearchTerm}%,business_type.ilike.%${debouncedSearchTerm}%`
        );
      }

      // Apply provider status filter
      if (providerStatusFilter === "active") {
        query = query.eq("is_active", true);
      } else if (providerStatusFilter === "inactive") {
        query = query.eq("is_active", false);
      } else if (providerStatusFilter === "verified") {
        query = query.eq("is_verified", true);
      } else if (providerStatusFilter === "unverified") {
        query = query.eq("is_verified", false);
      }

      // Apply pagination
      const from = (providersCurrentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query.order("business_name");

      console.log("Providers query result:", { data, error, count });
      if (error) throw error;

      // Transform data to match expected format
      const transformedData = (data || []).map((provider) => ({
        ...provider,
        user: { full_name: provider.business_name },
      }));

      setProviders(transformedData);
      setTotalProviders(count || 0);
      console.log("Set providers:", transformedData);
    } catch (error) {
      console.error("Error fetching providers:", error);
      toast.error("Failed to load providers");
    } finally {
      setLoading(false);
    }
  }, [
    hasRole,
    user?.id,
    debouncedSearchTerm,
    providerStatusFilter,
    providersCurrentPage,
    itemsPerPage,
    isModalOperation,
  ]);

  // Update application status
  const updateApplicationStatus = useCallback(
    async (applicationId: string, status: string) => {
      try {
        setIsModalOperation(true);
        const { error } = await supabase
          .from("service_provider_applications")
          .update({
            status,
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", applicationId);

        if (error) throw error;

        await loadApplications();
        toast.success(`Application ${status} successfully`);
      } catch (error) {
        console.error("Error updating application status:", error);
        toast.error("Failed to update application status");
      } finally {
        setIsModalOperation(false);
      }
    },
    [user?.id, loadApplications]
  );

  // Calculate stats
  const applicationStats = useMemo(
    () => ({
      total: totalApplications,
      pending: applications.filter((app) => app.status === "pending").length,
      approved: applications.filter((app) => app.status === "approved").length,
      rejected: applications.filter((app) => app.status === "rejected").length,
    }),
    [applications, totalApplications]
  );

  const providerStats = useMemo(
    () => ({
      total: totalProviders,
      active: providers.filter((provider) => provider.is_active).length,
      verified: providers.filter((provider) => provider.is_verified).length,
      pending: providers.filter((provider) => !provider.is_verified).length,
    }),
    [providers, totalProviders]
  );

  // Pagination calculations
  const totalApplicationPages = Math.ceil(totalApplications / itemsPerPage);
  const totalProviderPages = Math.ceil(totalProviders / itemsPerPage);

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
                  <p className="text-2xl font-bold">{applicationStats.total}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Applications
                  </p>
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

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full px-4"
      >
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
            {applications.length === 0 && !loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Applications Found
                  </h3>
                  <p className="text-muted-foreground">
                    {totalApplications === 0
                      ? "No service provider applications have been submitted yet."
                      : "No applications match your current filters."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              applications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onStatusUpdate={updateApplicationStatus}
                />
              ))
            )}
          </div>

          {/* Pagination for Applications */}
          {totalApplications > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                {Math.min(
                  (applicationsCurrentPage - 1) * itemsPerPage + 1,
                  totalApplications
                )}{" "}
                to{" "}
                {Math.min(
                  applicationsCurrentPage * itemsPerPage,
                  totalApplications
                )}{" "}
                of {totalApplications} applications
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setApplicationsCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={applicationsCurrentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {applicationsCurrentPage} of {totalApplicationPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setApplicationsCurrentPage((prev) =>
                      Math.min(totalApplicationPages, prev + 1)
                    )
                  }
                  disabled={applicationsCurrentPage === totalApplicationPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          {/* Provider Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search providers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <Select
                  value={providerStatusFilter}
                  onValueChange={setProviderStatusFilter}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {providers.length === 0 && !loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Active Providers
                  </h3>
                  <p className="text-muted-foreground">
                    {totalProviders === 0
                      ? "No service providers have been approved yet."
                      : "No providers match your current filters."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))
            )}
          </div>

          {/* Pagination for Providers */}
          {totalProviders > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                {Math.min(
                  (providersCurrentPage - 1) * itemsPerPage + 1,
                  totalProviders
                )}{" "}
                to{" "}
                {Math.min(providersCurrentPage * itemsPerPage, totalProviders)}{" "}
                of {totalProviders} providers
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setProvidersCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={providersCurrentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {providersCurrentPage} of {totalProviderPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setProvidersCurrentPage((prev) =>
                      Math.min(totalProviderPages, prev + 1)
                    )
                  }
                  disabled={providersCurrentPage === totalProviderPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
