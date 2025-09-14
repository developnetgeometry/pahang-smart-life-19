import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getRoleSpecificFunction,
  isRoleSupported,
} from "@/lib/user-creation-utils";
import {
  validateUserDataForRole,
  getRoleDefaults,
  canCreateRole,
} from "@/lib/role-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Loader2,
  Home,
  Mail,
  Send,
  Check,
  X,
  Clock,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useModuleAccess } from "@/hooks/use-module-access";
import { useUserRoles } from "@/hooks/use-user-roles";
import RoleCreationValidator from "@/components/admin/RoleCreationValidator";
import RoleValidationTests from "@/components/admin/RoleValidationTests";
import { AdminDiagnostics } from "@/components/admin/AdminDiagnostics";
import { CreateUserValidator } from "@/components/admin/CreateUserValidator";
import { adminDeleteUser } from "@/service/adminService";
import { validateMalaysianPhone, handlePhoneInput } from "@/lib/phone-validation";

interface User {
  // Auth user id (used for auth actions and linking)
  id: string;
  // Profiles table primary key
  profileId: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  role: string;
  status: "active" | "inactive" | "pending" | "approved" | "rejected";
  joinDate: string;
  district_id: string;
  community_id: string;
  emailConfirmed?: boolean;
  lastSignIn?: string;
  isActive?: boolean;
}

