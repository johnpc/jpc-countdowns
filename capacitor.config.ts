import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.johncorser.countdowns",
  appName: "jpc.countdowns",
  server: {
    hostname: "countdowns.jpc.io",
    androidScheme: "https",
  },
  webDir: "dist",
  ios: {
    contentInset: "always",
    backgroundColor: "#9b59b6",
  },
};

export default config;
