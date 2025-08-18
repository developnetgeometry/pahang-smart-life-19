export type Language = 'en' | 'ms';

export const translations = {
  en: {
    // Navigation
    'dashboard': 'Dashboard',
    'myActivities': 'My Activities',
    'myBookings': 'My Bookings',
    'myVisitors': 'My Visitors',
    'myComplaints': 'My Complaints',
    'myProfile': 'My Profile',
    'communityHub': 'Community Hub',
    'announcements': 'Announcements',
    'discussions': 'Discussions',
    'servicesAndFacilities': 'Services & Facilities',
    'facilities': 'Facilities',
    'marketplace': 'Marketplace',
    'cctvLiveFeed': 'CCTV Live Feed',
    'administration': 'Administration',
    'userManagement': 'User Management',
    'communityManagement': 'Community Management',
    'districtManagement': 'District Management',
    'operations': 'Operations',
    'facilitiesManagement': 'Facilities Management',
    'maintenanceManagement': 'Maintenance Management',
    'complaintsManagement': 'Complaints Management',
    'securityAndMonitoring': 'Security & Monitoring',
    'securityDashboard': 'Security Dashboard',
    'cctvManagement': 'CCTV Management',
    'visitorSecurity': 'Visitor Security',
    'visitorAnalytics': 'Visitor Analytics',
    'sensorManagement': 'Sensor Management',
    'communication': 'Communication',

    // Common
    'welcome': 'Welcome',
    'login': 'Login',
    'logout': 'Logout',
    'save': 'Save',
    'cancel': 'Cancel',
    'submit': 'Submit',
    'search': 'Search',
    'filter': 'Filter',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'noData': 'No data available',
    
    // Authentication
    'email': 'Email',
    'password': 'Password',
    'forgotPassword': 'Forgot Password?',
    'signIn': 'Sign In',
    'signUp': 'Sign Up',
    
    // Dashboard
    'title': 'Dashboard',
    'welcomeBack': 'Welcome back',
    'overview': 'Overview',
    'recentActivity': 'Recent Activity',
    'quickActions': 'Quick Actions',
    'weather': 'Weather',
    'panicButton': 'Emergency Alert',
    
    // Profile
    'profileTitle': 'My Profile',
    'personalInfo': 'Personal Information',
    'contactInfo': 'Contact Information',
    'emergencyContact': 'Emergency Contact',
    'vehicleInfo': 'Vehicle Information',
    'preferences': 'Preferences',
    
    // View Roles
    'residentView': 'Resident View',
    'professionalView': 'Professional View',
    'switchView': 'Switch View',
    
    // Language & Theme
    'english': 'English',
    'malay': 'Bahasa Malaysia',
    'lightTheme': 'Light',
    'darkTheme': 'Dark',
    
    // System
    'smartCommunity': 'Integrated Smart City System',
    'pahangState': 'Pahang State',
    'poweredBy': 'Powered by Smart City Initiative'
  },
  ms: {
    // Navigation
    'dashboard': 'Papan Pemuka',
    'myActivities': 'Aktiviti Saya',
    'myBookings': 'Tempahan Saya',
    'myVisitors': 'Pelawat Saya',
    'myComplaints': 'Aduan Saya',
    'myProfile': 'Profil Saya',
    'communityHub': 'Hub Komuniti',
    'announcements': 'Pengumuman',
    'discussions': 'Perbincangan',
    'servicesAndFacilities': 'Perkhidmatan & Kemudahan',
    'facilities': 'Kemudahan',
    'marketplace': 'Pasar Maya',
    'cctvLiveFeed': 'Siaran Langsung CCTV',
    'administration': 'Pentadbiran',
    'userManagement': 'Pengurusan Pengguna',
    'communityManagement': 'Pengurusan Komuniti',
    'districtManagement': 'Pengurusan Daerah',
    'operations': 'Operasi',
    'facilitiesManagement': 'Pengurusan Kemudahan',
    'maintenanceManagement': 'Pengurusan Penyelenggaraan',
    'complaintsManagement': 'Pengurusan Aduan',
    'securityAndMonitoring': 'Keselamatan & Pemantauan',
    'securityDashboard': 'Papan Pemuka Keselamatan',
    'cctvManagement': 'Pengurusan CCTV',
    'visitorSecurity': 'Keselamatan Pelawat',
    'visitorAnalytics': 'Analitik Pelawat',
    'sensorManagement': 'Pengurusan Sensor',
    'communication': 'Komunikasi',

    // Common
    'welcome': 'Selamat Datang',
    'login': 'Log Masuk',
    'logout': 'Log Keluar',
    'save': 'Simpan',
    'cancel': 'Batal',
    'submit': 'Hantar',
    'search': 'Cari',
    'filter': 'Tapis',
    'loading': 'Memuatkan...',
    'error': 'Ralat',
    'success': 'Berjaya',
    'noData': 'Tiada data tersedia',
    
    // Authentication
    'email': 'Emel',
    'password': 'Kata Laluan',
    'forgotPassword': 'Lupa Kata Laluan?',
    'signIn': 'Log Masuk',
    'signUp': 'Daftar',
    
    // Dashboard
    'title': 'Papan Pemuka',
    'welcomeBack': 'Selamat kembali',
    'overview': 'Ringkasan',
    'recentActivity': 'Aktiviti Terkini',
    'quickActions': 'Tindakan Pantas',
    'weather': 'Cuaca',
    'panicButton': 'Amaran Kecemasan',
    
    // Profile
    'profileTitle': 'Profil Saya',
    'personalInfo': 'Maklumat Peribadi',
    'contactInfo': 'Maklumat Hubungan',
    'emergencyContact': 'Hubungan Kecemasan',
    'vehicleInfo': 'Maklumat Kenderaan',
    'preferences': 'Keutamaan',
    
    // View Roles
    'residentView': 'Pandangan Penduduk',
    'professionalView': 'Pandangan Profesional',
    'switchView': 'Tukar Pandangan',
    
    // Language & Theme
    'english': 'Bahasa Inggeris',
    'malay': 'Bahasa Malaysia',
    'lightTheme': 'Terang',
    'darkTheme': 'Gelap',
    
    // System
    'smartCommunity': 'Sistem Bandar Pintar Bersepadu',
    'pahangState': 'Negeri Pahang',
    'poweredBy': 'Dikuasakan oleh Inisiatif Bandar Pintar'
  }
};

export function useTranslation(language: Language = 'ms') {
  return {
    t: (key: string): string => {
      const langTranslations = translations[language] || translations['ms'];
      let value: any = langTranslations[key];
      
      if (value === undefined) {
        // Try fallback language
        const fallbackTranslations = translations[language === 'en' ? 'ms' : 'en'];
        let fallbackValue: any = fallbackTranslations[key];
        return typeof fallbackValue === 'string' ? fallbackValue : key;
      }
      
      return typeof value === 'string' ? value : key;
    }
  };
}