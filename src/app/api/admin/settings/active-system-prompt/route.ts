import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || !token.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/admin/settings/active-system-prompt`, {
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
    console.error('Error fetching active system prompt:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || !token.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { system_prompt_id } = await req.json()

  if (!system_prompt_id) {
    return NextResponse.json({ error: 'System prompt id is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/admin/settings/active-system-prompt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ system_prompt_id }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error }, { status: response.status })
    }

    return NextResponse.json({ message: 'System prompt activated successfully' }, { status: 201 })
  } catch (error) {
    console.error('Error activate system prompt:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}