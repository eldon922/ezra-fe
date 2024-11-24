'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type Transcription = {
  id: number
  user_id: number
  created_at: string
  word_document_path: string
  status: 'completed' | 'error'
  error_message: string | null
}

export default function Dashboard() {
  const { status } = useSession()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [driveLink, setDriveLink] = useState('')
  const [transcriptions, setTranscriptions] = useState<Array<Transcription>>([])
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    console.log(status)
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchTranscriptions()
    }
  }, [status, router])

  const fetchTranscriptions = async () => {
    try {
      const response = await fetch('/api/transcriptions')
      if (!response.ok) {
        throw new Error('Failed to fetch transcriptions')
      }
      const data = await response.json()
      setTranscriptions(data)
    } catch (error) {
      setError('' + error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsProcessing(true)

    const formData = new FormData()
    if (file) {
      formData.append('file', file)
    } else if (driveLink) {
      formData.append('drive_link', driveLink)
    } else {
      setError('Please provide an audio file or Google Drive link')
      setIsProcessing(false)
      return
    }

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process audio')
      }

      await fetchTranscriptions()
      setFile(null)
      setDriveLink('')
    } catch (error) {
      setError('' + error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Audio for Transcription</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="file">Audio File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept="audio/*"
              />
            </div>
            <div>
              <Label htmlFor="driveLink">Google Drive Link</Label>
              <Input
                id="driveLink"
                type="text"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/..."
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transcription History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transcriptions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {/* {item.status === 'completed' ? ( */}
                      <a href={`/api/download/${item.word_document_path}`} className="text-blue-500 hover:underline">
                        Download
                      </a>
                    {/* ) : (
                      'N/A'
                    )} */}
                  </TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}