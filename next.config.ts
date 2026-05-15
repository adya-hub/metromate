import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Deployment Boundary:
   * This project follows a decoupled architecture.
   * - Frontend (Next.js): Deployed on Vercel.
   * - Backend (Express + GTFS): Deployed on AWS EC2.
   * 
   * The 'backend/' directory is excluded from Vercel builds via .vercelignore
   * and from TypeScript compilation via tsconfig.json.
   */
};

export default nextConfig;
