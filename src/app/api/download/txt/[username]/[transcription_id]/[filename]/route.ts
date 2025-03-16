import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string, transcription_id: string, filename: string }> }
) {
  try {
    const token = await getToken({ req })

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 403 })
    }

    const username = (await params).username
    const transcription_id = (await params).transcription_id
    const filename = (await params).filename
    const response = await fetch(`${process.env.BACKEND_URL}/download/user-files/txt/${username}/${transcription_id}/${filename}`, {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
    })

    const data = await response.arrayBuffer()

    return new NextResponse(data, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 