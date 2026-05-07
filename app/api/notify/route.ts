import { NextResponse } from 'next/server'
import { createClient } from '@insforge/sdk'

const db = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL ?? '',
  anonKey: process.env.INSFORGE_SERVICE_ROLE_KEY,
})

// Called when a match request is sent: notifies the other dog's owner by email
export async function POST(request: Request) {
  try {
    const { matchId, senderDogId, receiverDogId } = await request.json()
    if (!matchId || !senderDogId || !receiverDogId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    // Verify the match actually exists and the dog IDs match — prevents spam via arbitrary IDs
    const { data: match } = await db.database.from('matches').select('dog_a_id, dog_b_id').eq('id', matchId).single()
    const validPair = match && (
      (match.dog_a_id === senderDogId && match.dog_b_id === receiverDogId) ||
      (match.dog_b_id === senderDogId && match.dog_a_id === receiverDogId)
    )
    if (!validPair) return NextResponse.json({ error: 'Invalid match' }, { status: 403 })

    // Get sender dog info
    const { data: senderDog } = await db.database.from('dogs').select('name, breed').eq('id', senderDogId).single()
    // Get receiver dog + owner info
    const { data: receiverDog } = await db.database.from('dogs').select('name, owner_id').eq('id', receiverDogId).single()
    if (!receiverDog) return NextResponse.json({ ok: true, skipped: 'receiver not found' })

    const { data: owner } = await db.database.from('users').select('name, email').eq('id', receiverDog.owner_id).single()
    if (!owner?.email) return NextResponse.json({ ok: true, skipped: 'no email' })

    // Send email via Resend (configure RESEND_API_KEY in Vercel env vars to activate)
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'PureMatch <notificaciones@purematch.cl>',
          to: owner.email,
          subject: `${senderDog?.name ?? 'Un perro'} quiere hacer match con ${receiverDog.name}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1b1c1c;">
              <div style="background: #061b0e; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #fed488; font-size: 22px; margin: 0;">PureMatch</h1>
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; margin: 4px 0 0; letter-spacing: 0.1em;">REGISTRO DIGITAL DE LINAJE CANINO</p>
              </div>
              <div style="background: #fff; border: 1px solid #e4e2e1; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px;">
                <p style="font-size: 15px; margin: 0 0 12px;">Hola <strong>${owner.name}</strong>,</p>
                <p style="font-size: 14px; color: #737973; line-height: 1.6; margin: 0 0 20px;">
                  <strong style="color: #061b0e;">${senderDog?.name ?? 'Un ejemplar'}</strong>
                  (${senderDog?.breed ?? ''}) ha enviado una solicitud de match para
                  <strong style="color: #061b0e;">${receiverDog.name}</strong>.
                </p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://purematch-app.vercel.app'}/matches"
                   style="display: inline-block; background: #061b0e; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 12px; font-weight: bold; letter-spacing: 0.08em;">
                  VER SOLICITUD
                </a>
                <p style="font-size: 11px; color: #a0a5a0; margin: 24px 0 0; line-height: 1.5;">
                  Si aceptas, ambas partes podrán desbloquear el contacto del criador.<br/>
                  Este correo es automático, por favor no respondas.
                </p>
              </div>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ ok: true, to: owner.email })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
