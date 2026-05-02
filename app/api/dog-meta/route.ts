import { NextResponse } from 'next/server'
import { createClient } from '@insforge/sdk'

const db = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL ?? '',
  anonKey: process.env.INSFORGE_SERVICE_ROLE_KEY,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data: dog } = await db.database
    .from('dogs')
    .select('name, breed, age, sex, zone, photos')
    .eq('id', id)
    .single()

  if (!dog) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    name: dog.name,
    breed: dog.breed,
    age: dog.age,
    sex: dog.sex,
    zone: dog.zone,
    photo: (dog.photos as string[])?.[0] ?? null,
  })
}
