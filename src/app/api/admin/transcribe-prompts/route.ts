import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || !token.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/admin/transcribe-prompts`, {
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
    console.error('Error fetching transcribe prompts:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || !token.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { version, prompt } = await req.json()

  if (!version || !prompt) {
    return NextResponse.json({ error: 'Version and prompt are required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/admin/transcribe-prompts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ version, prompt: prompt }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error }, { status: response.status })
    }

    return NextResponse.json({ message: 'Transcribe prompt created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Error creating transcribe prompt:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}