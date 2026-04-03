import { NextResponse } from 'next/server'

// Questions are now served from the pre-built bank in lib/macetes.ts.
// This endpoint is no longer used.
export async function POST() {
  return NextResponse.json({ error: 'Endpoint removido. Questões servidas localmente.' }, { status: 410 })
}
