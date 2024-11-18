import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

type History = {
  date: Date
  document_url: string
  status: 'processing' | 'completed' | 'failed'
}


export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [driveLink, setDriveLink] = useState('')
  const [history, setHistory] = useState<Array<History>>([])
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistory(response.data)
    } catch (error) {
      setError('Failed to fetch history')
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
      const response = await axios.post('/api/process', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })
      fetchHistory()
      setFile(null)
      setDriveLink('')
    } catch (error) {
      setError('Failed to process audio')
    } finally {
      setIsProcessing(false)
    }
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
              {history.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
                  <TableCell>
                    <a href={item.document_url} className="text-blue-500 hover:underline">
                      Download
                    </a>
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