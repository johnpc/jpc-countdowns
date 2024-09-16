import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.johncorser.countdowns",
  appName: "jpc-countdown",
  webDir: "dist",
  ios: {
    contentInset: "always",
    backgroundColor: "#9b59b6",
  },
};

export default config;
