import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
  ignoreErrors: [
    // Ruido de terceros (AdSense/gtag/extensiones del navegador): una promesa
    // rechazada con `undefined`, sin stack accionable. No es un bug de la app.
    "Non-Error promise rejection captured with value: undefined",
  ],
});

// Captura las transiciones de navegación del App Router (v10)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
