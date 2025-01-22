import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || !token.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const response = await fetch(`${process.env.BACKEND_URL}/admin/transcriptions`, {
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

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || !token.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const transcriptionId = searchParams.get('id')

  if (!transcriptionId) {
    return NextResponse.json({ error: 'Transcription ID is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/admin/transcriptions/${transcriptionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
    })

    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json({ error: data.error }, { status: response.status })
    }

    return NextResponse.json({ message: 'Transcription deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting transcription:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}