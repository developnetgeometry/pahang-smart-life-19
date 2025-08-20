import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Building, Calendar, Users, CheckCircle, Clock, MapPin, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Facility {
  id: string;
  name: string;
  type: "hall" | "court" | "room" | "pool" | "gym" | "other";
  location: string;
  capacity: number;
  status: "open" | "closed" | "maintenance";
  available: boolean;
}

interface Booking {
  id: string;
  facilityId: string;
  facilityName: string;
  bookedBy: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
}

export default function FacilitiesManagement() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("facilities");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [form, setForm] = useState<{ name: string; type: Facility["type"] | ""; location: string; capacity: number }>({
    name: "",
    type: "",
    location: "",
    capacity: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const text = {
    en: {
      title: "Facilities Management",
      subtitle: "Manage community facilities and bookings",
      facilities: "Facilities",
      bookings: "Bookings",
      settings: "Settings",
      addFacility: "Add Facility",
      search: "Search facilities...",
      status: "Status",
      all: "All",
      open: "Open",
      closed: "Closed",
      maintenance: "Maintenance",
      type: "Type",
      location: "Location",
      capacity: "Capacity",
      createTitle: "Create New Facility",
      createSubtitle: "Add a new community facility",
      name: "Facility Name",
      selectType: "Select Type",
      save: "Save",
      cancel: "Cancel",
      facilityCreated: "Facility created successfully!",
      toggleAvailability: "Toggle Availability",
      overview: "Overview",
      totalFacilities: "Total Facilities",
      openNow: "Open Now",
      inMaintenance: "In Maintenance",
    },
    ms: {
      title: "Pengurusan Kemudahan",
      subtitle: "Urus kemudahan komuniti dan tempahan",
      facilities: "Kemudahan",
      bookings: "Tempahan",
      settings: "Tetapan",
      addFacility: "Tambah Kemudahan",
      search: "Cari kemudahan...",
      status: "Status",
      all: "Semua",
      open: "Dibuka",
      closed: "Ditutup",
      maintenance: "Penyelenggaraan",
      type: "Jenis",
      location: "Lokasi",
      capacity: "Kapasiti",
      createTitle: "Cipta Kemudahan Baru",
      createSubtitle: "Tambah kemudahan komuniti baharu",
      name: "Nama Kemudahan",
      selectType: "Pilih Jenis",
      save: "Simpan",
      cancel: "Batal",
      facilityCreated: "Kemudahan berjaya dicipta!",
      toggleAvailability: "Tukar Ketersediaan",
      overview: "Gambaran Keseluruhan",
      totalFacilities: "Jumlah Kemudahan",
      openNow: "Dibuka Sekarang",
      inMaintenance: "Dalam Penyelenggaraan",
    },
  } as const;

  const t = text[language];

  const [facilities, setFacilities] = useState<Facility[]>([
    {
      id: "1",
      name: language === "en" ? "Community Hall" : "Dewan Komuniti",
      type: "hall",
      location: "Block A",
      capacity: 120,
      status: "open",
      available: true,
    },
    {
      id: "2",
      name: language === "en" ? "Badminton Court" : "Gelanggang Badminton",
      type: "court",
      location: "Sports Complex",
      capacity: 8,
      status: "maintenance",
      available: false,
    },
    {
      id: "3",
      name: language === "en" ? "Meeting Room B" : "Bilik Mesyuarat B",
      type: "room",
      location: "Block B, Level 2",
      capacity: 12,
      status: "closed",
      available: false,
    },
  ]);

  const [bookings] = useState<Booking[]>([
    {
      id: "b1",
      facilityId: "1",
      facilityName: language === "en" ? "Community Hall" : "Dewan Komuniti",
      bookedBy: "John Doe",
      date: "2024-01-22",
      time: "14:00 - 16:00",
      status: "confirmed",
    },
    {
      id: "b2",
      facilityId: "2",
      facilityName: language === "en" ? "Badminton Court" : "Gelanggang Badminton",
      bookedBy: "Sarah Lee",
      date: "2024-01-21",
      time: "09:00 - 10:00",
      status: "pending",
    },
  ]);

  const getStatusBadge = (status: Facility["status"]) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreate = () => {
    if (!form.name || !form.type || !form.location) {
      toast({ title: t.save, description: "Please fill all fields." });
      return;
    }

    if (editingId) {
      setFacilities((prev) =>
        prev.map((f) =>
          f.id === editingId
            ? { ...f, name: form.name, type: form.type as Facility["type"], location: form.location, capacity: Number(form.capacity) }
            : f
        )
      );
    } else {
      const newFacility: Facility = {
        id: String(Date.now()),
        name: form.name,
        type: form.type as Facility["type"],
        location: form.location,
        capacity: Number(form.capacity),
        status: "open",
        available: true,
      };
      setFacilities((prev) => [newFacility, ...prev]);
    }

    setIsCreateOpen(false);
    setEditingId(null);
    setForm({ name: "", type: "", location: "", capacity: 0 });
    toast({ title: t.facilityCreated });
  };
  const handleToggleAvailability = (id: string) => {
    setFacilities((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, available: !f.available, status: f.available ? "closed" : "open" } : f
      )
    );
    toast({ title: t.toggleAvailability });
  };

  const handleEdit = (facility: Facility) => {
    setEditingId(facility.id);
    setForm({ name: facility.name, type: facility.type, location: facility.location, capacity: facility.capacity });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this facility?")) {
      setFacilities((prev) => prev.filter((f) => f.id !== id));
      toast({ title: "Facility deleted" });
    }
  };

  const filteredFacilities = facilities.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: facilities.length,
    open: facilities.filter((f) => f.status === "open").length,
    maintenance: facilities.filter((f) => f.status === "maintenance").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingId(null);
              setForm({ name: "", type: "", location: "", capacity: 0 });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t.addFacility}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>{t.createTitle}</DialogTitle>
              <DialogDescription>{t.createSubtitle}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  placeholder={t.name}
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.type}</Label>
                  <Select
                    value={form.type || undefined}
                    onValueChange={(v) => setForm((prev) => ({ ...prev, type: v as Facility["type"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hall">Hall</SelectItem>
                      <SelectItem value="court">Court</SelectItem>
                      <SelectItem value="room">Room</SelectItem>
                      <SelectItem value="pool">Pool</SelectItem>
                      <SelectItem value="gym">Gym</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">{t.capacity}</Label>
                  <Input id="capacity" type="number" placeholder="0" value={form.capacity} onChange={(e) => setForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">{t.location}</Label>
                <Input id="location" placeholder={t.location} value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleCreate}>{t.save}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="facilities">{t.facilities}</TabsTrigger>
          <TabsTrigger value="bookings">{t.bookings}</TabsTrigger>
          <TabsTrigger value="settings">{t.settings}</TabsTrigger>
        </TabsList>

        <TabsContent value="facilities" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalFacilities}</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.openNow}</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.open}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.inMaintenance}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.maintenance}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="open">{t.open}</SelectItem>
                <SelectItem value="closed">{t.closed}</SelectItem>
                <SelectItem value="maintenance">{t.maintenance}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Facilities List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFacilities.map((f) => (
              <Card key={f.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">{f.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {f.location}
                    </p>
                  </div>
                  <Badge className={`${getStatusBadge(f.status)}`}>{t[f.status]}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {t.type}: {f.type}
                    </span>
                    <span>
                      {t.capacity}: {f.capacity}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => handleToggleAvailability(f.id)}>
                      {t.toggleAvailability}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(f)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(f.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.bookings}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{b.facilityName}</div>
                      <div className="text-sm text-muted-foreground flex gap-4">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{b.date}</span>
                        <span>{b.time}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{b.bookedBy}</span>
                      </div>
                    </div>
                    <Badge className={
                      b.status === "confirmed" ? "bg-green-100 text-green-800" :
                      b.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {b.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configuration options coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
