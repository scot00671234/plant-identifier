import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.plantidentifier_aiplantid',
  appName: 'Plant Identifier - AI Plant ID',
  webDir: 'dist/public',
  server: {
    // Points to your Vercel deployment
    url: 'https://plant-identifier-alpha.vercel.app'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
