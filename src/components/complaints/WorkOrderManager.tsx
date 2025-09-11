import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Wrench,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  work_order_type:
    | "maintenance"
    | "repair"
    | "inspection"
    | "emergency"
    | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  location: string;
  estimated_hours?: number;
  estimated_cost?: number;
  scheduled_date?: string;
  complaint_id?: string;
  assigned_to?: string;
  assigned_name?: string;
  created_at: string;
  updated_at: string;
}

interface CreateWorkOrderProps {
  complaintId?: string;
  complaintTitle?: string;
  complaintDescription?: string;
  complaintLocation?: string;
  onWorkOrderCreated?: () => void;
}

export default function WorkOrderManager({
  complaintId,
  complaintTitle,
  complaintDescription,
  complaintLocation,
  onWorkOrderCreated,
}: CreateWorkOrderProps) {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null
  );
  const [maintenanceStaff, setMaintenanceStaff] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const [formData, setFormData] = useState({
    title: complaintTitle || "",
    description: complaintDescription || "",
    work_order_type: "general" as const,
    priority: "medium" as const,
    location: complaintLocation || "",
    estimated_hours: "",
    estimated_cost: "",
    scheduled_date: "",
    assigned_to: "",
    notes: "",
  });

  useEffect(() => {
    fetchWorkOrders();
    fetchMaintenanceStaff();
  }, []);

  const fetchWorkOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch assigned user names separately
      const workOrdersWithNames = await Promise.all(
        (data || []).map(async (wo: any) => {
          let assigned_name = "";
          if (wo.assigned_to) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", wo.assigned_to)
              .single();
            assigned_name = profileData?.full_name || "";
          }

          return {
            id: wo.id,
            title: wo.title,
            description: wo.description,
            work_order_type: wo.work_order_type,
            priority: wo.priority,
            status: wo.status,
            location: wo.location,
            estimated_hours: wo.estimated_hours,
            estimated_cost: wo.estimated_cost,
            scheduled_date: wo.scheduled_date,
            complaint_id: wo.complaint_id,
            assigned_to: wo.assigned_to,
            assigned_name: assigned_name,
            created_at: wo.created_at,
            updated_at: wo.updated_at,
          };
        })
      );

      setWorkOrders(workOrdersWithNames);
    } catch (error) {
      console.error("Error fetching work orders:", error);
      toast({
        title:
          language === "en"
            ? "Error loading work orders"
            : "Ralat memuatkan arahan kerja",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceStaff = async () => {
    try {
      // Get maintenance staff user IDs first
      const { data: roleData, error: roleError } = await supabase
        .from("enhanced_user_roles")
        .select("user_id")
        .eq("role", "maintenance_staff")
        .eq("is_active", true);

      if (roleError) throw roleError;

      if (!roleData || roleData.length === 0) {
        setMaintenanceStaff([]);
        return;
      }

      // Then get profile information for these users
      const userIds = roleData.map((item) => item.user_id);
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      if (profileError) throw profileError;

      const staff = (profileData || []).map((profile: any) => ({
        id: profile.user_id,
        name: profile.full_name || profile.email || "Unknown",
      }));

      setMaintenanceStaff(staff);
    } catch (error) {
      console.error("Error fetching maintenance staff:", error);
    }
  };

  const handleCreateWorkOrder = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      const workOrderData = {
        title: formData.title,
        description: formData.description,
        work_order_type: formData.work_order_type,
        priority: formData.priority,
        location: formData.location,
        estimated_hours: formData.estimated_hours
          ? parseInt(formData.estimated_hours)
          : null,
        estimated_cost: formData.estimated_cost
          ? parseFloat(formData.estimated_cost)
          : null,
        scheduled_date: formData.scheduled_date || null,
        assigned_to: formData.assigned_to || null,
        complaint_id: complaintId || null,
        notes: formData.notes || null,
        created_by: user.id,
      };

      const { error } = await supabase
        .from("work_orders")
        .insert(workOrderData);

      if (error) throw error;

      toast({
        title:
          language === "en"
            ? "Work order created successfully"
            : "Arahan kerja berjaya dicipta",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        work_order_type: "general",
        priority: "medium",
        location: "",
        estimated_hours: "",
        estimated_cost: "",
        scheduled_date: "",
        assigned_to: "",
        notes: "",
      });

      setIsCreateOpen(false);
      fetchWorkOrders();
      onWorkOrderCreated?.();
    } catch (error) {
      console.error("Error creating work order:", error);
      toast({
        title:
          language === "en"
            ? "Error creating work order"
            : "Ralat mencipta arahan kerja",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-orange-500";
      case "urgent":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-500";
      case "assigned":
        return "bg-purple-500";
      case "in_progress":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return <Wrench className="w-4 h-4" />;
      case "repair":
        return <AlertTriangle className="w-4 h-4" />;
      case "emergency":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-48"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-5 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {language === "en" ? "Work Orders" : "Arahan Kerja"}
          </h2>
          <p className="text-muted-foreground">
            {language === "en"
              ? "Create and manage maintenance work orders"
              : "Cipta dan urus arahan kerja penyelenggaraan"}
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {language === "en" ? "New Work Order" : "Arahan Kerja Baru"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {language === "en" ? "Create Work Order" : "Cipta Arahan Kerja"}
              </DialogTitle>
              <DialogDescription>
                {complaintId
                  ? language === "en"
                    ? "Create a work order to resolve this complaint"
                    : "Cipta arahan kerja untuk menyelesaikan aduan ini"
                  : language === "en"
                  ? "Create a new work order for maintenance tasks"
                  : "Cipta arahan kerja baru untuk tugas penyelenggaraan"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  {language === "en"
                    ? "Work Order Title"
                    : "Tajuk Arahan Kerja"}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={
                    language === "en"
                      ? "Brief description of the work needed"
                      : "Penerangan ringkas kerja yang diperlukan"
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {language === "en" ? "Work Type" : "Jenis Kerja"}
                  </Label>
                  <Select
                    value={formData.work_order_type}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({
                        ...prev,
                        work_order_type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        {language === "en" ? "General" : "Umum"}
                      </SelectItem>
                      <SelectItem value="maintenance">
                        {language === "en" ? "Maintenance" : "Penyelenggaraan"}
                      </SelectItem>
                      <SelectItem value="repair">
                        {language === "en" ? "Repair" : "Pembaikan"}
                      </SelectItem>
                      <SelectItem value="inspection">
                        {language === "en" ? "Inspection" : "Pemeriksaan"}
                      </SelectItem>
                      <SelectItem value="emergency">
                        {language === "en" ? "Emergency" : "Kecemasan"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{language === "en" ? "Priority" : "Keutamaan"}</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) =>
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
                      <SelectItem value="urgent">
                        {language === "en" ? "Urgent" : "Segera"}
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
                      ? "Where the work needs to be done"
                      : "Di mana kerja perlu dilakukan"
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
                      ? "Detailed description of the work required..."
                      : "Penerangan terperinci kerja yang diperlukan..."
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_hours">
                    {language === "en" ? "Est. Hours" : "Anggaran Jam"}
                  </Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        estimated_hours: e.target.value,
                      }))
                    }
                    placeholder="8"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_cost">
                    {language === "en"
                      ? "Est. Cost (MYR)"
                      : "Anggaran Kos (MYR)"}
                  </Label>
                  <Input
                    id="estimated_cost"
                    type="number"
                    step="0.01"
                    value={formData.estimated_cost}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        estimated_cost: e.target.value,
                      }))
                    }
                    placeholder="500.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">
                    {language === "en"
                      ? "Scheduled Date"
                      : "Tarikh Dijadualkan"}
                  </Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scheduled_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  {language === "en" ? "Assign To" : "Tugaskan Kepada"}
                </Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, assigned_to: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        language === "en"
                          ? "Select staff member"
                          : "Pilih ahli kakitangan"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      {language === "en" ? "Unassigned" : "Tidak ditugaskan"}
                    </SelectItem>
                    {maintenanceStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">
                  {language === "en" ? "Additional Notes" : "Nota Tambahan"}
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder={
                    language === "en"
                      ? "Any additional instructions or requirements..."
                      : "Sebarang arahan atau keperluan tambahan..."
                  }
                  rows={3}
                />
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
                  onClick={handleCreateWorkOrder}
                  disabled={
                    submitting ||
                    !formData.title ||
                    !formData.description ||
                    !formData.location
                  }
                >
                  {submitting && (
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {language === "en"
                    ? "Create Work Order"
                    : "Cipta Arahan Kerja"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {workOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === "en"
                  ? "No work orders yet"
                  : "Tiada arahan kerja lagi"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === "en"
                  ? "Create your first work order to get started"
                  : "Cipta arahan kerja pertama anda untuk bermula"}
              </p>
            </CardContent>
          </Card>
        ) : (
          workOrders.map((workOrder) => (
            <Card
              key={workOrder.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(workOrder.work_order_type)}
                        <h3 className="font-semibold text-lg">
                          {workOrder.title}
                        </h3>
                      </div>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(workOrder.priority)}
                      >
                        {workOrder.priority}
                      </Badge>
                      <Badge className={getStatusColor(workOrder.status)}>
                        {workOrder.status.replace("_", " ")}
                      </Badge>
                      {workOrder.complaint_id && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          From Complaint
                        </Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground">
                      {workOrder.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(workOrder.created_at).toLocaleDateString()}
                      </div>
                      {workOrder.scheduled_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {language === "en" ? "Scheduled: " : "Dijadualkan: "}
                          {new Date(
                            workOrder.scheduled_date
                          ).toLocaleDateString()}
                        </div>
                      )}
                      {workOrder.assigned_name && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {workOrder.assigned_name}
                        </div>
                      )}
                      <div>📍 {workOrder.location}</div>
                    </div>

                    {(workOrder.estimated_hours ||
                      workOrder.estimated_cost) && (
                      <div className="flex items-center gap-4 text-sm">
                        {workOrder.estimated_hours && (
                          <span className="text-muted-foreground">
                            {language === "en" ? "Est: " : "Anggaran: "}
                            {workOrder.estimated_hours}h
                          </span>
                        )}
                        {workOrder.estimated_cost && (
                          <span className="text-muted-foreground">
                            MYR {workOrder.estimated_cost}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      {language === "en" ? "View Details" : "Lihat Butiran"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
