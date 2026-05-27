import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/sign-in', '/sign-up'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
          'Google-Extended',
          'CCBot',
        ],
        allow: '/',
        disallow: ['/api/', '/sign-in', '/sign-up'],
      },
    ],
    sitemap: 'https://www.top-scorers.com/sitemap.xml',
    host: 'https://www.top-scorers.com',
  }
}
