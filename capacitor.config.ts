import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.plantid',
  appName: 'PlantID',
  webDir: 'dist/public',
  server: {
    // For development - points to your Replit
    url: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : undefined
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
