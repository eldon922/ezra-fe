'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from '@/hooks/use-toast'
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
  const { toast } = useToast()
  const { status } = useSession()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [driveLink, setDriveLink] = useState('')
  const [transcriptions, setTranscriptions] = useState<Array<Transcription>>([])
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
        const data = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error,
        })
        return
      }
      const data = await response.json()
      setTranscriptions(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching transcriptions",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    const formData = new FormData()
    if (file) {
      formData.append('file', file)
    } else if (driveLink) {
      formData.append('drive_link', driveLink)
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide an audio file or Google Drive link",
      })
      setIsProcessing(false)
      return
    }

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error,
        })
        return
      }

      toast({
        title: "Success",
        description: "Audio processing started successfully",
      })

      await fetchTranscriptions()
      setFile(null)
      setDriveLink('')
    } catch (error) {
      console.log(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while processing the audio",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <Toaster />
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
                    {item.status === 'completed' ? (
                      <a href={`/api/download/${item.word_document_path}`} className="text-blue-500 hover:underline">
                        Download
                      </a>
                    ) : (
                      'N/A'
                    )}
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
