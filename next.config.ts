import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  turbopack: {},
  // Allowed remote image hosts. NOTE: news/headshot thumbnails are rendered with
  // plain `<img loading="lazy">` (not next/image) on purpose — routing them
  // through Vercel Image Optimization would incur image-transform usage on the
  // free tier for little gain (headshots are CDN-cached upstream; CC0 generics
  // are tiny self-hosted SVGs). These patterns let us opt into next/image later
  // without a config change.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.api-sports.io' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
  // /embed/* is iframe-friendly. Override the global frame deny so blogs and
  // partners can embed leaderboards. Everything else stays implicitly DENY.
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *;" },
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=3600' },
        ],
      },
    ]
  },
};

export default withSentryConfig(nextConfig, {
  org: "furiosa-studio",
  project: "topscorer",
  silent: true,
  widenClientFileUpload: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
});
