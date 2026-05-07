import { NextResponse } from 'next/server'
import { createClient } from '@insforge/sdk'

const SEED_SECRET = process.env.SEED_SECRET ?? 'purematch-seed-2026'

const db = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL ?? '',
  anonKey: process.env.INSFORGE_SERVICE_ROLE_KEY,
})

// ── Background dogs with anonymous fake owners ────────────────────────────────
const BACKGROUND_DOGS = [
  {
    name: 'Luna von Schwarzwald',
    breed: 'German Shepherd',
    age: '4 años',
    sex: 'Hembra' as const,
    zone: 'Vitacura',
    pedigree_number: 'KCC-2022-GS-00634',
    photos: ['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&h=1000&fit=crop'],
  },
  {
    name: 'Balto del Sur',
    breed: 'Husky Siberiano',
    age: '2 años',
    sex: 'Macho' as const,
    zone: 'Ñuñoa',
    pedigree_number: 'KCC-2024-HS-00311',
    photos: ['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&h=1000&fit=crop'],
  },
  {
    name: 'Bella di Milano',
    breed: 'Bulldog Inglés',
    age: '1 año',
    sex: 'Hembra' as const,
    zone: 'Las Condes',
    pedigree_number: null,
    photos: ['https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&h=1000&fit=crop'],
  },
  {
    name: 'Max vom Rhein',
    breed: 'German Shepherd',
    age: '5 años',
    sex: 'Macho' as const,
    zone: 'Providencia',
    pedigree_number: 'KCC-2020-GS-00192',
    photos: ['https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&h=1000&fit=crop'],
  },
  {
    name: 'Coco de Castilla',
    breed: 'Labrador Retriever',
    age: '3 años',
    sex: 'Hembra' as const,
    zone: 'La Reina',
    pedigree_number: 'KCC-2022-LR-00451',
    photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&h=1000&fit=crop'],
  },
]

// ── Real test accounts ────────────────────────────────────────────────────────
const TEST_ACCOUNTS = [
  {
    email: 'demo1@purematch.cl',
    password: 'PureMatch2026!',
    profile: { name: 'Alejandro von West', phone: '+56 9 9001 0001', zone: 'Las Condes' },
    dog: {
      name: 'Arya von Westwood',
      breed: 'Border Collie',
      age: '2 años',
      sex: 'Hembra' as const,
      zone: 'Las Condes',
      pedigree_number: 'KCC-2024-BC-00892',
      photos: ['https://images.unsplash.com/photo-1503256207526-0d5523f31ed4?w=800&h=1000&fit=crop'],
    },
  },
  {
    email: 'demo2@purematch.cl',
    password: 'PureMatch2026!',
    profile: { name: 'Valentina Torres', phone: '+56 9 9002 0002', zone: 'Providencia' },
    dog: {
      name: 'Thor of Golden Peak',
      breed: 'Golden Retriever',
      age: '3 años',
      sex: 'Macho' as const,
      zone: 'Providencia',
      pedigree_number: 'KCC-2023-GR-01147',
      photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=1000&fit=crop'],
    },
  },
]

