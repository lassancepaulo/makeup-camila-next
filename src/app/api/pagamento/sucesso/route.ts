import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://makeupcamilasoares.com'

// GET /api/pagamento/sucesso?course_id=xxx&payment_id=yyy&status=approved
// Redireciona o aluno para a área do curso após pagamento aprovado
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('course_id')
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')

  if (status !== 'approved' || !courseId) {
    return NextResponse.redirect(`${SITE_URL}/cursos`)
  }

  const supabase = await createClient()

  // Busca o curso para pegar o slug
  const { data: course } = await supabase
    .schema('makeup_camila')
    .from('courses')
    .select('slug')
    .eq('id', courseId)
    .single()

  // Busca a matrícula pelo payment_id
  const { data: enrollment } = await supabase
    .schema('makeup_camila')
    .from('enrollments')
    .select('id')
    .eq('mp_payment_id', paymentId || '')
    .single()

  if (course && enrollment) {
    // Redireciona para área do aluno com token de acesso (enrollment ID)
    return NextResponse.redirect(
      `${SITE_URL}/cursos/${course.slug}/assistir?token=${enrollment.id}`
    )
  }

  return NextResponse.redirect(`${SITE_URL}/cursos`)
}