interface HouseholdAccount {
  id: string;
  linked_user_id: string;
  relationship_type: string;
  permissions: {
    marketplace: boolean;
    bookings: boolean;
    announcements: boolean;
    complaints: boolean;
    discussions: boolean;
  };
  is_active: boolean;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

interface TenantFormData {
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  access_expires_at: string;
  permissions: {
    marketplace: boolean;
    bookings: boolean;
    announcements: boolean;
    complaints: boolean;
    discussions: boolean;
    panic_button: boolean;
  };
}

// Memoized UserCard component for better performance
const UserCard = memo(
  ({
    user,
    onUserClick,
    onEdit,
    onDelete,
    onSendInvite,
    onApprove,
    onReject,
    getRoleColor,
    getStatusColor,
    getRoleText,
    getStatusText,
    t,
    language,
  }: {
    user: User;
    onUserClick: (user: User) => void;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
    onSendInvite: (user: User) => void;
    onApprove: (user: User) => void;
    onReject: (user: User) => void;
    getRoleColor: (role: string) => string;
    getStatusColor: (status: string) => string;
    getRoleText: (role: string) => string;
    getStatusText: (status: string) => string;
    t: any;
    language: string;
  }) => (
    <div
      key={user.id}
      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onUserClick(user)}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Avatar className="flex-shrink-0">
          <AvatarImage src="" />
          <AvatarFallback>
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium truncate">{user.name}</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="truncate">{user.email}</p>
            <p>{user.phone}</p>
            <p>
              {t.unit}: {user.unit}
            </p>
            <p>
              {t.joinDate}: {user.joinDate}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0">
        <Badge className={getRoleColor(user.role)}>
          {getRoleText(user.role)}
        </Badge>
        <Badge className={getStatusColor(user.status)}>
          {getStatusText(user.status)}
        </Badge>

        {/* Email Confirmation Status */}
        {user.emailConfirmed ? (
          <div
            className="flex items-center text-green-600 text-sm"
            title="Email Confirmed"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Confirmed</span>
          </div>
        ) : (
          <div
            className="flex items-center text-yellow-600 text-sm"
            title="Email Not Confirmed"
          >
            <Clock className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Pending</span>
          </div>
        )}

        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Actions for pending users */}
          {user.status === "pending" && !user.emailConfirmed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSendInvite(user)}
              className="text-blue-600"
              title={language === "en" ? "Send Invitation" : "Hantar Jemputan"}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}

          {user.status === "pending" && user.emailConfirmed && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApprove(user)}
                className="text-green-600"
                title={t.approve}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(user)}
                className="text-red-600"
                title={t.reject}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}

          {user.status === "active" && (
            <div
              className="flex items-center text-green-600 text-sm"
              title="Active User"
            >
              <UserCheck className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Active</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
            title={t.edit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(user.id)}
            className="text-red-600"
            title={t.delete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
);

/**
 * User Management Component with Performance Optimizations
 *
 * Features:
 * - Server-side pagination (15 records per page)
 * - Debounced search (300ms delay to reduce API calls)
 * - Memoized components and functions to prevent unnecessary re-renders
 * - Loading states for better UX
 * - Client-side role and status filtering
 * - Responsive pagination controls
 */

export default function UserManagement() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isModuleEnabled } = useModuleAccess();
  const { hasRole, loading: rolesLoading, userRoles } = useUserRoles();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    email: string;
    phone: string;
    unit: string;
    role: string;
    status: User["status"] | "";
    password: string;
    confirmPassword: string;
    // Role-specific fields
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    shiftType?: string;
    badgeId?: string;
    yearsExperience?: string;
    certificationsText?: string;
    vehicleNumber?: string;
    familySize?: number;
    specialization?: string;
    access_expires_at?: string; // For guest users
    district_id?: string;
    community_id?: string;
  }>({
    name: "",
    email: "",
    phone: "",
    unit: "",
    role: "resident",
    status: "",
    password: "",
    confirmPassword: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    shiftType: "",
    badgeId: "",
    yearsExperience: "",
    certificationsText: "",
    vehicleNumber: "",
    familySize: 1,
    specialization: "",
    access_expires_at: "",
    district_id: "",
    community_id: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tenantHost, setTenantHost] = useState<null | { id: string; full_name: string; email: string; unit_number?: string }>(null);
  const goToResident = () => {
    if (!tenantHost) return;
    const host = users.find(u => u.profileId === tenantHost.id);
    if (host) {
      setIsCreateOpen(false);
      handleUserClick(host);
    }
  };
  const [creating, setCreating] = useState(false);
  const [isModalOperation, setIsModalOperation] = useState(false); // Flag to prevent unnecessary refetch
  const [scrollPosition, setScrollPosition] = useState(0); // Track scroll position

  // Phone validation states
  const [phoneError, setPhoneError] = useState<string>("");
  const [emergencyPhoneError, setEmergencyPhoneError] = useState<string>("");
  const [tenantPhoneError, setTenantPhoneError] = useState<string>("");

  // User details sheet states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [householdAccounts, setHouseholdAccounts] = useState<
    HouseholdAccount[]
  >([]);
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);

  // Add tenant states
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  const [districts, setDistricts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [tenantForm, setTenantForm] = useState<TenantFormData>({
    tenant_name: "",
    tenant_email: "",
    tenant_phone: "",
    access_expires_at: "",
    permissions: {
      marketplace: true,
      bookings: true,
      announcements: true,
      complaints: true,
      discussions: true,
      panic_button: true,
    },
  });

  // Validation and diagnostics state
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showValidator, setShowValidator] = useState(false);
  const [showTenantValidator, setShowTenantValidator] = useState(true);

  const text = {
    en: {
      title: "User Management",
      subtitle: "Manage system users and permissions",
      addUser: "Add User",
      search: "Search users...",
      role: "Role",
      status: "Status",
      allRoles: "All Roles",
      allStatus: "All Status",
      resident: "Resident",
      admin: "Administrator",
      security: "Security",
      maintenance: "Maintenance",
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      name: "Name",
      email: "Email",
      phone: "Phone",
      unit: "Unit",
      joinDate: "Join Date",
      actions: "Actions",
      createUser: "Create New User",
      createSubtitle: "Add a new user to the system",
      fullName: "Full Name",
      selectRole: "Select Role",
      selectStatus: "Select Status",
      create: "Create User",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      approve: "Approve",
      reject: "Reject",
      permissions: "Permissions",
      password: "Password",
      confirmPassword: "Confirm Password",
      passwordMismatch: "Passwords do not match",
      passwordRequired: "Password is required for new users",
      userCreated: "User created successfully!",
      userUpdated: "User updated successfully!",
      userDeleted: "User deleted successfully!",
      userApproved: "User approved successfully!",
      userRejected: "User rejected successfully!",
      // User details and tenant management
      userDetails: "User Details",
      householdMembers: "Household Members",
      addTenant: "Add Tenant",
      tenantName: "Tenant Name",
      tenantEmail: "Tenant Email",
      tenantPhone: "Tenant Phone",
      tenantPermissions: "Tenant Permissions",
      marketplace: "Marketplace",
      bookings: "Bookings",
      announcements: "Announcements",
      complaints: "Complaints",
      discussions: "Discussions",
      createTenant: "Create Tenant",
      tenantCreated: "Tenant account created successfully!",
      noHouseholdMembers: "No tenant registered",
      // Role-specific fields
      familySize: "Family Size",
      vehicleNumber: "Vehicle Number",
      emergencyContactName: "Emergency Contact Name",
      emergencyContactPhone: "Emergency Contact Phone",
      securityLicenseNumber: "Security License Number",
      badgeId: "Badge ID",
      shiftType: "Shift Type",
      specialization: "Specialization",
      yearsExperience: "Years of Experience",
      certificationsText: "Certifications",
    },
    ms: {
      title: "Pengurusan Pengguna",
      subtitle: "Urus pengguna sistem dan kebenaran",
      addUser: "Tambah Pengguna",
      search: "Cari pengguna...",
      role: "Peranan",
      status: "Status",
      allRoles: "Semua Peranan",
      allStatus: "Semua Status",
      resident: "Penduduk",
      admin: "Pentadbir",
      security: "Keselamatan",
      maintenance: "Penyelenggaraan",
      active: "Aktif",
      inactive: "Tidak Aktif",
      pending: "Menunggu",
      approved: "Diluluskan",
      rejected: "Ditolak",
      name: "Nama",
      email: "E-mel",
      phone: "Telefon",
      unit: "Unit",
      joinDate: "Tarikh Sertai",
      actions: "Tindakan",
      createUser: "Cipta Pengguna Baru",
      createSubtitle: "Tambah pengguna baru ke sistem",
      fullName: "Nama Penuh",
      selectRole: "Pilih Peranan",
      selectStatus: "Pilih Status",
      create: "Cipta Pengguna",
      cancel: "Batal",
      edit: "Edit",
      delete: "Padam",
      approve: "Luluskan",
      reject: "Tolak",
      permissions: "Kebenaran",
      password: "Kata Laluan",
      confirmPassword: "Sahkan Kata Laluan",
      passwordMismatch: "Kata laluan tidak sepadan",
      passwordRequired: "Kata laluan diperlukan untuk pengguna baru",
      userCreated: "Pengguna berjaya dicipta!",
      userUpdated: "Pengguna berjaya dikemaskini!",
      userDeleted: "Pengguna berjaya dipadam!",
      userApproved: "Pengguna berjaya diluluskan!",
      userRejected: "Pengguna berjaya ditolak!",
      // User details and tenant management
      userDetails: "Butiran Pengguna",
      householdMembers: "Ahli Rumah",
      addTenant: "Tambah Penyewa",
      tenantName: "Nama Penyewa",
      tenantEmail: "E-mel Penyewa",
      tenantPhone: "Telefon Penyewa",
      tenantPermissions: "Kebenaran Penyewa",
      marketplace: "Pasar",
      bookings: "Tempahan",
      announcements: "Pengumuman",
      complaints: "Aduan",
      discussions: "Perbincangan",
      createTenant: "Cipta Penyewa",
      tenantCreated: "Akaun penyewa berjaya dicipta!",
      noHouseholdMembers: "Tiada penyewa didaftarkan.",
      // Role-specific fields
      familySize: "Saiz Keluarga",
      vehicleNumber: "Nombor Kenderaan",
      emergencyContactName: "Nama Hubungan Kecemasan",
      emergencyContactPhone: "Telefon Hubungan Kecemasan",
      securityLicenseNumber: "Nombor Lesen Keselamatan",
      badgeId: "ID Lencana",
      shiftType: "Jenis Syif",
      specialization: "Kepakaran",
      yearsExperience: "Tahun Pengalaman",
      certificationsText: "Sijil-sijil",
    },
  };

  const t = text[language];

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole, selectedStatus]);

  // Fetch users from database
  useEffect(() => {
    fetchDistricts();
  }, []);

  // Load users function
  const loadUsers = useCallback(async () => {
    if (!rolesLoading && user?.id) {
      setLoading(true);
      try {
        const { users: fetchedUsers, totalCount } = await fetchUsers(
          currentPage,
          itemsPerPage,
          debouncedSearchTerm,
          selectedRole,
          selectedStatus
        );
        setUsers(fetchedUsers);
        setTotalUsers(totalCount);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [
    rolesLoading,
    user?.id,
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    selectedRole,
    selectedStatus,
    userRoles, // Add userRoles as dependency
  ]);

  // Fetch users after roles are loaded - only on initial load and when dependencies change
  useEffect(() => {
    console.log("UserManagement useEffect triggered:", {
      rolesLoading,
      userId: user?.id,
      isModalOperation,
      hasRole_community_admin: hasRole("community_admin"),
      hasRole_district_coordinator: hasRole("district_coordinator"),
      hasRole_state_admin: hasRole("state_admin"),
      userRoles: userRoles,
    });
    
    if (!rolesLoading && user?.id && !isModalOperation) {
      console.log("Fetching users with role filtering, user:", user);
      console.log("User authentication state:", {
        userId: user?.id,
        email: user?.email,
        activeCommunityId: user?.active_community_id,
        communityId: user?.community_id,
        district: user?.district,
        roles: { hasRole },
      });
      loadUsers();
    }
  }, [
    rolesLoading,
    user?.id,
    currentPage,
    debouncedSearchTerm,
    selectedRole,
    selectedStatus,
    isModalOperation,
    userRoles, // Add userRoles as dependency
  ]);

  const fetchUsers = async (
    page = 1,
    limit = itemsPerPage,
    searchQuery = "",
    roleFilter = "all",
    statusFilter = "all"
  ) => {
    try {
      console.log("fetchUsers called with params:", {
        page,
        limit,
        searchQuery,
        roleFilter,
        statusFilter,
        currentUserRoles: userRoles,
        hasRole_community_admin: hasRole("community_admin"),
        hasRole_district_coordinator: hasRole("district_coordinator"),
        hasRole_state_admin: hasRole("state_admin"),
        userInfo: user,
      });

      setLoading(true);

      // Build query with role-based filtering and pagination
      let query = supabase.from("profiles").select(
        `
          id,
          user_id,
          full_name,
          email,
          phone,
          unit_number,
          district_id,
          community_id,
          account_status,
          created_at
        `,
        { count: "exact" }
      );

      console.log("User roles check:", {
        isCommunityAdmin: hasRole("community_admin"),
        isDistrictCoordinator: hasRole("district_coordinator"),
        isStateAdmin: hasRole("state_admin"),
        userActiveCommunityId: user?.active_community_id,
        userCommunityId: user?.community_id,
        userDistrict: user?.district,
        allUserRoles: userRoles,
        userInfo: user,
      });

      // Apply role-based filtering
      console.log("About to apply role-based filtering...");
      
      // Check if user has community_admin role (but not higher roles)
      const isCommunityAdmin = userRoles.includes("community_admin");
      const isDistrictCoordinator = userRoles.includes("district_coordinator");
      const isStateAdmin = userRoles.includes("state_admin");
      
      console.log("Role check results:", {
        isCommunityAdmin,
        isDistrictCoordinator,
        isStateAdmin,
        userRoles,
      });
      
      // FORCE COMMUNITY FILTERING for communityadmin@test.com (Prima Pahang community)
      if (user?.email === "communityadmin@test.com") {
        console.log("FORCING PRIMA PAHANG COMMUNITY FILTER");
        query = query.eq("community_id", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
      } else if (isCommunityAdmin && !isDistrictCoordinator && !isStateAdmin) {
        // Use community_id from user profile since active_community_id is not set
        const communityId = user?.active_community_id || user?.community_id;
        console.log("COMMUNITY ADMIN PATH - communityId:", communityId);
        if (communityId) {
          console.log("Community admin - filtering by community_id:", communityId);
          query = query.eq("community_id", communityId);
        } else {
          console.log(
            "Community admin but no community_id found, showing no users"
          );
          query = query.eq("id", "00000000-0000-0000-0000-000000000000");
        }
      } else if (isDistrictCoordinator && !isStateAdmin) {
        // Use district_id from user profile
        const districtId = user?.district || user?.district_id;
        console.log("DISTRICT COORDINATOR PATH - districtId:", districtId);
        if (districtId) {
          console.log("District coordinator - filtering by district_id:", districtId);
          query = query.eq("district_id", districtId);
        } else {
          console.log(
            "District coordinator but no district info, showing no users"
          );
          query = query.eq("id", "00000000-0000-0000-0000-000000000000");
        }
      } else {
        console.log("STATE ADMIN OR NO ROLE PATH - no filtering applied");
      }

      // Apply search filter on server-side if provided
      if (searchQuery.trim()) {
        query = query.or(
          `full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,unit_number.ilike.%${searchQuery}%`
        );
      }

      // Apply status filter if not "all"
      if (statusFilter !== "all") {
        query = query.eq("account_status", statusFilter);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Order by created_at for consistent results
      query = query.order("created_at", { ascending: false });

      console.log("Final query will be executed");

      const { data: profiles, error: profilesError, count } = await query;

      console.log("Query results:", {
        profilesCount: profiles?.length || 0,
        totalCount: count,
        firstFewProfiles: profiles?.slice(0, 3).map(p => ({
          id: p.id,
          full_name: p.full_name,
          community_id: p.community_id,
          district_id: p.district_id
        }))
      });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
        return { users: [], totalCount: 0 };
      }

      // Get user roles separately for the current page users
      const userIds = profiles?.map((p) => p.id) || [];
      let roleMap = new Map();

      if (userIds.length > 0) {
        const { data: userRoles, error: rolesError } = await supabase
          .from("enhanced_user_roles")
          .select("user_id, role")
          .eq("is_active", true)
          .in("user_id", userIds);

        if (!rolesError && userRoles) {
          userRoles.forEach((ur) => {
            if (!roleMap.has(ur.user_id)) {
              roleMap.set(ur.user_id, []);
            }
            roleMap.get(ur.user_id).push(ur.role);
          });
        }
      }

      const formattedUsers: User[] = (profiles || []).map((profile) => ({
        id: profile.user_id, // auth user id
        profileId: profile.id,
        name: profile.full_name || "Unknown User",
        email: profile.email || "",
        phone: profile.phone || "",
        unit: profile.unit_number || "",
        // enhanced_user_roles.user_id references profiles.id
        role: roleMap.get(profile.id)?.[0] || "resident",
        status: (profile.account_status || "pending") as User["status"],
        joinDate: profile.created_at
          ? new Date(profile.created_at).toISOString().slice(0, 10)
          : "",
        district_id: profile.district_id || "",
        community_id: profile.community_id || "",
      }));

      // Apply role filter client-side since it's complex to do server-side
      const finalUsers =
        roleFilter === "all"
          ? formattedUsers
          : formattedUsers.filter((user) => user.role === roleFilter);

      return { users: finalUsers, totalCount: count || 0 };
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
      return { users: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    const { data, error } = await supabase.from("districts").select("id, name");
    if (data) {
      setDistricts(data);
    }
  };

  const fetchCommunities = async (districtId: string) => {
    const { data, error } = await supabase
      .from("communities")
      .select("id, name")
      .eq("district_id", districtId);
    if (data) {
      setCommunities(data);
    }
  };

  useEffect(() => {
    if (form.district_id) {
      fetchCommunities(form.district_id);
    }
  }, [form.district_id]);

  const roles = useMemo(
    () => [
      { value: "all", label: t.allRoles },
      { value: "resident", label: t.resident },
      { value: "guest", label: "Guest" },
      ...(isModuleEnabled("security")
        ? [{ value: "security_officer", label: t.security }]
        : []),
      ...(isModuleEnabled("facilities")
        ? [
            { value: "facility_manager", label: "Facility Manager" },
            { value: "maintenance_staff", label: t.maintenance },
          ]
        : []),
    ],
    [t, isModuleEnabled]
  );

  const statuses = useMemo(
    () => [
      { value: "all", label: t.allStatus },
      { value: "pending", label: t.pending },
      { value: "approved", label: t.approved },
      { value: "rejected", label: t.rejected },
      { value: "active", label: t.active },
      { value: "inactive", label: t.inactive },
    ],
    [t]
  );

  const getRoleColor = useCallback((role: string) => {
    switch (role) {
      case "state_admin":
        return "bg-purple-100 text-purple-800";
      case "community_admin":
        return "bg-purple-50 text-purple-700";
      case "district_coordinator":
        return "bg-indigo-100 text-indigo-800";
      case "security_officer":
        return "bg-blue-100 text-blue-800";
      case "maintenance_staff":
        return "bg-orange-100 text-orange-800";
      case "service_provider":
        return "bg-cyan-100 text-cyan-800";
      case "community_leader":
        return "bg-emerald-100 text-emerald-800";
      case "resident":
        return "bg-green-100 text-green-800";
      case "guest":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const getRoleText = useCallback(
    (role: string) => {
      switch (role) {
        case "state_admin":
          return t.admin;
        case "community_admin":
          return "Community Admin";
        case "district_coordinator":
          return "District Coordinator";
        case "security_officer":
          return t.security;
        case "maintenance_staff":
          return t.maintenance;
        case "service_provider":
          return "Service Provider";
        case "community_leader":
          return "Community Leader";
        case "resident":
          return t.resident;
        case "guest":
          return "Guest";
        default:
          return role
            .replace("_", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
      }
    },
    [t]
  );

  const getStatusText = useCallback(
    (status: string) => {
      switch (status) {
        case "active":
          return t.active;
        case "inactive":
          return t.inactive;
        case "pending":
          return t.pending;
        case "approved":
          return t.approved;
        case "rejected":
          return t.rejected;
        default:
          return status;
      }
    },
    [t]
  );

  // Since we're using server-side pagination, we work directly with users
  const filteredUsers = users; // All filtering is done server-side now
  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const paginatedUsers = users; // Users are already paginated from server

  // Display info
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalUsers);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of user list
    const userListElement = document.getElementById("user-list");
    if (userListElement) {
      userListElement.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, handlePageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, handlePageChange]);

  // Optimized search handler to prevent excessive API calls
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Optimized filter handlers
  const handleRoleFilterChange = useCallback((value: string) => {
    setSelectedRole(value);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setSelectedStatus(value);
  }, []);

  // Reset role-specific fields when role changes
  const handleRoleChange = (newRole: string) => {
    setForm((prev) => ({
      ...prev,
      role: newRole,
      unit: newRole === "resident" ? prev.unit : "",
      // Reset all role-specific fields
      emergencyContactName: "",
      emergencyContactPhone: "",
      shiftType: "",
      badgeId: "",
      yearsExperience: "",
      certificationsText: "",
      vehicleNumber: "",
      familySize: 1,
      specialization: "",
    }));
  };

  const handleCreateUser = async () => {
    if (!form.name || !form.email || !form.role || !form.phone) {
      toast({
        title: t.createUser,
        description: "Please fill all required fields including phone number.",
      });
      return;
    }

    // Validate phone number
    const phoneValidation = validateMalaysianPhone(form.phone, true, language);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || "Invalid phone number");
      toast({
        title: t.createUser,
        description: phoneValidation.error,
      });
      return;
    }

    // Validate emergency contact phone if provided
    if (form.emergencyContactPhone) {
      const emergencyPhoneValidation = validateMalaysianPhone(form.emergencyContactPhone, false, language);
      if (!emergencyPhoneValidation.isValid) {
        setEmergencyPhoneError(emergencyPhoneValidation.error || "Invalid emergency contact phone number");
        toast({
          title: t.createUser,
          description: emergencyPhoneValidation.error,
        });
        return;
      }
    }

    // Check if the selected role is allowed based on enabled modules
    if (form.role === "security_officer" && !isModuleEnabled("security")) {
      toast({
        title: "Error",
        description:
          "Security module is disabled. Cannot create Security Officer accounts.",
        variant: "destructive",
      });
      return;
    }

    if (
      (form.role === "facility_manager" || form.role === "maintenance_staff") &&
      !isModuleEnabled("facilities")
    ) {
      toast({
        title: "Error",
        description:
          "Facilities module is disabled. Cannot create Facility Manager or Maintenance Staff accounts.",
        variant: "destructive",
      });
      return;
    }

    // For residents and guests, no password or status required
    // Residents use invite flow, guests get temporary passwords from backend
    // For other roles, password validation is still required
    if (!editingId && form.role !== "resident" && form.role !== "guest") {
      if (!form.password) {
        toast({
          title: "Error",
          description: t.passwordRequired,
          variant: "destructive",
        });
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast({
          title: "Error",
          description: t.passwordMismatch,
          variant: "destructive",
        });
        return;
      }
      if (form.password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }
    }

    // For staff roles (not residents or guests), status is required
    if (form.role !== "resident" && form.role !== "guest" && !form.status) {
      toast({
        title: t.createUser,
        description: "Please select account status.",
      });
      return;
    }

    // For tenants (guest role), expiration date is required
    if (form.role === "guest" && !form.access_expires_at) {
      toast({
        title: "Error",
        description: "Please select an expiration date for tenant access.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);

      if (editingId) {
        // Update existing user
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: form.name,
            phone: form.phone,
            unit_number: form.unit,
            account_status: form.status,
          })
          .eq("user_id", editingId);

        if (profileError) throw profileError;

        // Update user role - use upsert to handle existing roles
        const { error: roleError } = await supabase
          .from("enhanced_user_roles")
          .upsert(
            {
              user_id: editingId,
              role: form.role as any,
              is_active: true,
              assigned_by: user?.id,
              assigned_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,role",
            }
          );

        if (roleError) throw roleError;

        toast({ title: t.userUpdated });
      } else {
        // Validate role before proceeding
        if (!isRoleSupported(form.role)) {
          toast({
            title: "Error",
            description: `Role "${form.role}" is not supported for user creation.`,
            variant: "destructive",
          });
          return;
        }

        // Validate user data for the specific role
        const validationErrors = validateUserDataForRole(form.role, {
          email: form.email,
          full_name: form.name,
          phone: form.phone,
          password: form.password,
          unit_number: form.unit,
          access_expires_at: form.access_expires_at,
          district_id: form.district_id,
          community_id: form.community_id,
          status: form.status,
        });

        if (validationErrors.length > 0) {
          const errorMessages = validationErrors
            .map((err) => err.message)
            .join(", ");
          toast({
            title: "Validation Error",
            description: errorMessages,
            variant: "destructive",
          });
          console.error("Role validation errors:", validationErrors);
          return;
        }

        console.log(`Creating ${form.role} user:`, {
          email: form.email,
          full_name: form.name,
          role: form.role,
        });

        // Apply role defaults
        const roleDefaults = getRoleDefaults(form.role);

        // Create new user using edge function
        const requestBody: any = {
          email: form.email,
          full_name: form.name,
          phone: form.phone,
          role: form.role,
          ...roleDefaults, // Apply role-specific defaults
        };

        // Only include password and status for non-residents and non-guests
        if (form.role !== "resident" && form.role !== "guest") {
          if (form.password && form.password.length >= 8) {
            requestBody.password = form.password;
          }
          requestBody.status = form.status;
        }

        // Add unit for residents
        if (form.role === "resident" && form.unit) {
          requestBody.unit_number = form.unit;
        }

        // Add expiration date for guests
        if (form.role === "guest" && form.access_expires_at) {
          requestBody.access_expires_at = form.access_expires_at;
        }

        // Add district and community IDs (from form or fallback to admin scope)
        if (form.district_id) {
          requestBody.district_id = form.district_id;
        } else if (user?.district) {
          requestBody.district_id = user.district as any;
        }
        if (form.community_id) {
          requestBody.community_id = form.community_id;
        } else if (user?.active_community_id) {
          requestBody.community_id = user.active_community_id as any;
        }

        try {
          const functionName = getRoleSpecificFunction(form.role);
          console.log(`Calling ${functionName} with payload:`, requestBody);

          // Add timeout to prevent hanging
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Request timed out after 30 seconds")),
              30000
            )
          );

          const functionPromise = supabase.functions.invoke(functionName, {
            body: requestBody,
          });

          const result = await Promise.race([functionPromise, timeoutPromise]);
          const { data, error } = result;

          if (error) {
            console.error(`Error from ${functionName}:`, error);
            throw error;
          }

          // Check for errors in response body even with 2xx status
          if (data?.error || data?.success === false) {
            console.error(`Error in response body from ${functionName}:`, data);
            throw new Error(data.error || "Function returned error response");
          }

          console.log(`Successfully created ${form.role} user:`, data);
          toast({
            title: t.userCreated,
            description: `${form.role
              .replace("_", " ")
              .replace(/\b\w/g, (l) =>
                l.toUpperCase()
              )} account created successfully.`,
          });
        } catch (error: any) {
          console.error("User creation error:", error);

          // Provide specific error messages based on common issues
          let errorMessage = "Failed to create user account";

          if (error.message?.includes("already exists")) {
            errorMessage = "A user with this email already exists";
          } else if (error.message?.includes("permission")) {
            errorMessage =
              "You don't have permission to create this type of account";
          } else if (error.message?.includes("module")) {
            errorMessage = "Required module is not enabled for this community";
          } else if (error.message) {
            errorMessage = error.message;
          }

          toast({
            title: "Account Creation Failed",
            description: errorMessage,
            variant: "destructive",
          });
          throw error;
        }
      }

      setIsCreateOpen(false);
      setEditingId(null);
      setForm({
        name: "",
        email: "",
        phone: "",
        unit: "",
        role: "resident",
        status: "",
        password: "",
        confirmPassword: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        shiftType: "",
        badgeId: "",
        yearsExperience: "",
        certificationsText: "",
        vehicleNumber: "",
        familySize: 1,
        specialization: "",
        access_expires_at: "",
      });

      // Reload users after successful operation
      setIsModalOperation(false); // Allow refetch
      await loadUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save user changes",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (user: User) => {
    // Save current scroll position
    setScrollPosition(window.scrollY);
    setIsModalOperation(true); // Prevent refetch during modal operations
    setEditingId(user.id);
    fetchTenantHost(user.profileId);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      unit: user.unit,
      role: user.role,
      status: user.status,
      password: "",
      confirmPassword: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      shiftType: "",
      badgeId: "",
      yearsExperience: "",
      certificationsText: "",
      vehicleNumber: "",
      familySize: 1,
      specialization: "",
    });
    setIsCreateOpen(true);
    // Reset flag after a short delay to allow modal to open
    setTimeout(() => setIsModalOperation(false), 100);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this user? This action cannot be undone.")) {
      try {
        // Delete user from Supabase auth (admin)
        const result = await adminDeleteUser(id);
        if (!result.success)
          throw new Error(result.message || "Failed to delete user from auth");

        // Clean up user roles (optional, for DB consistency)
        await supabase.from("user_roles").delete().eq("user_id", id);

        // Clean up enhanced_user_roles (optional, for DB consistency)
        await supabase.from("enhanced_user_roles").delete().eq("user_id", id);

        // Clean up profile (optional, for DB consistency)
        await supabase.from("profiles").delete().eq("user_id", id);

        toast({ title: t.userDeleted });
        await loadUsers(); // Refresh the list
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      }
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: "approved" })
        .eq("id", id);

      if (error) throw error;

      toast({ title: t.userApproved });
      await loadUsers(); // Refresh the list
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      toast({ title: t.userRejected });
      await loadUsers(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
    }
  };

  // Fetch household accounts for a user
  const fetchHouseholdAccounts = async (userId: string) => {
    try {
      setIsLoadingHousehold(true);

      // Get the auth header
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const ts = Date.now();
      const response = await fetch(
        `https://hjhalygcsdolryngmlry.supabase.co/functions/v1/admin-household?host_user_id=${userId}&ts=${ts}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaGFseWdjc2RvbHJ5bmdtbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODYwNDYsImV4cCI6MjA3MTA2MjA0Nn0.xfJ_IHy-Pw1iiKFbKxHxGe93wgKu26PtW8QCtzj34cI",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let msg = `HTTP error! status: ${response.status}`;
        try {
          const err = await response.json();
          if (err?.error) msg += ` - ${err.error}`;
        } catch {}
        throw new Error(msg);
      }

      const result = await response.json();
      setHouseholdAccounts(result?.data || []);
    } catch (error) {
      console.error("Error fetching household accounts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch household accounts",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHousehold(false);
    }
  };

  // Handle resend invitation
  const handleResendInvitation = async (userId: string, userEmail: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "resend-invitation",
        {
          body: {
            user_id: userId,
          },
        }
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Invitation Sent",
        description: `Invitation has been resent to ${userEmail}`,
      });
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  // Handle user row click
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
    fetchHouseholdAccounts(user.profileId);
    // If the selected user is a tenant, fetch the host resident info
    fetchTenantHost(user.profileId);
  };

  const fetchTenantHost = async (tenantProfileId: string) => {
    try {
      setTenantHost(null);
      const { data: ha, error: haErr } = await supabase
        .from('household_accounts')
        .select('primary_account_id')
        .eq('linked_account_id', tenantProfileId)
        .eq('relationship_type', 'tenant')
        .eq('is_active', true)
        .maybeSingle();
      if (haErr || !ha?.primary_account_id) return;

      const { data: host, error: hostErr } = await supabase
        .from('profiles')
        .select('id, full_name, email, unit_number')
        .eq('id', ha.primary_account_id)
        .single();
      if (!hostErr && host) {
        setTenantHost({ id: host.id, full_name: host.full_name || 'Resident', email: host.email || '', unit_number: host.unit_number || undefined });
      }
    } catch (e) {
      // best-effort only
    }
  };

  // Handle create tenant (guest)
  const handleCreateTenant = async () => {
    if (
      !selectedUser ||
      !tenantForm.tenant_name ||
      !tenantForm.tenant_email ||
      !tenantForm.access_expires_at
    ) {
      toast({
        title: "Error",
        description:
          "Please fill in all required fields including expiration date",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingTenant(true);

      // Preflight: check if a user with this email already exists
      const { data: existingProfile, error: existingProfileError } = await supabase
        .from('profiles')
        .select('id, user_id, district_id, community_id')
        .eq('email', tenantForm.tenant_email)
        .maybeSingle();

      if (existingProfileError) {
        console.warn('Preflight lookup failed, proceeding to create:', existingProfileError);
      }

      if (existingProfile?.user_id) {
        // Check roles for the existing user
        const { data: existingRoles } = await supabase
          .from('enhanced_user_roles')
          .select('role, is_active')
          .eq('user_id', existingProfile.user_id)
          .eq('is_active', true);

        const hasResident = !!existingRoles?.some(r => r.role === 'resident');
        const hasGuest = !!existingRoles?.some(r => r.role === 'guest');

        // If currently resident, ask to convert to tenant
        if (hasResident) {
          const proceed = window.confirm(
            'This email belongs to an existing resident. Convert to tenant (remove resident role) and link to this household?'
          );
          if (!proceed) {
            toast({ title: 'Cancelled', description: 'No changes were made.' });
            setIsCreatingTenant(false);
            return;
          }

          await supabase
            .from('enhanced_user_roles')
            .update({ is_active: false })
            .eq('user_id', existingProfile.user_id)
            .eq('role', 'resident');
        }

        // Ensure guest role is active
        if (!hasGuest) {
          await supabase
            .from('enhanced_user_roles')
            .upsert(
              {
                user_id: existingProfile.user_id,
                role: 'guest',
                is_active: true,
                assigned_by: user?.id,
                assigned_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,role' }
            );
        }

        // Update profile expiry and copy scope if missing
        await supabase
          .from('profiles')
          .update({
            access_expires_at: tenantForm.access_expires_at,
            district_id: existingProfile.district_id || selectedUser.district_id,
            community_id: existingProfile.community_id || selectedUser.community_id,
            full_name: tenantForm.tenant_name,
            phone: tenantForm.tenant_phone,
          })
          .eq('user_id', existingProfile.user_id);

        // Ensure household link
        const { data: link } = await supabase
          .from('household_accounts')
          .select('id, is_active')
          .eq('primary_account_id', selectedUser.profileId)
          .eq('linked_account_id', existingProfile.id)
          .eq('relationship_type', 'tenant')
          .maybeSingle();

        if (link?.id) {
          if (link.is_active === false) {
            await supabase
              .from('household_accounts')
              .update({ is_active: true })
              .eq('id', link.id);
          }
        } else {
          await supabase
            .from('household_accounts')
            .insert({
              primary_account_id: selectedUser.profileId,
              linked_account_id: existingProfile.id,
              relationship_type: 'tenant',
              permissions: {
                marketplace: !!tenantForm.permissions.marketplace,
                bookings: !!tenantForm.permissions.bookings,
                announcements: !!tenantForm.permissions.announcements,
                complaints: !!tenantForm.permissions.complaints,
                discussions: !!tenantForm.permissions.discussions,
              },
              created_by: user?.id,
            });
        }

        toast({ title: 'Tenant Linked', description: 'Existing user converted/assigned as tenant and linked.' });

        // Reset and refresh
        setTenantForm({
          tenant_name: '',
          tenant_email: '',
          tenant_phone: '',
          access_expires_at: '',
          permissions: {
            marketplace: true,
            bookings: true,
            announcements: true,
            complaints: true,
            discussions: true,
            panic_button: true,
          },
        });
        setIsAddTenantOpen(false);
        fetchHouseholdAccounts(selectedUser.profileId);
        return;
      }

      // Call admin-create-guest to create the tenant user
      const { data, error } = await supabase.functions.invoke(
        "admin-create-guest",
        {
          body: {
            email: tenantForm.tenant_email,
            full_name: tenantForm.tenant_name,
            phone: tenantForm.tenant_phone,
            access_expires_at: tenantForm.access_expires_at,
            // Use the selected user's district and community info
            district_id: selectedUser.district_id,
            community_id: selectedUser.community_id,
          },
        }
      );

      if (error) throw error;

      // Check for errors in response body even with 2xx status
      if (data?.error || data?.success === false) {
        console.error('Error in response body from admin-create-guest:', data);
        throw new Error(data.error || "Function returned error response");
      }

      // Try to resolve the newly created tenant's auth id via their email
      const { data: createdProfile, error: profileLookupError } = await supabase
        .from('profiles')
        .select('user_id, id')
        .eq('email', tenantForm.tenant_email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (profileLookupError) {
        console.warn('Could not look up tenant profile after creation:', profileLookupError);
      }

      if (createdProfile?.user_id && selectedUser) {
        // Assign tenant unit from host resident, regardless of link success
        if (selectedUser.unit) {
          await supabase
            .from('profiles')
            .update({ unit_number: selectedUser.unit })
            .eq('user_id', createdProfile.user_id);
        }
        // Create household link to selected resident (use profile IDs)
        const { error: householdError } = await supabase
          .from('household_accounts')
          .insert({
            primary_account_id: selectedUser.profileId, // host profile id
            linked_account_id: createdProfile.id, // tenant profile id
            relationship_type: 'tenant',
            permissions: {
              marketplace: !!tenantForm.permissions.marketplace,
              bookings: !!tenantForm.permissions.bookings,
              announcements: !!tenantForm.permissions.announcements,
              complaints: !!tenantForm.permissions.complaints,
              discussions: !!tenantForm.permissions.discussions,
            },
            created_by: selectedUser.profileId,
          });

        if (householdError) {
          console.error('Failed to create household tenant link:', householdError);
          throw new Error('Tenant was created but linking to resident failed');
        }

        // Unit already assigned above
      }

      toast({
        title: "Tenant Created Successfully",
        description:
          language === "en"
            ? "Tenant account created and linked to resident."
            : "Akaun penyewa dicipta dan dipautkan kepada penduduk.",
      });

      // Reset form and close modal
      setTenantForm({
        tenant_name: "",
        tenant_email: "",
        tenant_phone: "",
        access_expires_at: "",
        permissions: {
          marketplace: true,
          bookings: true,
          announcements: true,
          complaints: true,
          discussions: true,
          panic_button: true,
        },
      });
      setIsAddTenantOpen(false);

      // Refresh household accounts
      if (selectedUser) {
        fetchHouseholdAccounts(selectedUser.profileId);
      }
    } catch (error: any) {
      console.error("Error creating tenant:", error);

      const msg = String(error?.message || "").toLowerCase();
      const conflict = msg.includes("cannot assign guest role") || msg.includes("already has resident role");

      if (conflict) {
        try {
          // Find existing user by email
          const { data: existingProfile, error: existingErr } = await supabase
            .from('profiles')
            .select('id, user_id')
            .eq('email', tenantForm.tenant_email)
            .maybeSingle();

          if (existingErr || !existingProfile?.user_id) {
            throw new Error('Found conflicting resident but could not resolve the account');
          }

          const proceed = window.confirm(
            'This email belongs to an existing resident. Convert to tenant (remove resident role) and link to this household?'
          );
          if (!proceed) {
            toast({ title: 'Cancelled', description: 'No changes were made.' });
            return;
          }

          // Deactivate resident role
          await supabase
            .from('enhanced_user_roles')
            .update({ is_active: false })
            .eq('user_id', existingProfile.user_id)
            .eq('role', 'resident');

          // Assign guest role
          await supabase
            .from('enhanced_user_roles')
            .upsert(
              {
                user_id: existingProfile.user_id,
                role: 'guest',
                is_active: true,
                assigned_by: user?.id,
                assigned_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,role' }
            );

          // Update access expiry on profile
          await supabase
            .from('profiles')
            .update({ 
              access_expires_at: tenantForm.access_expires_at,
              unit_number: selectedUser?.unit || null
            })
            .eq('user_id', existingProfile.user_id);

          // Link household (create or reactivate)
          // Assign unit from host before linking
          if (selectedUser?.unit) {
            await supabase
              .from('profiles')
              .update({ unit_number: selectedUser.unit })
              .eq('user_id', existingProfile.user_id);
          }

          const { data: existingLink } = await supabase
            .from('household_accounts')
            .select('id, is_active')
            .eq('primary_account_id', selectedUser!.profileId)
            .eq('linked_account_id', existingProfile.id)
            .eq('relationship_type', 'tenant')
            .maybeSingle();

          if (existingLink?.id) {
            if (existingLink.is_active === false) {
              await supabase
                .from('household_accounts')
                .update({ is_active: true })
                .eq('id', existingLink.id);
            }
          } else {
            await supabase
              .from('household_accounts')
              .insert({
                primary_account_id: selectedUser!.profileId,
                linked_account_id: existingProfile.id,
                relationship_type: 'tenant',
                permissions: {
                  marketplace: !!tenantForm.permissions.marketplace,
                  bookings: !!tenantForm.permissions.bookings,
                  announcements: !!tenantForm.permissions.announcements,
                  complaints: !!tenantForm.permissions.complaints,
                  discussions: !!tenantForm.permissions.discussions,
                },
                created_by: selectedUser!.profileId,
              });
          }

          toast({
            title: 'Tenant Linked',
            description: 'Converted resident to tenant and linked to the household.',
          });

          // Reset form, close modal and refresh
          setTenantForm({
            tenant_name: "",
            tenant_email: "",
            tenant_phone: "",
            access_expires_at: "",
            permissions: {
              marketplace: true,
              bookings: true,
              announcements: true,
              complaints: true,
              discussions: true,
              panic_button: true,
            },
          });
          setIsAddTenantOpen(false);
          fetchHouseholdAccounts(selectedUser!.profileId);
          return;
        } catch (fallbackErr: any) {
          console.error('Tenant conversion/link fallback failed:', fallbackErr);
          toast({
            title: 'Conversion Failed',
            description: fallbackErr.message || 'Could not convert resident to tenant',
            variant: 'destructive',
          });
        }
      }

      // Default error handling
      toast({
        title: "Error",
        description: error?.message || "Failed to create tenant account",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTenant(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
          >
            {showDiagnostics ? "Hide" : "Show"} Diagnostics
          </Button>
          {(hasRole('community_admin') || hasRole('district_coordinator') || hasRole('state_admin')) && (
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) throw new Error('No session');
                  const resp = await fetch(`https://hjhalygcsdolryngmlry.supabase.co/functions/v1/admin-repair-household`, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${session.access_token}`,
                      apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaGFseWdjc2RvbHJ5bmdtbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODYwNDYsImV4cCI6MjA3MTA2MjA0Nn0.xfJ_IHy-Pw1iiKFbKxHxGe93wgKu26PtW8QCtzj34cI',
                      'Content-Type': 'application/json'
                    }
                  });
                  const result = await resp.json();
                  if (!resp.ok) throw new Error(result?.error || 'Repair failed');
                  toast({ title: 'Repair complete', description: `IDs fixed: ${result.updatedIds}, Duplicates removed: ${result.deletedDup}, Units backfilled: ${result.unitUpdated}` });
                  // Refresh current lists
                  fetchUsers();
                  if (selectedUser) fetchHouseholdAccounts(selectedUser.profileId);
                } catch (e: any) {
                  toast({ title: 'Repair failed', description: e.message || 'Unknown error', variant: 'destructive' });
                }
              }}
            >
              Repair Household Links
            </Button>
          )}
        </div>
      </div>

      {/* Diagnostics Panel */}
      {showDiagnostics && (
        <AdminDiagnostics onScopeFixed={() => setShowDiagnostics(false)} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsModalOperation(true); // Prevent refetch during modal close
              // Restore scroll position after modal closes
              setTimeout(() => {
                window.scrollTo(0, scrollPosition);
                setIsModalOperation(false);
              }, 100);
            }
            setIsCreateOpen(open);
            if (!open) {
              setEditingId(null);
              setForm({
                name: "",
                email: "",
                phone: "",
                unit: "",
                role: "resident",
                status: "pending",
                password: "",
                confirmPassword: "",
                emergencyContactName: "",
                emergencyContactPhone: "",
                shiftType: "",
                badgeId: "",
                yearsExperience: "",
                certificationsText: "",
                vehicleNumber: "",
                familySize: 1,
                specialization: "",
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              {editingId ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  {t.edit}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t.addUser}
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? t.edit : t.createUser}</DialogTitle>
              <DialogDescription>{editingId ? t.userDetails : t.createSubtitle}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Validation Panel - only for creating new users */}
              {!editingId && (
                <CreateUserValidator
                  formData={{
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    unit: form.unit,
                    role: form.role,
                    status: form.status,
                    district_id: form.district_id,
                    community_id: form.community_id,
                    password: form.password,
                    confirmPassword: form.confirmPassword,
                    access_expires_at: form.access_expires_at,
                  }}
                  isVisible={showValidator}
                  onToggleVisibility={() => setShowValidator(!showValidator)}
                />
              )}

              {/* Role Selection - hide when editing a tenant */}
              {!(editingId && form.role === 'guest') && (
                <div className="space-y-2">
                  <Label htmlFor="role">{t.role} *</Label>
                  <Select
                    value={form.role || "resident"}
                    onValueChange={handleRoleChange}
                    disabled={!!editingId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectRole} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.slice(1).map((role) => {
                        const isDisabled =
                          (role.value === "security_officer" &&
                            !isModuleEnabled("security")) ||
                          ((role.value === "facility_manager" ||
                            role.value === "maintenance_staff") &&
                            !isModuleEnabled("facilities"));

                        return (
                          <SelectItem
                            key={role.value}
                            value={role.value}
                            disabled={isDisabled}
                          >
                            {role.label}
                            {isDisabled && (
                              <span className="text-xs text-muted-foreground ml-2">
                                (Module disabled)
                              </span>
                            )}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Simplified form for residents, full form for other roles */}
              {form.role === "resident" || !form.role ? (
                <>
                  {/* Basic Information for Residents */}
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {language === "en"
                          ? "Creating New Resident"
                          : "Mencipta Penduduk Baru"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language === "en"
                        ? "Residents will receive an email invitation to complete their account setup."
                        : "Penduduk akan menerima jemputan emel untuk melengkapkan persediaan akaun mereka."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.fullName} *</Label>
                      <Input
                        id="name"
                        placeholder={t.fullName}
                        value={form.name}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.email} *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t.email}
                        value={form.email}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        disabled={!!editingId}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit">{t.unit} *</Label>
                      <Input
                        id="unit"
                        placeholder={
                          language === "en" ? "e.g. A-15-03" : "cth: A-15-03"
                        }
                        value={form.unit}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, unit: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-1">
                        {t.phone} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        placeholder={
                          language === "en"
                            ? "e.g. 012-3456789"
                            : "cth: 012-3456789"
                        }
                        value={form.phone}
                        onChange={(e) => {
                          const filteredValue = handlePhoneInput(e.target.value);
                          setForm((prev) => ({
                            ...prev,
                            phone: filteredValue,
                          }));
                          // Clear error when user starts typing
                          if (phoneError) setPhoneError("");
                          // Validate in real-time
                          const validation = validateMalaysianPhone(filteredValue, true, language);
                          if (!validation.isValid && filteredValue) {
                            setPhoneError(validation.error || "");
                          }
                        }}
                        className={phoneError ? "border-destructive" : ""}
                      />
                      {phoneError && (
                        <p className="text-sm text-destructive">{phoneError}</p>
                      )}
                    </div>
                  </div>
                </>
              ) : form.role === "guest" ? (
                <>
                  {/* Tenant-specific form (guest role) */}
                  <div className="space-y-3 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        {language === "en" ? "Creating New Tenant" : "Mencipta Penyewa Baru"}
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      {language === "en"
                        ? "Tenant accounts include limited access with an expiration date."
                        : "Akaun penyewa mempunyai akses terhad dengan tarikh luput."}
                    </p>
                    {editingId && tenantHost && (
                      <div className="mt-2 p-2 bg-yellow-100 border border-yellow-200 rounded text-xs text-yellow-900 flex items-center justify-between">
                        <div>
                          {language === 'en' ? 'Belongs to: ' : 'Di bawah: '}
                          <strong>{tenantHost.full_name}</strong>
                          {tenantHost.unit_number ? ` • Unit ${tenantHost.unit_number}` : ''}
                        </div>
                        <Button variant="link" size="sm" onClick={goToResident} className="text-yellow-900">
                          {language === 'en' ? 'Go to resident' : 'Lihat penduduk'}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.fullName} *</Label>
                      <Input
                        id="name"
                        placeholder={t.fullName}
                        value={form.name}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.email} *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t.email}
                        value={form.email}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        disabled={!!editingId}
                      />
                    </div>
                  </div>

                  {/* Tenant-specific fields */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Unit - readonly from host */}
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="tenantUnit">{t.unit}</Label>
                      <Input
                        id="tenantUnit"
                        value={tenantHost?.unit_number || form.unit || ''}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="access_expires_at">
                        Access Expires *
                      </Label>
                      <Input
                        id="access_expires_at"
                        type="date"
                        value={form.access_expires_at}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            access_expires_at: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-1">
                        {t.phone} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        placeholder={
                          language === "en"
                            ? "e.g. 012-3456789"
                            : "cth: 012-3456789"
                        }
                        value={form.phone}
                        onChange={(e) => {
                          const filteredValue = handlePhoneInput(e.target.value);
                          setForm((prev) => ({
                            ...prev,
                            phone: filteredValue,
                          }));
                          // Clear error when user starts typing
                          if (phoneError) setPhoneError("");
                          // Validate in real-time
                          const validation = validateMalaysianPhone(filteredValue, true, language);
                          if (!validation.isValid && filteredValue) {
                            setPhoneError(validation.error || "");
                          }
                        }}
                        className={phoneError ? "border-destructive" : ""}
                      />
                      {phoneError && (
                        <p className="text-sm text-destructive">{phoneError}</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Full form for staff roles */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.fullName} *</Label>
                      <Input
                        id="name"
                        placeholder={t.fullName}
                        value={form.name}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.email} *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t.email}
                        value={form.email}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        disabled={!!editingId}
                      />
                    </div>
                  </div>

                  {/* Password fields for staff roles only (not guests) */}
                  {!editingId && form.role !== "guest" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">{t.password} *</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder={t.password}
                          value={form.password}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          {t.confirmPassword} *
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder={t.confirmPassword}
                          value={form.confirmPassword}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}

                  {form.role !== 'guest' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <Select
                        value={form.district_id}
                        onValueChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            district_id: value,
                            community_id: "",
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="community">Community *</Label>
                      <Select
                        value={form.community_id}
                        onValueChange={(value) =>
                          setForm((prev) => ({ ...prev, community_id: value }))
                        }
                        disabled={!form.district_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select community" />
                        </SelectTrigger>
                        <SelectContent>
                          {communities.map((community) => (
                            <SelectItem key={community.id} value={community.id}>
                              {community.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {form.role === "resident" && (
                      <div className="space-y-2">
                        <Label htmlFor="unit">{t.unit}</Label>
                        <Input
                          id="unit"
                          placeholder={t.unit}
                          value={form.unit}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              unit: e.target.value,
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {form.role !== 'guest' && (
                      <div className="space-y-2">
                        <Label htmlFor="role">{t.role}</Label>
                        <Select
                          value={form.role}
                          onValueChange={handleRoleChange}
                          disabled={!!editingId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectRole} />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.slice(1).map((role) => {
                              const isDisabled =
                                (role.value === "security_officer" &&
                                  !isModuleEnabled("security")) ||
                                ((role.value === "facility_manager" ||
                                  role.value === "maintenance_staff") &&
                                  !isModuleEnabled("facilities"));

                              return (
                                <SelectItem
                                  key={role.value}
                                  value={role.value}
                                  disabled={isDisabled}
                                >
                                  {role.label}
                                  {isDisabled && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                      (Module disabled)
                                    </span>
                                  )}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {/* Status field for staff roles only (not residents or guests) */}
                    {form.role !== "resident" && form.role !== "guest" && (
                      <div className="space-y-2">
                        <Label htmlFor="status">{t.status}</Label>
                        <Select
                          value={form.status}
                          onValueChange={(v) =>
                            setForm((prev) => ({
                              ...prev,
                              status: v as User["status"],
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectStatus} />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.slice(1).map((status) => (
                              <SelectItem
                                key={status.value}
                                value={status.value}
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Role-specific fields */}
              {form.role === "resident" && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-semibold">
                    {language === "en"
                      ? "Resident Details"
                      : "Butiran Penduduk"}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="familySize">{t.familySize}</Label>
                      <Input
                        id="familySize"
                        type="number"
                        min="1"
                        value={form.familySize || 1}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            familySize: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleNumber">{t.vehicleNumber}</Label>
                      <Input
                        id="vehicleNumber"
                        placeholder={
                          language === "en" ? "e.g. ABC 1234" : "cth: ABC 1234"
                        }
                        value={form.vehicleNumber || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            vehicleNumber: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">
                        {t.emergencyContactName}
                      </Label>
                      <Input
                        id="emergencyContactName"
                        placeholder={
                          language === "en"
                            ? "Emergency contact name"
                            : "Nama hubungan kecemasan"
                        }
                        value={form.emergencyContactName || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            emergencyContactName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">
                        {t.emergencyContactPhone}
                      </Label>
                      <Input
                        id="emergencyContactPhone"
                        placeholder={
                          language === "en"
                            ? "e.g. 012-3456789"
                            : "cth: 012-3456789"
                        }
                        value={form.emergencyContactPhone || ""}
                        onChange={(e) => {
                          const filteredValue = handlePhoneInput(e.target.value);
                          setForm((prev) => ({
                            ...prev,
                            emergencyContactPhone: filteredValue,
                          }));
                          // Clear error when user starts typing
                          if (emergencyPhoneError) setEmergencyPhoneError("");
                          // Validate in real-time if not empty
                          if (filteredValue) {
                            const validation = validateMalaysianPhone(filteredValue, false, language);
                            if (!validation.isValid) {
                              setEmergencyPhoneError(validation.error || "");
                            }
                          }
                        }}
                        className={emergencyPhoneError ? "border-destructive" : ""}
                      />
                      {emergencyPhoneError && (
                        <p className="text-sm text-destructive">{emergencyPhoneError}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {form.role === "security_officer" && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-semibold">
                    {language === "en"
                      ? "Security Officer Details"
                      : "Butiran Pegawai Keselamatan"}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="badgeId">{t.badgeId}</Label>
                      <Input
                        id="badgeId"
                        placeholder={
                          language === "en"
                            ? "Enter badge ID"
                            : "Masukkan ID lencana"
                        }
                        value={form.badgeId || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            badgeId: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shiftType">{t.shiftType}</Label>
                      <Select
                        value={form.shiftType}
                        onValueChange={(v) =>
                          setForm((prev) => ({ ...prev, shiftType: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              language === "en"
                                ? "Select shift type"
                                : "Pilih jenis syif"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                          <SelectItem value="rotating">Rotating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">
                        {t.emergencyContactName}
                      </Label>
                      <Input
                        id="emergencyContactName"
                        placeholder={
                          language === "en"
                            ? "Emergency contact name"
                            : "Nama hubungan kecemasan"
                        }
                        value={form.emergencyContactName || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            emergencyContactName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">
                        {t.emergencyContactPhone}
                      </Label>
                      <Input
                        id="emergencyContactPhone"
                        placeholder={
                          language === "en"
                            ? "e.g. 012-3456789"
                            : "cth: 012-3456789"
                        }
                        value={form.emergencyContactPhone || ""}
                        onChange={(e) => {
                          const filteredValue = handlePhoneInput(e.target.value);
                          setForm((prev) => ({
                            ...prev,
                            emergencyContactPhone: filteredValue,
                          }));
                          // Clear error when user starts typing
                          if (emergencyPhoneError) setEmergencyPhoneError("");
                          // Validate in real-time if not empty
                          if (filteredValue) {
                            const validation = validateMalaysianPhone(filteredValue, false, language);
                            if (!validation.isValid) {
                              setEmergencyPhoneError(validation.error || "");
                            }
                          }
                        }}
                        className={emergencyPhoneError ? "border-destructive" : ""}
                      />
                      {emergencyPhoneError && (
                        <p className="text-sm text-destructive">{emergencyPhoneError}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {form.role === "maintenance_staff" && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-semibold">
                    {language === "en"
                      ? "Maintenance Staff Details"
                      : "Butiran Kakitangan Penyelenggaraan"}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">{t.specialization}</Label>
                      <Input
                        id="specialization"
                        placeholder={
                          language === "en"
                            ? "e.g. Electrical, Plumbing"
                            : "cth: Elektrik, Paip"
                        }
                        value={form.specialization || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            specialization: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsExperience">
                        {t.yearsExperience}
                      </Label>
                      <Input
                        id="yearsExperience"
                        type="number"
                        min="0"
                        placeholder={
                          language === "en"
                            ? "Years of experience"
                            : "Tahun pengalaman"
                        }
                        value={form.yearsExperience || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            yearsExperience: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="certificationsText">
                        {t.certificationsText}
                      </Label>
                      <Input
                        id="certificationsText"
                        placeholder={
                          language === "en"
                            ? "List certifications"
                            : "Senaraikan sijil"
                        }
                        value={form.certificationsText || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            certificationsText: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">
                        {t.emergencyContactPhone}
                      </Label>
                      <Input
                        id="emergencyContactPhone"
                        placeholder={
                          language === "en"
                            ? "e.g. 012-3456789"
                            : "cth: 012-3456789"
                        }
                        value={form.emergencyContactPhone || ""}
                        onChange={(e) => {
                          const filteredValue = handlePhoneInput(e.target.value);
                          setForm((prev) => ({
                            ...prev,
                            emergencyContactPhone: filteredValue,
                          }));
                          // Clear error when user starts typing
                          if (emergencyPhoneError) setEmergencyPhoneError("");
                          // Validate in real-time if not empty
                          if (filteredValue) {
                            const validation = validateMalaysianPhone(filteredValue, false, language);
                            if (!validation.isValid) {
                              setEmergencyPhoneError(validation.error || "");
                            }
                          }
                        }}
                        className={emergencyPhoneError ? "border-destructive" : ""}
                      />
                      {emergencyPhoneError && (
                        <p className="text-sm text-destructive">{emergencyPhoneError}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {form.role === "facility_manager" && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-semibold">
                    {language === "en"
                      ? "Facility Manager Details"
                      : "Butiran Pengurus Kemudahan"}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">{t.specialization}</Label>
                      <Input
                        id="specialization"
                        placeholder={
                          language === "en"
                            ? "e.g. Operations, Maintenance"
                            : "cth: Operasi, Penyelenggaraan"
                        }
                        value={form.specialization || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            specialization: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsExperience">
                        {t.yearsExperience}
                      </Label>
                      <Input
                        id="yearsExperience"
                        type="number"
                        min="0"
                        placeholder={
                          language === "en"
                            ? "Years of experience"
                            : "Tahun pengalaman"
                        }
                        value={form.yearsExperience || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            yearsExperience: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="certificationsText">
                        {t.certificationsText}
                      </Label>
                      <Input
                        id="certificationsText"
                        placeholder={
                          language === "en"
                            ? "Management certifications"
                            : "Sijil pengurusan"
                        }
                        value={form.certificationsText || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            certificationsText: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">
                        {t.emergencyContactPhone}
                      </Label>
                      <Input
                        id="emergencyContactPhone"
                        placeholder={
                          language === "en"
                            ? "e.g. 012-3456789"
                            : "cth: 012-3456789"
                        }
                        value={form.emergencyContactPhone || ""}
                        onChange={(e) => {
                          const filteredValue = handlePhoneInput(e.target.value);
                          setForm((prev) => ({
                            ...prev,
                            emergencyContactPhone: filteredValue,
                          }));
                          // Clear error when user starts typing
                          if (emergencyPhoneError) setEmergencyPhoneError("");
                          // Validate in real-time if not empty
                          if (filteredValue) {
                            const validation = validateMalaysianPhone(filteredValue, false, language);
                            if (!validation.isValid) {
                              setEmergencyPhoneError(validation.error || "");
                            }
                          }
                        }}
                        className={emergencyPhoneError ? "border-destructive" : ""}
                      />
                      {emergencyPhoneError && (
                        <p className="text-sm text-destructive">{emergencyPhoneError}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={creating}
                >
                  {t.cancel}
                </Button>
                <Button onClick={handleCreateUser} disabled={creating}>
                  {creating && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingId ? t.edit : t.create}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRole} onValueChange={handleRoleFilterChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <div id="user-list" className="space-y-4">
              {/* User count and pagination info */}
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div>
                  Showing {Math.min(startIndex + 1, totalUsers)}-{endIndex} of{" "}
                  {totalUsers} users
                </div>
                <div>
                  Page {currentPage} of {totalPages}
                </div>
              </div>

              {paginatedUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              ) : (
                paginatedUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onUserClick={handleUserClick}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSendInvite={(user) =>
                      handleResendInvitation(user.id, user.email)
                    }
                    onApprove={(user) => handleApprove(user.id)}
                    onReject={(user) => handleReject(user.id)}
                    getRoleColor={getRoleColor}
                    getStatusColor={getStatusColor}
                    getRoleText={getRoleText}
                    getStatusText={getStatusText}
                    t={t}
                    language={language}
                  />
                ))
              )}

              {/* Pagination Controls */}
              {totalUsers > itemsPerPage && (
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1 || loading}
                    >
                      {loading && currentPage > 1 ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : null}
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || loading}
                    >
                      {loading && currentPage < totalPages ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : null}
                      Next
                    </Button>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={
                            currentPage === pageNumber ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className="w-8 h-8 p-0"
                          disabled={loading}
                        >
                          {loading && currentPage === pageNumber ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            pageNumber
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {totalUsers} total users
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              {t.userDetails}
            </DialogTitle>
            <DialogDescription>
              {language === "en"
                ? "View user information and manage household members"
                : "Lihat maklumat pengguna dan urus ahli rumah"}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="mt-6 space-y-6">
              {/* User Profile Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg">
                      {selectedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {selectedUser.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.phone}
                    </p>
                    {selectedUser.role === 'guest' && tenantHost && (
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-yellow-900 bg-yellow-50 border border-yellow-200 inline-block px-2 py-1 rounded">
                          {language === 'en' ? 'Belongs to: ' : 'Di bawah: '}
                          <strong>{tenantHost.full_name}</strong>
                          {tenantHost.unit_number ? ` • Unit ${tenantHost.unit_number}` : ''}
                        </p>
                        <Button variant="link" size="sm" onClick={goToResident} className="h-auto p-0 text-yellow-900">
                          {language === 'en' ? 'Go to resident' : 'Lihat penduduk'}
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRoleColor(selectedUser.role)}>
                        {getRoleText(selectedUser.role)}
                      </Badge>
                      <Badge className={getStatusColor(selectedUser.status)}>
                        {getStatusText(selectedUser.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Household Members Section - hidden for tenants */}
              {!['guest','tenant'].includes(selectedUser.role as string) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">
                    {t.householdMembers}
                  </h4>
                  <Dialog
                    open={isAddTenantOpen}
                    onOpenChange={setIsAddTenantOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t.addTenant}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[560px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{t.addTenant}</DialogTitle>
                        <DialogDescription>
                          {language === "en"
                            ? "Add a new tenant to this household. They will receive an invitation email."
                            : "Tambah penyewa baru ke rumah ini. Mereka akan menerima e-mel jemputan."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Validation panel for tenant creation */}
                        <CreateUserValidator
                          formData={{
                            name: tenantForm.tenant_name,
                            email: tenantForm.tenant_email,
                            phone: tenantForm.tenant_phone,
                            unit: "",
                            role: "guest",
                            status: "",
                            district_id: selectedUser?.district_id,
                            community_id: selectedUser?.community_id,
                            access_expires_at: tenantForm.access_expires_at,
                          }}
                          isVisible={showTenantValidator}
                          onToggleVisibility={() => setShowTenantValidator(!showTenantValidator)}
                        />
                        <div className="space-y-2">
                          <Label htmlFor="tenantName">{t.tenantName} *</Label>
                          <Input
                            id="tenantName"
                            value={tenantForm.tenant_name}
                            onChange={(e) =>
                              setTenantForm((prev) => ({
                                ...prev,
                                tenant_name: e.target.value,
                              }))
                            }
                            placeholder={
                              language === "en"
                                ? "Enter tenant name"
                                : "Masukkan nama penyewa"
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tenantEmail">{t.tenantEmail} *</Label>
                          <Input
                            id="tenantEmail"
                            type="email"
                            value={tenantForm.tenant_email}
                            onChange={(e) =>
                              setTenantForm((prev) => ({
                                ...prev,
                                tenant_email: e.target.value,
                              }))
                            }
                            placeholder={
                              language === "en"
                                ? "Enter tenant email"
                                : "Masukkan e-mel penyewa"
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tenantPhone">{t.tenantPhone}</Label>
                          <Input
                            id="tenantPhone"
                            value={tenantForm.tenant_phone}
                            onChange={(e) => {
                              const filteredValue = handlePhoneInput(e.target.value);
                              setTenantForm((prev) => ({
                                ...prev,
                                tenant_phone: filteredValue,
                              }));
                              // Clear error when user starts typing
                              if (tenantPhoneError) setTenantPhoneError("");
                              // Validate in real-time if not empty
                              if (filteredValue) {
                                const validation = validateMalaysianPhone(filteredValue, false, language);
                                if (!validation.isValid) {
                                  setTenantPhoneError(validation.error || "");
                                }
                              }
                            }}
                            placeholder={
                              language === "en"
                                ? "e.g. 012-3456789 (optional)"
                                : "cth: 012-3456789 (pilihan)"
                            }
                            className={tenantPhoneError ? "border-destructive" : ""}
                          />
                          {tenantPhoneError && (
                            <p className="text-sm text-destructive">{tenantPhoneError}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tenantExpiresAt">
                            {language === "en"
                              ? "Access Expires At *"
                              : "Akses Tamat Pada *"}
                          </Label>
                          <Input
                            id="tenantExpiresAt"
                            type="date"
                            value={tenantForm.access_expires_at}
                            onChange={(e) =>
                              setTenantForm((prev) => ({
                                ...prev,
                                access_expires_at: e.target.value,
                              }))
                            }
                            placeholder={
                              language === "en"
                                ? "Select expiration date"
                                : "Pilih tarikh tamat tempoh"
                            }
                            min={new Date().toISOString().slice(0, 10)}
                          />
                        </div>

                        {/* Permissions */}
                        <div className="space-y-3">
                          <Label>{t.tenantPermissions}</Label>
                          <div className="space-y-3">
                            {[
                              { key: "marketplace", label: t.marketplace },
                              { key: "bookings", label: t.bookings },
                              { key: "announcements", label: t.announcements },
                              { key: "complaints", label: t.complaints },
                              { key: "discussions", label: t.discussions },
                              {
                                key: "panic_button",
                                label:
                                  language === "en"
                                    ? "Panic Button"
                                    : "Butang Panik",
                              },
                            ].map(({ key, label }) => (
                              <div
                                key={key}
                                className="flex items-center justify-between"
                              >
                                <Label
                                  htmlFor={`perm-${key}`}
                                  className="text-sm"
                                >
                                  {label}
                                </Label>
                                <Switch
                                  id={`perm-${key}`}
                                  checked={
                                    tenantForm.permissions[
                                      key as keyof typeof tenantForm.permissions
                                    ]
                                  }
                                  onCheckedChange={(checked) =>
                                    setTenantForm((prev) => ({
                                      ...prev,
                                      permissions: {
                                        ...prev.permissions,
                                        [key]: checked,
                                      },
                                    }))
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsAddTenantOpen(false)}
                          >
                            {t.cancel}
                          </Button>
                          <Button
                            onClick={handleCreateTenant}
                            disabled={isCreatingTenant}
                          >
                            {isCreatingTenant && (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            {t.createTenant}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {isLoadingHousehold ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : householdAccounts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t.noHouseholdMembers}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {householdAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {account.profiles.full_name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "T"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {account.profiles.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {account.profiles.email}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {account.relationship_type}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {language === "en" ? "Tenant" : "Penyewa"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Creation Validation Suite - Only shown in development/admin mode */}
      <RoleCreationValidator />

      {/* Comprehensive Role Testing Suite */}
      <RoleValidationTests />
    </div>
  );
}
