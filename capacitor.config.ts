import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.video.recording.app',
  appName: 'recording',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    webContentsDebuggingEnabled: true
  }
};

export default config;
