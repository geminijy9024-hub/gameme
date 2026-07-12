import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gameme.kotobatower",
  appName: "Kotoba Tower",
  webDir: "dist",
  android: { allowMixedContent: false, backgroundColor: "#080b18" },
  plugins: { SplashScreen: { launchShowDuration: 1200, backgroundColor: "#080b18", showSpinner: false } }
};

export default config;
