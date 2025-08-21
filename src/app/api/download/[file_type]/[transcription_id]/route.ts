import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ file_type: string, transcription_id: string}> }
) {
  try {
    const token = await getToken({ req })

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 403 })
    }
    const file_type = (await params).file_type
    const transcription_id = (await params).transcription_id
    const response = await fetch(`${process.env.BACKEND_URL}/download/${file_type}/${transcription_id}`, {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
    })

    return response
  } catch (error) {
    console.error('Download error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 