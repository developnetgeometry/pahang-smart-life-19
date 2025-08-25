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
    'communication': 'Communication Hub',
    'announcements': 'Announcements',
    'discussions': 'Discussions',
    'servicesAndFacilities': 'Services & Facilities',
    'facilities': 'Facilities',
    'marketplace': 'Marketplace',
    'cctvLiveFeed': 'CCTV Live Feed',
    'notificationSettings': 'Notification Settings',
    'administration': 'Administration',
    'userManagement': 'User Management',
    'communityManagement': 'Community Management',
    'districtManagement': 'District Management',
    'operations': 'Operations',
    'facilitiesManagement': 'Facilities Management',
    'maintenanceManagement': 'Maintenance Management',
    'complaintsManagement': 'Complaints Management',
    'securityAndMonitoring': 'Security & Monitoring',
    'panicAlerts': 'Panic Alerts',
    'securityDashboard': 'Security Dashboard',
    'cctvManagement': 'CCTV Management',
    'smartMonitoring': 'Smart Monitoring',
    'visitorSecurity': 'Visitor Security',
    'visitorAnalytics': 'Visitor Analytics',
    'sensorManagement': 'Sensor Management',
    'communicationManagement': 'Communication Management',
    'announcementManagement': 'Announcement Management',
    'discussionManagement': 'Discussion Management',
    'roleManagement': 'Role & Service Management',
    'roleApprovalAuthority': 'Role Approval Authority',
    'serviceProviders': 'Service Providers',

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
    
    // Communication & Chat
    'chats': 'Chats',
    'newChat': 'New Chat',
    'newGroup': 'New Group',
    'searchChats': 'Search chats...',
    'loadingChats': 'Loading chats...',
    'noChatsFound': 'No chats found',
    'startVideoCall': 'Start video call',
    'loadingMessages': 'Loading messages...',
    'noMessagesYet': 'No messages yet',
    'editMessage': 'Edit message...',
    'typeAMessage': 'Type a message...',
    'selectChatToStart': 'Select a chat to start messaging',
    'uploadFile': 'Upload File',
    'notifications': 'Notifications',
    'markAllRead': 'Mark all read',
    'loadingNotifications': 'Loading notifications...',
    'noNotificationsYet': 'No notifications yet',
    'high': 'High',
    'viewAllNotifications': 'View all notifications',
    
    // Activities & Announcements
    'viewDetails': 'View Details',
    'loadingActivities': 'Loading activities...',
    'noActivitiesAvailable': 'No activities available',
    'description': 'Description',
    'date': 'Date',
    'time': 'Time',
    'location': 'Location',
    
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
    'notificationSettings': 'Tetapan Notifikasi',
    'administration': 'Pentadbiran',
    'userManagement': 'Pengurusan Pengguna',
    'communityManagement': 'Pengurusan Komuniti',
    'districtManagement': 'Pengurusan Daerah',
    'operations': 'Operasi',
    'facilitiesManagement': 'Pengurusan Kemudahan',
    'maintenanceManagement': 'Pengurusan Penyelenggaraan',
    'complaintsManagement': 'Pengurusan Aduan',
    'securityAndMonitoring': 'Keselamatan & Pemantauan',
    'panicAlerts': 'Amaran Panik',
    'securityDashboard': 'Papan Pemuka Keselamatan',
    'cctvManagement': 'Pengurusan CCTV',
    'smartMonitoring': 'Pemantauan Pintar',
    'visitorSecurity': 'Keselamatan Pelawat',
    'visitorAnalytics': 'Analitik Pelawat',
    'sensorManagement': 'Pengurusan Sensor',
    'communication': 'Pusat Komunikasi',
    'communicationManagement': 'Pengurusan Komunikasi',
    'announcementManagement': 'Pengurusan Pengumuman',
    'discussionManagement': 'Pengurusan Perbincangan',
    'roleManagement': 'Pengurusan Peranan & Perkhidmatan',
    'roleApprovalAuthority': 'Kuasa Kelulusan Peranan',
    'serviceProviders': 'Penyedia Perkhidmatan',

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
    
    // Communication & Chat
    'chats': 'Sembang',
    'newChat': 'Sembang Baru',
    'newGroup': 'Kumpulan Baru',
    'searchChats': 'Cari sembang...',
    'loadingChats': 'Memuatkan sembang...',
    'noChatsFound': 'Tiada sembang dijumpai',
    'startVideoCall': 'Mula panggilan video',
    'loadingMessages': 'Memuatkan mesej...',
    'noMessagesYet': 'Belum ada mesej',
    'editMessage': 'Edit mesej...',
    'typeAMessage': 'Taip mesej...',
    'selectChatToStart': 'Pilih sembang untuk mula berkirim mesej',
    'uploadFile': 'Muat Naik Fail',
    'notifications': 'Notifikasi',
    'markAllRead': 'Tandai semua dibaca',
    'loadingNotifications': 'Memuat notifikasi...',
    'noNotificationsYet': 'Belum ada notifikasi',
    'high': 'Tinggi',
    'viewAllNotifications': 'Lihat semua notifikasi',
    
    // Activities & Announcements
    'viewDetails': 'Lihat Butiran',
    'loadingActivities': 'Memuatkan aktiviti...',
    'noActivitiesAvailable': 'Tiada aktiviti tersedia',
    'description': 'Penerangan',
    'date': 'Tarikh',
    'time': 'Masa',
    'location': 'Lokasi',
    
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