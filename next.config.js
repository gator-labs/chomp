// Required dependencies
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const { withSentryConfig } = require("@sentry/nextjs");

// Sentry configuration options
const sentryWebpackOptions = {
  org: "gator-labs",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Add new options from injected config
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

// Next.js configuration options
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    missingSuspenseWithCSRBailout: false,
    serverActions: {
      bodySizeLimit: "3mb",
    },
    serverComponentsExternalPackages: ["@aws-sdk"],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/application",
        permanent: true,
      },
      {
        source: "/campaigns",
        destination: "/stacks",
        permanent: true,
      },
      {
        source: "/campaigns/:slug",
        destination: "/stacks/:slug",
        permanent: true,
      },
      {
        source: "/application/decks",
        destination: "/application",
        permanent: true,
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

// Combine PWA and Sentry configurations
module.exports = withSentryConfig(withPWA(nextConfig), sentryWebpackOptions);
