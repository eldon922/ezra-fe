import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || !token.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/admin/users`, {
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
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || !token.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { username, password, isAdmin } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, isAdmin }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error }, { status: response.status })
    }

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || !token.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('id')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
    })

    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json({ error: data.error }, { status: response.status })
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}