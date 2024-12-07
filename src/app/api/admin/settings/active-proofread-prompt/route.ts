import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || !token.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/admin/settings/active-proofread-prompt`, {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching active proofread prompt:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || !token.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { proofread_prompt_id } = await req.json()

  if (!proofread_prompt_id) {
    return NextResponse.json({ error: 'Proofread prompt id is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/admin/settings/active-proofread-prompt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proofread_prompt_id }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error }, { status: response.status })
    }

    return NextResponse.json({ message: 'Proofread prompt activated successfully' }, { status: 201 })
  } catch (error) {
    console.error('Error activate proofread prompt:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}