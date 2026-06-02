import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

// POST /api/pagamento/webhook — chamado pelo Mercado Pago ao confirmar pagamento
export async function POST(req: Request) {
  const body = await req.json()

  if (body.type !== 'payment') {
    return NextResponse.json({ ok: true })
  }

  const paymentId = body.data?.id
  if (!paymentId || !process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json({ ok: true })
  }

  try {
    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
    const paymentApi = new Payment(mp)
    const payment = await paymentApi.get({ id: paymentId })

    const courseId = payment.metadata?.course_id
    if (!courseId) return NextResponse.json({ ok: true })

    const supabase = await createClient()

    if (payment.status === 'approved') {
      // Registra/atualiza matrícula
      const { data: existing } = await supabase
        .schema('makeup_camila')
        .from('enrollments')
        .select('id')
        .eq('mp_payment_id', String(paymentId))
        .single()

      if (!existing) {
        await supabase.schema('makeup_camila').from('enrollments').insert({
          course_id: courseId,
          student_name: payment.payer?.first_name
            ? `${payment.payer.first_name} ${payment.payer.last_name || ''}`.trim()
            : 'Aluno',
          student_email: payment.payer?.email || '',
          student_phone: payment.payer?.phone?.number || null,
          mp_payment_id: String(paymentId),
          mp_status: 'approved',
          amount_paid: payment.transaction_amount,
        })
      }
    } else {
      // Atualiza status se já existe
      await supabase
        .schema('makeup_camila')
        .from('enrollments')
        .update({ mp_status: payment.status })
        .eq('mp_payment_id', String(paymentId))
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook MP error:', error)
    return NextResponse.json({ ok: true }) // Sempre 200 para o MP não retentar
  }
}
