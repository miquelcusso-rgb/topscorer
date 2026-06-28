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
  async headers() {
    return [
      // Global security headers. Applied to every route EXCEPT /embed/* (the
      // negative lookahead) so the embeddable leaderboards below can opt out of
      // the frame restriction. NOTE: an enforcing Content-Security-Policy is
      // deliberately omitted for now — a strict policy would need a vetted
      // allowlist for Clerk, AdSense, Stripe, api-sports and Supabase, and
      // shipping it mid-World-Cup risks silently breaking auth/ads/checkout. To
      // be added behind a report-only audit once a report endpoint exists.
      {
        source: '/((?!embed).*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // /embed/* is iframe-friendly. Override the global frame deny so blogs and
      // partners can embed leaderboards.
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
