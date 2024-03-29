import withPWA from "next-pwa";

/** @type {import('next-pwa').PWAConfig} */
const pwaConfig = {};

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA(pwaConfig)(nextConfig);
