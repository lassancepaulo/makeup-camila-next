import { NextResponse } from 'next/server'
import Mux from '@mux/mux-node'

// GET /api/cursos/signed-url?playback_id=xxx&enrollment_id=yyy
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const playbackId = searchParams.get('playback_id')
  const enrollmentId = searchParams.get('enrollment_id')

  if (!playbackId) {
    return NextResponse.json({ error: 'playback_id obrigatório' }, { status: 400 })
  }

  // Se não tem MUX configurado ainda, retorna URL pública (desenvolvimento)
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    return NextResponse.json({
      url: `https://stream.mux.com/${playbackId}.m3u8`,
      embed: `https://player.mux.com/${playbackId}`,
    })
  }

  try {
    const mux = new Mux({
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET,
    })

    // Cria token assinado (expira em 4 horas)
    const token = await mux.jwt.signPlaybackId(playbackId, {
      type: 'video',
      expiration: '4h',
      params: {
        // Restringe ao domínio do site
        ...(process.env.NEXT_PUBLIC_SITE_URL && {
          aud: process.env.NEXT_PUBLIC_SITE_URL,
        }),
      },
    })

    return NextResponse.json({
      url: `https://stream.mux.com/${playbackId}.m3u8?token=${token}`,
      embed: `https://player.mux.com/${playbackId}?token=${token}`,
    })
  } catch (error) {
    console.error('Erro ao gerar Mux signed URL:', error)
    return NextResponse.json({ error: 'Erro ao gerar URL segura' }, { status: 500 })
  }
}
