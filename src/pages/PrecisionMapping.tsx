import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import InteractiveLocationViewer from '@/components/location/InteractiveLocationViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Satellite, 
  Navigation, 
  Home,
  Building2,
  Users,
  Target,
  Crosshair
} from 'lucide-react';

const PrecisionMapping = () => {
  const { language } = useAuth();

  const content = {
    en: {
      title: "Precision Location Mapping",
      subtitle: "High-accuracy location tracking and navigation for residential communities",
      features: {
        title: "Precision Features",
        items: [
          "Satellite imagery with building-level accuracy",
          "Color-coded housing phases and roof identification", 
          "Real-time occupancy and status tracking",
          "Unit-level navigation and addressing",
          "Interactive search and filtering",
          "Emergency location pinpointing"
        ]
      },
      stats: {
        title: "Community Overview",
        totalUnits: "Total Units",
        occupied: "Occupied", 
        vacant: "Vacant",
        facilities: "Facilities"
      },
      howToUse: {
        title: "How to Use",
        steps: [
          "Click on any house marker to see detailed information",
          "Use the search bar to find specific addresses or residents", 
          "Different colored markers represent different housing phases",
          "Zoom in for building-level precision navigation",
          "Click 'Navigate' in popups to get directions"
        ]
      }
    },
    ms: {
      title: "Pemetaan Lokasi Tepat",
      subtitle: "Penjejakan lokasi ketepatan tinggi dan navigasi untuk komuniti kediaman",
      features: {
        title: "Ciri-ciri Ketepatan", 
        items: [
          "Imejan satelit dengan ketepatan peringkat bangunan",
          "Fasa perumahan berkod warna dan pengenalan bumbung",
          "Penjejakan penghunian dan status masa nyata", 
          "Navigasi dan alamat peringkat unit",
          "Carian dan penapisan interaktif",
          "Penentuan lokasi kecemasan tepat"
        ]
      },
      stats: {
        title: "Gambaran Komuniti",
        totalUnits: "Jumlah Unit",
        occupied: "Dihuni",
        vacant: "Kosong", 
        facilities: "Kemudahan"
      },
      howToUse: {
        title: "Cara Menggunakan",
        steps: [
          "Klik pada mana-mana penanda rumah untuk melihat maklumat terperinci",
          "Gunakan bar carian untuk mencari alamat atau penduduk tertentu",
          "Penanda berwarna berbeza mewakili fasa perumahan yang berbeza", 
          "Zum masuk untuk navigasi ketepatan peringkat bangunan",
          "Klik 'Navigate' dalam popup untuk mendapatkan arah"
        ]
      }
    }
  };

  const t = content[language as keyof typeof content];

  const handleLocationSelect = (location: any) => {
    console.log('Selected location:', location);
  };

  // Community statistics based on the aerial view
  const communityStats = [
    { label: t.stats.totalUnits, value: 156, icon: Home, color: "text-blue-600" },
    { label: t.stats.occupied, value: 142, icon: Users, color: "text-green-600" },
    { label: t.stats.vacant, value: 12, icon: Home, color: "text-yellow-600" },
    { label: t.stats.facilities, value: 8, icon: Building2, color: "text-purple-600" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Crosshair className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">{t.title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.subtitle}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Satellite className="h-3 w-3" />
            Satellite View
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            Building Precision
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Navigation className="h-3 w-3" />
            Real-time Navigation
          </Badge>
        </div>
      </div>

      {/* Community Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {communityStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Map */}
        <div className="lg:col-span-2">
          <InteractiveLocationViewer
            imageUrl="/lovable-uploads/0709b4db-2289-4ac3-a185-7de4c3dce5b0.png"
            locations={[]}
            title="Precision Community Mapping"
            showSearch={true}
          />
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t.features.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {t.features.items.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* How to Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t.howToUse.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {t.howToUse.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Navigation className="h-4 w-4 mr-2" />
                Navigate to Main Gate
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                View Community Hall
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Find Neighbors
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Community Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Phase 1 (Orange Roofs):</strong> Premium units with larger floor plans, 
                located in the northern section with garden views.
              </p>
              <p>
                <strong>Phase 2 (Red Roofs):</strong> Standard family homes in the central area, 
                close to community facilities and main roads.
              </p>
              <p>
                <strong>Phase 3 (Grey Roofs):</strong> Compact homes designed for young families, 
                strategically positioned near the playground and security checkpoint.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Map Accuracy:</span>
                <span className="font-medium">±1 meter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zoom Levels:</span>
                <span className="font-medium">1-22 (Building Level)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Update Frequency:</span>
                <span className="font-medium">Real-time</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coverage:</span>
                <span className="font-medium">Full Community</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrecisionMapping;