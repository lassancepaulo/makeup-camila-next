import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://makeupcamilasoares.com'

// GET /api/pagamento/checkout?course_id=xxx
// Cria preferência no Mercado Pago e redireciona para o checkout
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('course_id')

  if (!courseId) {
    return NextResponse.json({ error: 'course_id obrigatório' }, { status: 400 })
  }

  const supabase = await createClient()

  // Busca o curso
  const { data: course, error } = await supabase
    .schema('makeup_camila')
    .from('courses')
    .select('id, title, description, thumbnail_url, price, price_promo, slug')
    .eq('id', courseId)
    .eq('is_published', true)
    .single()

  if (error || !course) {
    return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
  }

  const price = course.price_promo || course.price

  // Se Mercado Pago não está configurado, mostra página de espera
  if (!process.env.MP_ACCESS_TOKEN) {
    return NextResponse.redirect(`${SITE_URL}/cursos/${course.slug}?checkout=pending`)
  }

  try {
    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
    const preference = new Preference(mp)

    const pref = await preference.create({
      body: {
        items: [{
          id: course.id,
          title: course.title,
          description: course.description || `Curso online: ${course.title}`,
          picture_url: course.thumbnail_url || undefined,
          category_id: 'education',
          quantity: 1,
          unit_price: price,
          currency_id: 'BRL',
        }],
        back_urls: {
          success: `${SITE_URL}/api/pagamento/sucesso?course_id=${course.id}`,
          failure: `${SITE_URL}/cursos/${course.slug}?checkout=failed`,
          pending: `${SITE_URL}/cursos/${course.slug}?checkout=pending`,
        },
        auto_return: 'approved',
        notification_url: `${SITE_URL}/api/pagamento/webhook`,
        statement_descriptor: 'CAMILA SOARES',
        payment_methods: {
          installments: 12,
          excluded_payment_types: [],
        },
        metadata: { course_id: course.id, course_slug: course.slug },
      },
    })

    // Redireciona para o checkout do Mercado Pago
    return NextResponse.redirect(pref.init_point!)
  } catch (error) {
    console.error('Erro ao criar preferência MP:', error)
    return NextResponse.json({ error: 'Erro ao iniciar pagamento' }, { status: 500 })
  }
}
