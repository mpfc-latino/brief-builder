import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the CJS-heavy googleapis package out of the bundle (server-only).
  serverExternalPackages: ["googleapis"],
};

export default nextConfig;
