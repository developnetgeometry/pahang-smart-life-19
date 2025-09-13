import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Upload,
  X,
  Loader2,
  Camera,
  Search,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ComplaintEscalationPanel from "@/components/complaints/ComplaintEscalationPanel";
import RealTimeNotificationCenter from "@/components/notifications/RealTimeNotificationCenter";
import ComplaintResponseHistory from "@/components/complaints/ComplaintResponseHistory";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  photos?: string[];
  escalation_level: number;
  escalated_at?: string;
  escalated_by?: string;
  auto_escalated?: boolean;
  location?: string;
}

// Memoized components for better performance
const ComplaintCard = memo(({ 
  complaint, 
  onClick, 
  onSelect,
  isSelected,
  language,
  getPriorityColor,
  getStatusColor,
  prettyPriority,
  prettyStatus,
  getEscalationBadge
}: any) => (
  <Card
    className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
      isSelected ? "ring-2 ring-primary shadow-md" : ""
    }`}
    onClick={() => onClick(complaint)}
  >
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
            <h3 className="font-semibold flex-1 min-w-0 break-words">{complaint.title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {getEscalationBadge(complaint)}
              <Badge className={getPriorityColor(complaint.priority)}>
                {prettyPriority(complaint.priority)}
              </Badge>
              <Badge className={getStatusColor(complaint.status)}>
                {prettyStatus(complaint.status)}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3 break-words line-clamp-2">
            {complaint.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(complaint.created_at).toLocaleDateString()}
            </span>
            <span className="px-2 py-1 bg-muted rounded text-xs">
              {complaint.category}
            </span>
            {complaint.location && (
              <span className="break-words flex items-center">
                📍 {complaint.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
));

const PaginationControls = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta);
         i <= Math.min(totalPages - 1, currentPage + delta);
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {getVisiblePages().map((page, index) => (
        <Button
          key={index}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...' || loading}
          className={page === '...' ? 'cursor-default' : ''}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
});

export default function MyComplaints() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const complaintsPerPage = 15;
  
  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Modal and form states
  const [submitting, setSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "medium" as "low" | "medium" | "high",
    location: "",
    description: "",
  });

  // Enhanced fetch complaints with server-side pagination and filtering
  const fetchComplaints = useCallback(async (page = 1, preserveScroll = false) => {
    if (!user) return;

    try {
      if (!preserveScroll) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      // Build query parameters
      const offset = (page - 1) * complaintsPerPage;
      let query = supabase
        .from("complaints")
        .select("*", { count: 'exact' })
        .eq("complainant_id", user.id);

      // Apply search filter
      if (debouncedSearchTerm) {
        query = query.or(`title.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%,category.ilike.%${debouncedSearchTerm}%,location.ilike.%${debouncedSearchTerm}%`);
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      // Apply status filter
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus as any);
      }

      // Apply priority filter
      if (selectedPriority !== 'all') {
        query = query.eq('priority', selectedPriority as any);
      }

      // Apply sorting
      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        case 'priority':
          query = query.order('priority', { ascending: false })
                       .order('created_at', { ascending: false });
          break;
        case 'status':
          query = query.order('status', { ascending: true })
                       .order('created_at', { ascending: false });
          break;
        case 'latest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply pagination
      query = query.range(offset, offset + complaintsPerPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const transformedComplaints: Complaint[] = (data || []).map((complaint) => ({
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        priority: complaint.priority,
        status: complaint.status,
        created_at: complaint.created_at,
        updated_at: complaint.updated_at,
        photos: complaint.photos || [],
        escalation_level: complaint.escalation_level || 0,
        escalated_at: complaint.escalated_at,
        escalated_by: complaint.escalated_by,
        auto_escalated: complaint.auto_escalated || false,
        location: complaint.location,
      }));

      setComplaints(transformedComplaints);
      setTotalComplaints(count || 0);
      setTotalPages(Math.ceil((count || 0) / complaintsPerPage));
      setCurrentPage(page);

      // Preserve scroll position if requested
      if (preserveScroll && scrollPosition > 0) {
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 100);
      }

    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast({
        title: language === "en" ? "Error loading complaints" : "Ralat memuatkan aduan",
        variant: "destructive",
      });
      
      // Set fallback empty state
      setComplaints([]);
      setTotalComplaints(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, debouncedSearchTerm, selectedCategory, selectedStatus, selectedPriority, sortBy, language, scrollPosition]);

  // Effects for data fetching
  useEffect(() => {
    if (user) {
      fetchComplaints(1);
    }
  }, [user, fetchComplaints]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      fetchComplaints(1);
    } else {
      fetchComplaints(1);
    }
  }, [debouncedSearchTerm, selectedCategory, selectedStatus, selectedPriority, sortBy]);

  // Refresh on refreshKey change
  useEffect(() => {
    if (refreshKey > 0) {
      setScrollPosition(window.scrollY);
      fetchComplaints(currentPage, true);
    }
  }, [refreshKey, fetchComplaints, currentPage]);

  // Event handlers
  const handlePageChange = useCallback((page: number) => {
    setScrollPosition(0);
    fetchComplaints(page);
    window.scrollTo(0, 0);
  }, [fetchComplaints]);

  const handleRefresh = useCallback(() => {
    setScrollPosition(window.scrollY);
    fetchComplaints(currentPage, true);
  }, [currentPage, fetchComplaints]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setSortBy("latest");
  }, []);

  const handleComplaintClick = useCallback((complaint: Complaint) => {
    setSelectedComplaint(complaint);
    navigate(`/complaint/${complaint.id}`);
  }, [navigate]);

  const handleSubmitComplaint = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      // Get comprehensive user profile data for logging
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("district_id, community_id, full_name, phone, unit_number")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      console.log("Submitting complaint with complainant details:", {
        complainant_id: user.id,
        complainant_name: profileData.full_name,
        complainant_phone: profileData.phone,
        complainant_unit: profileData.unit_number,
        district_id: profileData.district_id,
        community_id: profileData.community_id,
      });

      const { error } = await supabase.from("complaints").insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        location: formData.location,
        complainant_id: user.id,
        district_id: profileData.district_id,
        status: "pending",
        photos: uploadedPhotos.length > 0 ? uploadedPhotos : null,
      });

      if (error) throw error;

      toast({
        title: language === "en"
          ? "Complaint submitted successfully"
          : "Aduan berjaya dihantar",
        description: language === "en"
          ? "Your complaint has been logged and will be reviewed by the appropriate team."
          : "Aduan anda telah direkodkan dan akan dikaji oleh pasukan yang berkenaan.",
      });

      // Reset form
      setFormData({
        title: "",
        category: "",
        priority: "medium",
        location: "",
        description: "",
      });
      setUploadedPhotos([]);
      setIsCreateOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast({
        title: language === "en"
          ? "Error submitting complaint"
          : "Ralat menghantar aduan",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotoUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `complaint-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('complaint-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('complaint-photos')
          .getPublicUrl(filePath);

        newPhotoUrls.push(urlData.publicUrl);
      }

      setUploadedPhotos(prev => [...prev, ...newPhotoUrls]);
      
      toast({
        title: language === "en" ? "Photos uploaded" : "Foto dimuat naik",
        description: language === "en" 
          ? `${newPhotoUrls.length} photo(s) uploaded successfully`
          : `${newPhotoUrls.length} foto berjaya dimuat naik`,
      });
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast({
        title: language === "en" ? "Upload failed" : "Gagal muat naik",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (photoUrl: string) => {
    setUploadedPhotos(prev => prev.filter(url => url !== photoUrl));
  };

  // Utility functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const prettyPriority = (priority: string) => {
    const priorities = {
      en: { urgent: "Urgent", high: "High", medium: "Medium", low: "Low" },
      ms: { urgent: "Penting", high: "Tinggi", medium: "Sederhana", low: "Rendah" }
    };
    return priorities[language][priority as keyof typeof priorities.en] || priority;
  };

  const prettyStatus = (status: string) => {
    const statuses = {
      en: { pending: "Pending", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" },
      ms: { pending: "Menunggu", in_progress: "Dalam Proses", resolved: "Diselesaikan", closed: "Ditutup" }
    };
    return statuses[language][status as keyof typeof statuses.en] || status;
  };

  const getEscalationBadge = (complaint: Complaint) => {
    if (complaint.escalation_level > 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {language === "en" ? "Escalated" : "Dinaik taraf"} L{complaint.escalation_level}
        </Badge>
      );
    }
    return null;
  };

  // Memoized calculations
  const stats = useMemo(() => ({
    total: totalComplaints,
    pending: complaints.filter(c => c.status === "pending").length,
    escalated: complaints.filter(c => c.escalation_level > 0).length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  }), [totalComplaints, complaints]);

  const resultText = useMemo(() => {
    const start = (currentPage - 1) * complaintsPerPage + 1;
    const end = Math.min(currentPage * complaintsPerPage, totalComplaints);
    const showingText = language === "en" ? "Showing" : "Menunjukkan";
    const ofText = language === "en" ? "of" : "daripada";
    const resultsText = language === "en" ? "results" : "hasil";
    return `${showingText} ${start}-${end} ${ofText} ${totalComplaints} ${resultsText}`;
  }, [currentPage, totalComplaints, language]);

  if (loading && complaints.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
            {language === "en" ? "My Complaints" : "Aduan Saya"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "en"
              ? "Track and manage your submitted complaints"
              : "Jejak dan urus aduan yang telah dihantar"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {language === "en" ? "Refresh" : "Muat Semula"}
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {language === "en" ? "Submit Complaint" : "Hantar Aduan"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {language === "en" ? "Submit New Complaint" : "Hantar Aduan Baru"}
                </DialogTitle>
                <DialogDescription>
                  {language === "en"
                    ? "Provide details about your issue and we'll address it promptly."
                    : "Berikan butiran tentang masalah anda dan kami akan menanganinya dengan segera."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {language === "en" ? "Title" : "Tajuk"}
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder={
                      language === "en"
                        ? "Brief description of the issue"
                        : "Penerangan ringkas tentang masalah"
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      {language === "en" ? "Category" : "Kategori"}
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select category" : "Pilih kategori"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">
                          <div className="flex items-center">
                            <span className="text-blue-600 mr-2">🔧</span>
                            {language === "en" ? "Maintenance" : "Penyelenggaraan"}
                          </div>
                        </SelectItem>
                        <SelectItem value="security">
                          <div className="flex items-center">
                            <span className="text-red-600 mr-2">🛡️</span>
                            {language === "en" ? "Security" : "Keselamatan"}
                          </div>
                        </SelectItem>
                        <SelectItem value="facility">
                          <div className="flex items-center">
                            <span className="text-green-600 mr-2">🏢</span>
                            {language === "en" ? "Facility" : "Kemudahan"}
                          </div>
                        </SelectItem>
                        <SelectItem value="noise">
                          <div className="flex items-center">
                            <span className="text-yellow-600 mr-2">🔊</span>
                            {language === "en" ? "Noise" : "Bunyi Bising"}
                          </div>
                        </SelectItem>
                        <SelectItem value="cleanliness">
                          <div className="flex items-center">
                            <span className="text-purple-600 mr-2">🧹</span>
                            {language === "en" ? "Cleanliness" : "Kebersihan"}
                          </div>
                        </SelectItem>
                        <SelectItem value="other">
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-2">📝</span>
                            {language === "en" ? "Other" : "Lain-lain"}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {language === "en" ? "Priority Level" : "Tahap Keutamaan"}
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setFormData((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          {language === "en" ? "Low" : "Rendah"}
                        </SelectItem>
                        <SelectItem value="medium">
                          {language === "en" ? "Medium" : "Sederhana"}
                        </SelectItem>
                        <SelectItem value="high">
                          {language === "en" ? "High" : "Tinggi"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    {language === "en" ? "Location" : "Lokasi"}
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder={
                      language === "en"
                        ? "e.g., Block A, Unit 12-3, Common Area"
                        : "cth: Blok A, Unit 12-3, Kawasan Umum"
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    {language === "en"
                      ? "Detailed Description"
                      : "Penerangan Terperinci"}
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder={
                      language === "en"
                        ? "Please provide detailed information about the issue..."
                        : "Sila berikan maklumat terperinci tentang masalah..."
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {language === "en" ? "Photos (Optional)" : "Foto (Pilihan)"}
                  </Label>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {uploading
                            ? language === "en"
                              ? "Uploading..."
                              : "Memuat naik..."
                            : language === "en"
                            ? "Click to upload photos"
                            : "Klik untuk muat naik foto"}
                        </p>
                      </label>
                    </div>

                    {uploadedPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedPhotos.map((photoUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={photoUrl}
                              alt={`Complaint photo ${index + 1}`}
                              className="w-full h-20 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(photoUrl)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={submitting}
                  >
                    {language === "en" ? "Cancel" : "Batal"}
                  </Button>
                  <Button
                    onClick={handleSubmitComplaint}
                    disabled={
                      submitting ||
                      !formData.title ||
                      !formData.category ||
                      !formData.location ||
                      !formData.description
                    }
                  >
                    {submitting && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {language === "en" ? "Submit" : "Hantar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Total" : "Jumlah"}
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Pending" : "Menunggu"}
                </p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Escalated" : "Dinaik taraf"}
                </p>
                <p className="text-2xl font-bold">{stats.escalated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Resolved" : "Diselesaikan"}
                </p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              {language === "en" ? "Filters" : "Penapis"}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs"
            >
              {language === "en" ? "Clear Filters" : "Kosongkan Penapis"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === "en" ? "Search complaints..." : "Cari aduan..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={language === "en" ? "Category" : "Kategori"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "en" ? "All Categories" : "Semua Kategori"}</SelectItem>
                <SelectItem value="maintenance">{language === "en" ? "Maintenance" : "Penyelenggaraan"}</SelectItem>
                <SelectItem value="security">{language === "en" ? "Security" : "Keselamatan"}</SelectItem>
                <SelectItem value="facility">{language === "en" ? "Facility" : "Kemudahan"}</SelectItem>
                <SelectItem value="noise">{language === "en" ? "Noise" : "Bunyi Bising"}</SelectItem>
                <SelectItem value="cleanliness">{language === "en" ? "Cleanliness" : "Kebersihan"}</SelectItem>
                <SelectItem value="other">{language === "en" ? "Other" : "Lain-lain"}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder={language === "en" ? "Status" : "Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "en" ? "All Status" : "Semua Status"}</SelectItem>
                <SelectItem value="pending">{language === "en" ? "Pending" : "Menunggu"}</SelectItem>
                <SelectItem value="in_progress">{language === "en" ? "In Progress" : "Dalam Proses"}</SelectItem>
                <SelectItem value="resolved">{language === "en" ? "Resolved" : "Diselesaikan"}</SelectItem>
                <SelectItem value="closed">{language === "en" ? "Closed" : "Ditutup"}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder={language === "en" ? "Priority" : "Keutamaan"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "en" ? "All Priorities" : "Semua Keutamaan"}</SelectItem>
                <SelectItem value="urgent">{language === "en" ? "Urgent" : "Penting"}</SelectItem>
                <SelectItem value="high">{language === "en" ? "High" : "Tinggi"}</SelectItem>
                <SelectItem value="medium">{language === "en" ? "Medium" : "Sederhana"}</SelectItem>
                <SelectItem value="low">{language === "en" ? "Low" : "Rendah"}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={language === "en" ? "Sort By" : "Susun Mengikut"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">{language === "en" ? "Latest" : "Terkini"}</SelectItem>
                <SelectItem value="oldest">{language === "en" ? "Oldest" : "Terlama"}</SelectItem>
                <SelectItem value="title">{language === "en" ? "Title A-Z" : "Tajuk A-Z"}</SelectItem>
                <SelectItem value="priority">{language === "en" ? "Priority" : "Keutamaan"}</SelectItem>
                <SelectItem value="status">{language === "en" ? "Status" : "Status"}</SelectItem>
              </SelectContent>
            </Select>

            <div className="md:col-span-2 lg:col-span-2 flex items-center justify-between text-sm text-muted-foreground">
              {resultText}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaints List */}
          <div className="space-y-4">
            {loading ? (
              // Loading skeleton
              [...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : complaints.length > 0 ? (
              <>
                {complaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onClick={handleComplaintClick}
                    onSelect={setSelectedComplaint}
                    isSelected={selectedComplaint?.id === complaint.id}
                    language={language}
                    getPriorityColor={getPriorityColor}
                    getStatusColor={getStatusColor}
                    prettyPriority={prettyPriority}
                    prettyStatus={prettyStatus}
                    getEscalationBadge={getEscalationBadge}
                  />
                ))}

                {/* Pagination */}
                <div className="flex justify-center pt-6">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    loading={loading}
                  />
                </div>
              </>
            ) : (
              // No results state
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === "en"
                      ? "No complaints found"
                      : "Tiada aduan dijumpai"}
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {language === "en"
                      ? "Try adjusting your search or filters, or submit your first complaint"
                      : "Cuba laraskan carian atau penapis anda, atau hantar aduan pertama anda"}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleClearFilters} variant="outline">
                      {language === "en" ? "Clear Filters" : "Kosongkan Penapis"}
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      {language === "en" ? "Submit Complaint" : "Hantar Aduan"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <RealTimeNotificationCenter />

          {selectedComplaint && (
            <ComplaintEscalationPanel
              complaintId={selectedComplaint.id}
              currentEscalationLevel={selectedComplaint.escalation_level}
              category={selectedComplaint.category}
              title={selectedComplaint.title}
              status={selectedComplaint.status}
              createdAt={selectedComplaint.created_at}
              escalatedAt={selectedComplaint.escalated_at}
              autoEscalated={selectedComplaint.auto_escalated}
              onEscalationChange={() => setRefreshKey((prev) => prev + 1)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
