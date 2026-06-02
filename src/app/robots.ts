import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    ],
    sitemap: 'https://makeupcamilasoares.com/sitemap.xml',
    host: 'https://makeupcamilasoares.com',
  }
}
