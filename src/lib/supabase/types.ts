export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_url: string | null
  category: string
  tags: string[] | null
  status: 'draft' | 'published' | 'archived'
  source_url: string | null
  source_name: string | null
  seo_title: string | null
  seo_desc: string | null
  published_at: string | null
  created_at: string
}

export type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  trailer_url: string | null
  price: number
  price_promo: number | null
  level: 'iniciante' | 'intermediario' | 'avancado'
  duration_min: number
  is_published: boolean
  certificate: boolean
  created_at: string
}

export type Module = {
  id: string
  course_id: string
  title: string
  position: number
}

export type Lesson = {
  id: string
  module_id: string
  title: string
  description: string | null
  mux_asset_id: string | null
  mux_playback_id: string | null
  duration_sec: number
  is_free: boolean
  position: number
}

export type Enrollment = {
  id: string
  course_id: string
  student_name: string
  student_email: string
  student_phone: string | null
  mp_payment_id: string | null
  mp_status: string | null
  amount_paid: number | null
  enrolled_at: string
}

export type Product = {
  id: string
  title: string
  slug: string
  description: string | null
  images: string[] | null
  price: number | null
  stock: number
  type: 'proprio' | 'afiliado'
  affiliate_url: string | null
  category: string | null
  is_published: boolean
  is_featured: boolean
}

export type Portfolio = {
  id: string
  title: string | null
  image_url: string
  category: string
  is_featured: boolean
  position: number
  created_at: string
}

export type Service = {
  id: string
  title: string
  slug: string
  description: string | null
  icon: string | null
  is_featured: boolean
  position: number
}

export type Partnership = {
  id: string
  brand_name: string
  logo_url: string | null
  website_url: string | null
  description: string | null
  is_active: boolean
  position: number
}

export type Campaign = {
  id: string
  title: string
  slug: string
  headline: string | null
  subheadline: string | null
  content: string | null
  cta_label: string
  cta_wa_msg: string | null
  cover_url: string | null
  is_active: boolean
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
}

export type Lead = {
  id: string
  name: string
  email: string | null
  phone: string | null
  service: string | null
  event_date: string | null
  message: string | null
  source: string | null
  utm_data: Record<string, string> | null
  created_at: string
}

export type Testimonial = {
  id: string
  name: string
  role: string | null
  text: string
  rating: number
  avatar_url: string | null
  is_featured: boolean
  position: number
}

export type NewsQueue = {
  id: string
  raw_title: string
  raw_content: string | null
  raw_url: string | null
  source_name: string | null
  ai_title: string | null
  ai_slug: string | null
  ai_excerpt: string | null
  ai_content: string | null
  ai_seo_desc: string | null
  ai_tags: string[] | null
  cover_url: string | null
  status: 'pending' | 'approved' | 'rejected' | 'published'
  fetched_at: string
  reviewed_at: string | null
}
