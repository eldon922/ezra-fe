import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const token = await getToken({ req })

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 403 })
    }

    const filename = (await params).filename
    const response = await fetch(`${process.env.BACKEND_URL}/download/word/${filename}`, {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
    })

    const data = await response.arrayBuffer()

    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 