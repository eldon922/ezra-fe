import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || !token.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const response = await fetch(`${process.env.BACKEND_URL}/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${token.accessToken}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json({ error: data.error }, { status: response.status })
  }

  return NextResponse.json(data)
}