import { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Dumbbell,
  Waves,
  TreePine,
  Car,
  Search,
  RefreshCw,
  Loader2,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useModuleAccess } from "@/hooks/use-module-access";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlotPicker } from "@/components/facilities/TimeSlotPicker";

// Import facility images
import communityGymImage from "@/assets/community-gym.jpg";
import swimmingPoolImage from "@/assets/swimming-pool.jpg";
import functionHallImage from "@/assets/function-hall.jpg";
import playgroundFacilityImage from "@/assets/playground-facility.jpg";
import prayerHallFacilityImage from "@/assets/prayer-hall-facility.jpg";
import gardenFacilityImage from "@/assets/garden-facility.jpg";

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

interface Facility {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  availability: "available" | "occupied" | "maintenance";
  amenities: string[];
  image: string;
  hourlyRate?: number;
}

export default function Facilities() {
  const { language, user } = useAuth();
  const { isModuleEnabled, enabledModules } = useModuleAccess();
  const { toast } = useToast();

  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFacilities, setTotalFacilities] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const facilitiesPerPage = 15;

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [bookingData, setBookingData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    notes: "",
  });

  const text = {
    en: {
      title: "Community Facilities",
      subtitle: "Book and manage community facilities",
      search: "Search facilities...",
      type: "Facility Type",
      allTypes: "All Types",
      availability: "Availability",
      allAvailability: "All Status",
      gymFitness: "Gym & Fitness",
      pools: "Swimming Pools",
      halls: "Function Halls",
      parks: "Parks & Gardens",
      parking: "Parking Areas",
      book: "Book Facility",
      available: "Available",
      occupied: "Occupied",
      maintenance: "Maintenance",
      capacity: "Capacity",
      people: "people",
      location: "Location",
      amenities: "Amenities",
      hourlyRate: "Hourly Rate",
      bookingTitle: "Book Facility",
      bookingSubtitle: "Book this facility for your event",
      date: "Date",
      startTime: "Start Time",
      endTime: "End Time",
      purpose: "Purpose",
      notes: "Additional Notes",
      cancel: "Cancel",
      confirm: "Confirm Booking",
      bookingSuccess: "Facility booked successfully!",
      showingResults: "Showing",
      of: "of",
      results: "facilities",
      noResults: "No facilities found",
      noResultsDesc: "Try adjusting your search or filter criteria",
      page: "Page",
      previous: "Previous",
      next: "Next",
      refresh: "Refresh",
    },
    ms: {
      title: "Kemudahan Komuniti",
      subtitle: "Tempah dan urus kemudahan komuniti",
      search: "Cari kemudahan...",
      type: "Jenis Kemudahan",
      allTypes: "Semua Jenis",
      availability: "Ketersediaan",
      allAvailability: "Semua Status",
      gymFitness: "Gim & Kecergasan",
      pools: "Kolam Renang",
      halls: "Dewan Majlis",
      parks: "Taman & Landskap",
      parking: "Tempat Letak Kereta",
      book: "Tempah Kemudahan",
      available: "Tersedia",
      occupied: "Diduduki",
      maintenance: "Dalam Penyelenggaraan",
      capacity: "Kapasiti",
      people: "orang",
      location: "Lokasi",
      amenities: "Kemudahan",
      hourlyRate: "Kadar Sejam",
      bookingTitle: "Tempah Kemudahan",
      bookingSubtitle: "Tempah kemudahan ini untuk acara anda",
      date: "Tarikh",
      startTime: "Masa Mula",
      endTime: "Masa Tamat",
      purpose: "Tujuan",
      notes: "Nota Tambahan",
      cancel: "Batal",
      confirm: "Sahkan Tempahan",
      bookingSuccess: "Kemudahan berjaya ditempah!",
      showingResults: "Menunjukkan",
      of: "daripada",
      results: "kemudahan",
      noResults: "Tiada kemudahan dijumpai",
      noResultsDesc: "Cuba laraskan kriteria carian atau penapis anda",
      page: "Halaman",
      previous: "Sebelumnya",
      next: "Seterusnya",
      refresh: "Muat Semula",
    },
  };

  const t = text[language];

  // Compute stable facilitiesEnabled boolean
  const facilitiesEnabled = enabledModules.some(
    (module) => module.module_name === "facilities"
  );

  // Enhanced fetch function with server-side pagination and filtering
  const fetchFacilities = useCallback(
    async (page = 1, search = "", type = "all", availability = "all") => {
      console.log("fetchFacilities called with:", {
        page,
        search,
        type,
        availability,
      });

      if (!facilitiesEnabled) {
        console.log("Facilities module not enabled, skipping fetch");
        setLoading(false);
        return;
      }

      try {
        setLoading(page === 1);

        // Save scroll position before fetch
        setScrollPosition(window.scrollY);

        // Build query
        let query = supabase.from("facilities").select("*", { count: "exact" });

        // Apply search filter
        if (search.trim()) {
          query = query.or(
            `name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`
          );
        }

        // Apply availability filter
        if (availability !== "all") {
          const isAvailable = availability === "available";
          query = query.eq("is_available", isAvailable);
        }

        // Apply pagination
        const from = (page - 1) * facilitiesPerPage;
        const to = from + facilitiesPerPage - 1;
        query = query.range(from, to).order("name");

        const { data, error, count } = await query;

        if (error) throw error;

        // Helper function to get fallback image based on facility name/type
        const getFallbackImage = (facilityName: string) => {
          const name = facilityName.toLowerCase();
          if (
            name.includes("gym") ||
            name.includes("gim") ||
            name.includes("fitness") ||
            name.includes("kecergasan")
          )
            return communityGymImage;
          if (
            name.includes("pool") ||
            name.includes("kolam") ||
            name.includes("swimming") ||
            name.includes("renang")
          )
            return swimmingPoolImage;
          if (
            name.includes("hall") ||
            name.includes("dewan") ||
            name.includes("function") ||
            name.includes("majlis")
          )
            return functionHallImage;
          if (
            name.includes("playground") ||
            name.includes("taman") ||
            name.includes("kanak") ||
            name.includes("children") ||
            name.includes("play")
          )
            return playgroundFacilityImage;
          if (
            name.includes("surau") ||
            name.includes("prayer") ||
            name.includes("solat") ||
            name.includes("mosque") ||
            name.includes("masjid")
          )
            return prayerHallFacilityImage;
          if (
            name.includes("garden") ||
            name.includes("park") ||
            name.includes("landscape") ||
            name.includes("landskap")
          )
            return gardenFacilityImage;
          return "/placeholder.svg";
        };

        // Transform Supabase data to match our interface
        let transformedFacilities: Facility[] = (data || []).map(
          (facility) => ({
            id: facility.id,
            name: facility.name,
            description: facility.description || "",
            location: facility.location || "",
            capacity: facility.capacity || 0,
            availability: facility.is_available ? "available" : "maintenance",
            amenities: facility.amenities || [],
            image:
              facility.image ||
              facility.images?.[0] ||
              getFallbackImage(facility.name),
            hourlyRate: facility.hourly_rate
              ? Number(facility.hourly_rate)
              : undefined,
          })
        );

        // Client-side type filtering (until database schema is updated)
        if (type !== "all") {
          transformedFacilities = transformedFacilities.filter((facility) => {
            const name = facility.name.toLowerCase();
            switch (type) {
              case "gym":
                return (
                  name.includes("gym") ||
                  name.includes("gim") ||
                  name.includes("fitness")
                );
              case "pool":
                return (
                  name.includes("pool") ||
                  name.includes("kolam") ||
                  name.includes("swimming")
                );
              case "hall":
                return (
                  name.includes("hall") ||
                  name.includes("dewan") ||
                  name.includes("function")
                );
              case "garden":
                return (
                  name.includes("garden") ||
                  name.includes("park") ||
                  name.includes("playground") ||
                  name.includes("taman")
                );
              case "parking":
                return name.includes("parking") || name.includes("letak");
              default:
                return true;
            }
          });
        }

        // Use database data or demo data if database is empty
        if (
          transformedFacilities.length === 0 &&
          page === 1 &&
          !search &&
          type === "all"
        ) {
          const demoFacilities = [
            {
              id: "1",
              name: language === "en" ? "Community Gym" : "Gim Komuniti",
              description:
                language === "en"
                  ? "Fully equipped fitness center with modern equipment"
                  : "Pusat kecergasan lengkap dengan peralatan moden",
              location: "Block A, Ground Floor",
              capacity: 20,
              availability: "available" as const,
              amenities: [
                "Treadmills",
                "Weight Training",
                "Air Conditioning",
                "Lockers",
              ],
              image: communityGymImage,
              hourlyRate: 10,
            },
            {
              id: "2",
              name: language === "en" ? "Swimming Pool" : "Kolam Renang",
              description:
                language === "en"
                  ? "Olympic-size swimming pool with children's area"
                  : "Kolam renang saiz olimpik dengan kawasan kanak-kanak",
              location: "Recreation Area",
              capacity: 50,
              availability: "available" as const,
              amenities: [
                "Lifeguard",
                "Changing Rooms",
                "Pool Equipment",
                "Shower",
              ],
              image: swimmingPoolImage,
            },
            {
              id: "3",
              name: language === "en" ? "Function Hall A" : "Dewan Majlis A",
              description:
                language === "en"
                  ? "Large multipurpose hall for events and gatherings"
                  : "Dewan serbaguna besar untuk acara dan perhimpunan",
              location: "Block B, Level 2",
              capacity: 100,
              availability: "available" as const,
              amenities: [
                "Sound System",
                "Projector",
                "Tables & Chairs",
                "Kitchen Access",
              ],
              image: functionHallImage,
              hourlyRate: 50,
            },
            {
              id: "4",
              name:
                language === "en"
                  ? "Children's Playground"
                  : "Taman Kanak-Kanak",
              description:
                language === "en"
                  ? "Safe playground area for children with modern equipment"
                  : "Kawasan permainan selamat untuk kanak-kanak dengan peralatan moden",
              location: "Recreation Area",
              capacity: 25,
              availability: "available" as const,
              amenities: [
                "Swings",
                "Slides",
                "Climbing frames",
                "Soft play area",
                "Benches for parents",
              ],
              image: playgroundFacilityImage,
            },
            {
              id: "5",
              name: language === "en" ? "Prayer Hall" : "Surau Pahang Prima",
              description:
                language === "en"
                  ? "Prayer hall for Muslim community members"
                  : "Surau untuk ahli komuniti Muslim",
              location: "Block C, Ground Floor",
              capacity: 100,
              availability: "available" as const,
              amenities: [
                "Prayer mats",
                "Ablution area",
                "Air conditioning",
                "Sound system for Azan",
              ],
              image: prayerHallFacilityImage,
            },
            {
              id: "6",
              name: language === "en" ? "Community Garden" : "Taman Komuniti",
              description:
                language === "en"
                  ? "Beautiful garden area for relaxation and community activities"
                  : "Kawasan taman yang indah untuk berehat dan aktiviti komuniti",
              location: "Central Area",
              capacity: 50,
              availability: "available" as const,
              amenities: ["Walking paths", "Benches", "Landscaping", "Gazebo"],
              image: gardenFacilityImage,
            },
          ];

          // Apply filters to demo data
          let filteredDemo = demoFacilities;
          if (search.trim()) {
            filteredDemo = filteredDemo.filter(
              (facility) =>
                facility.name.toLowerCase().includes(search.toLowerCase()) ||
                facility.description
                  .toLowerCase()
                  .includes(search.toLowerCase()) ||
                facility.location.toLowerCase().includes(search.toLowerCase())
            );
          }
          if (type !== "all") {
            filteredDemo = filteredDemo.filter((facility) => {
              const name = facility.name.toLowerCase();
              switch (type) {
                case "gym":
                  return (
                    name.includes("gym") ||
                    name.includes("gim") ||
                    name.includes("fitness")
                  );
                case "pool":
                  return (
                    name.includes("pool") ||
                    name.includes("kolam") ||
                    name.includes("swimming")
                  );
                case "hall":
                  return (
                    name.includes("hall") ||
                    name.includes("dewan") ||
                    name.includes("function")
                  );
                case "garden":
                  return (
                    name.includes("garden") ||
                    name.includes("park") ||
                    name.includes("playground") ||
                    name.includes("taman")
                  );
                case "parking":
                  return name.includes("parking") || name.includes("letak");
                default:
                  return true;
              }
            });
          }
          if (availability !== "all") {
            filteredDemo = filteredDemo.filter(
              (facility) => facility.availability === availability
            );
          }

          setFacilities(filteredDemo);
          setTotalFacilities(filteredDemo.length);
          setTotalPages(Math.ceil(filteredDemo.length / facilitiesPerPage));
        } else {
          setFacilities(transformedFacilities);
          setTotalFacilities(count || 0);
          setTotalPages(Math.ceil((count || 0) / facilitiesPerPage));
        }
      } catch (error) {
        console.error("Error fetching facilities:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load facilities. Please try again.",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);

        // Restore scroll position after a short delay
        setTimeout(() => {
          window.scrollTo({ top: scrollPosition, behavior: "smooth" });
        }, 100);
      }
    },
    [facilitiesEnabled, language, toast, scrollPosition]
  );

  // Enhanced effect to handle debounced search and pagination
  useEffect(() => {
    fetchFacilities(
      currentPage,
      debouncedSearchTerm,
      selectedType,
      selectedAvailability
    );
  }, [
    fetchFacilities,
    currentPage,
    debouncedSearchTerm,
    selectedType,
    selectedAvailability,
  ]);

  // Check if facilities module is enabled - do this AFTER all hooks
  if (!facilitiesEnabled) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Module Disabled
            </h3>
            <p className="text-sm text-muted-foreground">
              The Facilities module is not enabled for this community.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const facilityTypes = [
    { value: "all", label: t.allTypes },
    { value: "gym", label: t.gymFitness },
    { value: "pool", label: t.pools },
    { value: "hall", label: t.halls },
    { value: "garden", label: t.parks },
    { value: "parking", label: t.parking },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return t.available;
      case "occupied":
        return t.occupied;
      case "maintenance":
        return t.maintenance;
      default:
        return status;
    }
  };

  const getIcon = (facilityName: string) => {
    if (facilityName.toLowerCase().includes("gym"))
      return <Dumbbell className="h-5 w-5" />;
    if (facilityName.toLowerCase().includes("pool"))
      return <Waves className="h-5 w-5" />;
    if (
      facilityName.toLowerCase().includes("park") ||
      facilityName.toLowerCase().includes("garden")
    )
      return <TreePine className="h-5 w-5" />;
    if (facilityName.toLowerCase().includes("parking"))
      return <Car className="h-5 w-5" />;
    return <MapPin className="h-5 w-5" />;
  };

  // Enhanced search and filter handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  }, []);

  const handleAvailabilityChange = useCallback((value: string) => {
    setSelectedAvailability(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    fetchFacilities(1, debouncedSearchTerm, selectedType, selectedAvailability);
  }, [
    fetchFacilities,
    debouncedSearchTerm,
    selectedType,
    selectedAvailability,
  ]);

  // Computed values for display
  const displayedFacilities = useMemo(() => facilities, [facilities]);

  const handleBookFacility = (facility: Facility) => {
    if (facility.availability === "available") {
      setSelectedFacility(facility);
      setIsBookingOpen(true);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedFacility || !user) {
      toast({
        variant: "destructive",
        title: language === "en" ? "Error" : "Ralat",
        description: language === "en" ? "Please try again" : "Sila cuba lagi",
      });
      return;
    }

    // Validate required fields
    if (
      !bookingData.date ||
      !bookingData.startTime ||
      !bookingData.endTime ||
      !bookingData.purpose
    ) {
      toast({
        variant: "destructive",
        title: language === "en" ? "Missing Information" : "Maklumat Kurang",
        description:
          language === "en"
            ? "Please fill in all required fields (date, start time, end time, and purpose)."
            : "Sila isikan semua medan yang diperlukan (tarikh, masa mula, masa tamat, dan tujuan).",
      });
      return;
    }

    // Validate time range
    const startTime = new Date(`${bookingData.date}T${bookingData.startTime}`);
    const endTime = new Date(`${bookingData.date}T${bookingData.endTime}`);

    if (endTime <= startTime) {
      toast({
        variant: "destructive",
        title: language === "en" ? "Invalid Time Range" : "Masa Tidak Sah",
        description:
          language === "en"
            ? "End time must be after start time."
            : "Masa tamat mesti selepas masa mula.",
      });
      return;
    }

    // Validate booking is not in the past
    const now = new Date();
    if (startTime < now) {
      toast({
        variant: "destructive",
        title:
          language === "en" ? "Invalid Date/Time" : "Tarikh/Masa Tidak Sah",
        description:
          language === "en"
            ? "Cannot book for past dates or times."
            : "Tidak boleh menempah untuk tarikh atau masa yang lalu.",
      });
      return;
    }

    const durationHours = Math.ceil(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    );
    const totalAmount = selectedFacility.hourlyRate
      ? selectedFacility.hourlyRate * durationHours
      : 0;

    try {
      const { error } = await supabase.from("bookings").insert({
        facility_id: selectedFacility.id,
        user_id: user.id,
        booking_date: bookingData.date,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        duration_hours: durationHours,
        purpose: bookingData.purpose,
        notes: bookingData.notes,
        total_amount: totalAmount,
        status: "pending",
      });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast({
        title: t.bookingSuccess,
        description:
          language === "en"
            ? `Your booking for ${selectedFacility.name} has been submitted and is pending approval.`
            : `Tempahan anda untuk ${selectedFacility.name} telah dihantar dan menunggu kelulusan.`,
      });

      setIsBookingOpen(false);
      setSelectedFacility(null);
      setBookingData({
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        variant: "destructive",
        title: language === "en" ? "Booking Failed" : "Tempahan Gagal",
        description:
          language === "en"
            ? `Failed to create booking: ${
                error.message || "Unknown error"
              }. Please try again.`
            : `Gagal mencipta tempahan: ${
                error.message || "Ralat tidak diketahui"
              }. Sila cuba lagi.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {refreshing ? "Refreshing..." : t.refresh}
        </Button>
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
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {facilityTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedAvailability}
          onValueChange={handleAvailabilityChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t.availability} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allAvailability}</SelectItem>
            <SelectItem value="available">{t.available}</SelectItem>
            <SelectItem value="maintenance">{t.maintenance}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse" />
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayedFacilities.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t.noResults}
          </h3>
          <p className="text-sm text-muted-foreground">{t.noResultsDesc}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <span>
              {t.showingResults} {(currentPage - 1) * facilitiesPerPage + 1}-
              {Math.min(currentPage * facilitiesPerPage, totalFacilities)}{" "}
              {t.of} {totalFacilities} {t.results}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFacilities.map((facility) => (
              <Card
                key={facility.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {facility.image && facility.image !== "/placeholder.svg" ? (
                    <img
                      src={
                        facility.image.startsWith("http")
                          ? facility.image
                          : facility.image === "community-gym.jpg"
                          ? communityGymImage
                          : facility.image === "swimming-pool.jpg"
                          ? swimmingPoolImage
                          : facility.image === "function-hall.jpg"
                          ? functionHallImage
                          : facility.image
                      }
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getIcon(facility.name)
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{facility.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {facility.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(facility.availability)}>
                      {getStatusText(facility.availability)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {t.location}: {facility.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {t.capacity}: {facility.capacity} {t.people}
                      </span>
                    </div>
                    {facility.hourlyRate && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {t.hourlyRate}: RM{facility.hourlyRate}
                        </span>
                      </div>
                    )}
                  </div>

                  {facility.amenities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        {t.amenities}:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {facility.amenities
                          .slice(0, 3)
                          .map((amenity, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {amenity}
                            </Badge>
                          ))}
                        {facility.amenities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{facility.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => handleBookFacility(facility)}
                    disabled={facility.availability !== "available"}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t.book}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t.previous}
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  if (totalPages <= 5) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  }
                  // For more than 5 pages, show smart pagination
                  if (currentPage <= 3) {
                    if (page <= 3) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === 4) {
                      return <span key="ellipsis1">...</span>;
                    } else if (page === 5) {
                      return (
                        <Button
                          key={totalPages}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      );
                    }
                  } else if (currentPage >= totalPages - 2) {
                    if (page === 1) {
                      return (
                        <Button
                          key={1}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </Button>
                      );
                    } else if (page === 2) {
                      return <span key="ellipsis2">...</span>;
                    } else if (page >= 3) {
                      const actualPage = totalPages - 5 + page;
                      return (
                        <Button
                          key={actualPage}
                          variant={
                            currentPage === actualPage ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(actualPage)}
                        >
                          {actualPage}
                        </Button>
                      );
                    }
                  } else {
                    if (page === 1) {
                      return (
                        <Button
                          key={1}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </Button>
                      );
                    } else if (page === 2) {
                      return <span key="ellipsis3">...</span>;
                    } else if (page === 3) {
                      return (
                        <Button
                          key={currentPage}
                          variant="default"
                          size="sm"
                          onClick={() => handlePageChange(currentPage)}
                        >
                          {currentPage}
                        </Button>
                      );
                    } else if (page === 4) {
                      return <span key="ellipsis4">...</span>;
                    } else if (page === 5) {
                      return (
                        <Button
                          key={totalPages}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      );
                    }
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {t.next}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.bookingTitle}</DialogTitle>
            <DialogDescription>{t.bookingSubtitle}</DialogDescription>
          </DialogHeader>
          {selectedFacility && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedFacility.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedFacility.location}
                </p>
                {selectedFacility.hourlyRate && (
                  <p className="text-sm">
                    {t.hourlyRate}: RM{selectedFacility.hourlyRate}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">{t.date}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={bookingData.date}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {!bookingData.date && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      📅 Please select a date above to see available time slots
                    </p>
                  </div>
                )}

                {bookingData.date && selectedFacility && (
                  <TimeSlotPicker
                    facilityId={selectedFacility.id}
                    selectedDate={bookingData.date}
                    selectedStartTime={bookingData.startTime}
                    selectedEndTime={bookingData.endTime}
                    onTimeSlotSelect={(startTime, endTime) => {
                      setBookingData((prev) => ({
                        ...prev,
                        startTime,
                        endTime,
                      }));
                    }}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">{t.purpose}</Label>
                <Input
                  id="purpose"
                  placeholder={t.purpose}
                  value={bookingData.purpose}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      purpose: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea
                  id="notes"
                  placeholder={t.notes}
                  rows={3}
                  value={bookingData.notes}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsBookingOpen(false)}
                >
                  {t.cancel}
                </Button>
                <Button onClick={handleConfirmBooking}>{t.confirm}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
