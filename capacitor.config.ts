import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.83fed62382294f3d9b9e121eed0d3bab',
  appName: 'pahang-smart-life-19',
  webDir: 'dist',
  server: {
    url: 'https://83fed623-8229-4f3d-9b9e-121eed0d3bab.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;