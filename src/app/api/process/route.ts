import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function POST(req: NextRequest) {
  const token = await getToken({ req })

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const formData = await req.formData()

  const response = await fetch(`${process.env.BACKEND_URL}/process`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.accessToken}`,
      'Connection': 'keep-alive', 
      'Keep-Alive': 'timeout=0, max=0'
    },
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json({ error: data.error }, { status: response.status })
  }

  return NextResponse.json(data)
}