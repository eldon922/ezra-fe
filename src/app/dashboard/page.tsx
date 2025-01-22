'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

type Transcription = {
  id: string
  created_at: string
  updated_at: string
  status: 'completed' | 'error' | 'waiting' | 'transcribing' | 'proofreading' | 'converting'
  word_document_path: string
  txt_document_path: string
  audio_file_name: string
}

export default function Dashboard() {
  const { toast } = useToast()
  const { status } = useSession()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(new File([], ''))
  const [driveLink, setDriveLink] = useState('')
  const [transcriptions, setTranscriptions] = useState<Array<Transcription>>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchTranscriptions = useCallback(async () => {
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
        description: `An unexpected error occurred while fetching transcriptions (${error})`,
      })
    }
  }, [toast])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchTranscriptions()
      const interval = setInterval(fetchTranscriptions, 5000)
      return () => clearInterval(interval)
    }
  }, [status, router, fetchTranscriptions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    if ((file && file.size !== 0 && driveLink)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide an audio file or Google Drive link",
      })
      setIsProcessing(false)
      return
    }

    const formData = new FormData()
    if (file && file.size !== 0) {
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
      setTimeout(() => setFile(new File([], '')), 0)
      setDriveLink('')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred while processing the audio (${error})`,
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
            {/* <div>
              <Label htmlFor="file">Audio File</Label>
              <Input
                key={file ? 'file-input' : 'empty-input'}
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept="audio/*"
                value={file ? undefined : ''}
              />
            </div> */}
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
              {isProcessing ? <>Processing<LoadingSpinner className="h-4 w-4 animate-spin" /></> : 'Submit'}
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
                <TableHead>Name</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transcriptions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                  <TableCell>{item.audio_file_name}</TableCell>
                  <TableCell>
                    {item.status === 'completed' ? (
                      <>
                        <Button onClick={(e) => {
                          e.preventDefault()
                          e.nativeEvent.stopImmediatePropagation()
                          window.location.href = `/api/download/${item.word_document_path}`
                        }}>Download</Button>
                        {/* <Button onClick={(e) => {
                          e.preventDefault()
                          e.nativeEvent.stopImmediatePropagation()
                          window.location.href = `/api/download/${item.txt_document_path}`
                        }}>Download TXT</Button> */}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell><div className="flex items-center">
                    {item.status !== 'completed' && item.status !== 'error' && (
                      <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {item.status}
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
