import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE = 'https://makeupcamilasoares.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Posts publicados
  const { data: posts } = await supabase
    .schema('makeup_camila')
    .from('posts')
    .select('slug, published_at, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  // Cursos publicados
  const { data: courses } = await supabase
    .schema('makeup_camila')
    .from('courses')
    .select('slug, updated_at')
    .eq('is_published', true)

  // Produtos publicados
  const { data: products } = await supabase
    .schema('makeup_camila')
    .from('products')
    .select('slug, updated_at')
    .eq('is_published', true)

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                    lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/sobre`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/servicos`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/portfolio`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/blog`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/cursos`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/produtos`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/parcerias`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contato`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  const postRoutes: MetadataRoute.Sitemap = (posts || []).map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at || p.published_at || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const courseRoutes: MetadataRoute.Sitemap = (courses || []).map(c => ({
    url: `${BASE}/cursos/${c.slug}`,
    lastModified: new Date(c.updated_at || new Date()),
    changeFrequency: 'monthly',
    priority: 0.85,
  }))

  const productRoutes: MetadataRoute.Sitemap = (products || []).map(p => ({
    url: `${BASE}/produtos/${p.slug}`,
    lastModified: new Date(p.updated_at || new Date()),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...postRoutes, ...courseRoutes, ...productRoutes]
}