async function upsertTestAccount(account: typeof TEST_ACCOUNTS[0], log: string[]) {
  let userId: string | null = null

  const { data: signUpData, error: signUpErr } = await db.auth.signUp({
    email: account.email,
    password: account.password,
  })

  if (signUpData?.user?.id) {
    userId = signUpData.user.id
    log.push(`Created auth account: ${account.email} (${userId})`)
  } else if (signUpErr) {
    // Already exists — sign in to get the id
    const { data: signInData, error: signInErr } = await db.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    })
    if (signInData?.user?.id) {
      userId = signInData.user.id
      log.push(`Auth account already exists: ${account.email} (${userId})`)
    } else {
      log.push(`ERROR ${account.email}: ${signInErr?.message ?? signUpErr?.message}`)
      return null
    }
  }

  if (!userId) return null

  await db.database.from('users').upsert({
    id: userId,
    name: account.profile.name,
    email: account.email,
    phone: account.profile.phone,
    zone: account.profile.zone,
    rut: null,
    avatar_url: null,
  })
  log.push(`Upserted profile: ${account.profile.name}`)

  // Remove existing dogs to avoid duplicates
  const { data: existingDogs } = await db.database.from('dogs').select('id').eq('owner_id', userId)
  if (existingDogs?.length) {
    await db.database.from('dogs').delete().eq('owner_id', userId)
    log.push(`Deleted ${existingDogs.length} old dog(s) for ${account.email}`)
  }

  const { data: dogRow } = await db.database.from('dogs').insert({
    owner_id: userId,
    ...account.dog,
  }).select('id').single()

  if (dogRow) {
    await db.database.from('dogs').update({ verified: true, score: 95 }).eq('id', dogRow.id)
    log.push(`Created dog "${account.dog.name}": ${dogRow.id}`)
    return { userId, dogId: dogRow.id as string }
  }

  return null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('secret') !== SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const log: string[] = []

  // ── Real test accounts ────────────────────────────────────────────────────
  const accountResults: Array<{ userId: string; dogId: string } | null> = []
  for (const account of TEST_ACCOUNTS) {
    accountResults.push(await upsertTestAccount(account, log))
  }
  const [acc1, acc2] = accountResults

  // ── Mutual match between demo1 and demo2 ─────────────────────────────────
  if (acc1 && acc2) {
    const { data: existing } = await db.database.from('matches').select('id')
      .or(`and(dog_a_id.eq.${acc1.dogId},dog_b_id.eq.${acc2.dogId}),and(dog_a_id.eq.${acc2.dogId},dog_b_id.eq.${acc1.dogId})`)
      .limit(1)
    if (!existing?.length) {
      await db.database.from('matches').insert({
        dog_a_id: acc1.dogId,
        dog_b_id: acc2.dogId,
        status_a: 'accepted',
        status_b: 'accepted',
        contact_unlocked: false,
      })
      log.push(`Mutual match: Arya <-> Thor`)
    } else {
      log.push(`Mutual match already exists`)
    }
  }

  // ── Background dogs with fake owner UUIDs ────────────────────────────────
  const bgDogIds: string[] = []
  for (let i = 0; i < BACKGROUND_DOGS.length; i++) {
    const dog = BACKGROUND_DOGS[i]
    const ownerId = crypto.randomUUID()

    await db.database.from('users').upsert({
      id: ownerId,
      name: `Criador ${i + 1}`,
      email: `criador${i + 1}@example.com`,
      phone: `+56 9 000${i + 1} 0000`,
      zone: dog.zone ?? 'Región Metropolitana',
      rut: null,
      avatar_url: null,
    })

    const { data: inserted } = await db.database.from('dogs').insert({
      owner_id: ownerId,
      ...dog,
    }).select('id').single()

    if (inserted) {
      await db.database.from('dogs').update({ verified: true, score: 88 + i }).eq('id', inserted.id)
      bgDogIds.push(inserted.id as string)
      log.push(`Background dog: ${dog.name} (${inserted.id})`)
    }
  }

  // Incoming pending request for demo1 (Luna sent interest in Arya)
  if (acc1 && bgDogIds[0]) {
    await db.database.from('matches').insert({
      dog_a_id: bgDogIds[0],
      dog_b_id: acc1.dogId,
      status_a: 'accepted',
      status_b: 'pending',
      contact_unlocked: false,
    })
    log.push(`Incoming request for Arya from Luna`)
  }

  // Sent-pending request from demo2 to Balto
  if (acc2 && bgDogIds[1]) {
    await db.database.from('matches').insert({
      dog_a_id: acc2.dogId,
      dog_b_id: bgDogIds[1],
      status_a: 'accepted',
      status_b: 'pending',
      contact_unlocked: false,
    })
    log.push(`Sent request from Thor to Balto`)
  }

  return NextResponse.json({
    ok: true,
    credentials: TEST_ACCOUNTS.map(a => ({ email: a.email, password: a.password })),
    log,
  })
}
