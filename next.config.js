/** @type {(phase: string) => import('next').NextConfig} */
module.exports = (phase) => ({
  distDir: phase === "phase-development-server" ? ".next-dev" : ".next",
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com", "flagcdn.com"],
  },
});
