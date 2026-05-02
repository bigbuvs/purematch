import { NextResponse } from 'next/server'
import { createClient } from '@insforge/sdk'

const SEED_SECRET = 'purematch-seed-2026'

const db = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL ?? '',
  anonKey: process.env.INSFORGE_SERVICE_ROLE_KEY,
})

const DOGS = [
  {
    name: 'Arya von Westwood',
    breed: 'Border Collie',
    age: '2 años',
    sex: 'Hembra' as const,
    zone: 'Providencia, RM',
    pedigree_number: 'KCC-2024-BC-00892',
    photos: ['https://images.unsplash.com/photo-1589209534004-0c3ec3d8a9e5?w=800&h=1000&fit=crop'],
  },
  {
    name: 'Thor of Golden Peak',
    breed: 'Golden Retriever',
    age: '3 años',
    sex: 'Macho' as const,
    zone: 'Las Condes, RM',
    pedigree_number: 'KCC-2023-GR-01147',
    photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=1000&fit=crop'],
  },
  {
    name: 'Luna von Schwarzwald',
    breed: 'German Shepherd',
    age: '4 años',
    sex: 'Hembra' as const,
    zone: 'Vitacura, RM',
    pedigree_number: 'KCC-2022-GS-00634',
    photos: ['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&h=1000&fit=crop'],
  },
  {
    name: 'Balto del Sur',
    breed: 'Husky Siberiano',
    age: '2 años',
    sex: 'Macho' as const,
    zone: 'Ñuñoa, RM',
    pedigree_number: 'KCC-2024-HS-00311',
    photos: ['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&h=1000&fit=crop'],
  },
  {
    name: 'Bella di Milano',
    breed: 'Poodle',
    age: '1 año',
    sex: 'Hembra' as const,
    zone: 'Santiago Centro',
    pedigree_number: null,
    photos: ['https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=800&h=1000&fit=crop'],
  },
  {
    name: 'Max vom Rhein',
    breed: 'German Shepherd',
    age: '5 años',
    sex: 'Macho' as const,
    zone: 'Maipú, RM',
    pedigree_number: 'KCC-2020-GS-00192',
    photos: ['https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&h=1000&fit=crop'],
  },
  {
    name: 'Coco de Castilla',
    breed: 'Labrador Retriever',
    age: '3 años',
    sex: 'Hembra' as const,
    zone: 'La Florida, RM',
    pedigree_number: 'KCC-2022-LR-00451',
    photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&h=1000&fit=crop'],
  },
]

const MY_DOG = {
  name: 'Rex de Santiago',
  breed: 'Beagle',
  age: '2 años',
  sex: 'Macho' as const,
  zone: 'Providencia, RM',
  pedigree_number: 'KCC-2024-BG-00123',
  photos: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=1000&fit=crop'],
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('secret') !== SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const log: string[] = []

  // Find a@a.com user in users table
  const { data: userRows } = await db.database.from('users').select('id').eq('email', 'a@a.com').limit(1)
  let myUserId: string | null = userRows?.[0]?.id ?? null
  log.push(`a@a.com user in users table: ${myUserId ?? 'not found'}`)

  // If not in users table, try to find via auth (InsForge may expose this)
  // We'll create a placeholder if needed
  if (!myUserId) {
    // Insert a placeholder user row — auth ID will be linked when they log in
    const placeholder = crypto.randomUUID()
    await db.database.from('users').upsert({
      id: placeholder,
      name: 'Admin Demo',
      email: 'a@a.com',
      phone: '+56 9 0000 0001',
      zone: 'Región Metropolitana',
      rut: null,
      avatar_url: null,
    })
    myUserId = placeholder
    log.push(`Created placeholder user for a@a.com: ${placeholder}`)
  }

  // Clear existing demo dogs for a@a.com to avoid duplicates
  const { data: existingMyDogs } = await db.database.from('dogs').select('id').eq('owner_id', myUserId)
  if (existingMyDogs?.length) {
    await db.database.from('dogs').delete().eq('owner_id', myUserId)
    log.push(`Deleted ${existingMyDogs.length} existing dog(s) for a@a.com`)
  }

  // Create demo dog for a@a.com
  const { data: myDogRow, error: myDogErr } = await db.database.from('dogs').insert({
    owner_id: myUserId,
    ...MY_DOG,
  }).select('id').single()

  if (myDogErr || !myDogRow) {
    log.push(`Error creating my dog: ${myDogErr?.message}`)
    return NextResponse.json({ log, error: myDogErr?.message }, { status: 500 })
  }
  log.push(`Created dog for a@a.com: ${myDogRow.id}`)

  // Mark my dog as verified
  await db.database.from('dogs').update({ verified: true, score: 90 }).eq('id', myDogRow.id)

  // Create other dogs with unique fake owner IDs
  const createdDogIds: string[] = []
  const fakeOwnerIds = DOGS.map(() => crypto.randomUUID())

  for (let i = 0; i < DOGS.length; i++) {
    const dog = DOGS[i]
    const ownerId = fakeOwnerIds[i]

    // Create fake user entry
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
      await db.database.from('dogs').update({ verified: true, score: 90 + i }).eq('id', inserted.id)
      createdDogIds.push(inserted.id)
      log.push(`Created dog: ${dog.name} (${inserted.id})`)
    }
  }

  // Create 2 mutual matches between a@a.com's dog and first 2 other dogs
  const matchTargets = createdDogIds.slice(0, 2)
  for (const otherId of matchTargets) {
    const { data: existing } = await db.database.from('matches').select('id')
      .or(`and(dog_a_id.eq.${myDogRow.id},dog_b_id.eq.${otherId}),and(dog_a_id.eq.${otherId},dog_b_id.eq.${myDogRow.id})`)
      .limit(1)
    if (!existing?.length) {
      await db.database.from('matches').insert({
        dog_a_id: myDogRow.id,
        dog_b_id: otherId,
        status_a: 'accepted',
        status_b: 'accepted',
        contact_unlocked: false,
      })
      log.push(`Created mutual match: ${myDogRow.id} <-> ${otherId}`)
    }
  }

  // 1 pending match (a@a.com sent, other pending)
  if (createdDogIds[2]) {
    await db.database.from('matches').insert({
      dog_a_id: myDogRow.id,
      dog_b_id: createdDogIds[2],
      status_a: 'accepted',
      status_b: 'pending',
      contact_unlocked: false,
    })
    log.push(`Created pending match: ${myDogRow.id} -> ${createdDogIds[2]}`)
  }

  return NextResponse.json({ ok: true, log })
}
