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
    // Escáner de links de Microsoft Outlook (SafeLinks) ejecutando la página:
    // firma conocidísima "Object Not Found Matching Id:N, MethodName:update".
    // No es código nuestro — no existe en el bundle. Ruido de bot puro.
    /Object Not Found Matching Id/,
  ],
});

// Captura las transiciones de navegación del App Router (v10)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
