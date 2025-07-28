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
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from 'next/image'

type Transcription = {
  id: string
  created_at: string
  updated_at: string
  status: 'completed' | 'error' | 'waiting' | 'transcribing' | 'proofreading' | 'converting'
  word_document_path: string
  txt_document_path: string
  audio_file_name: string
}

// Add this mapping to show Indonesian status
const statusMessages = {
  uploading: 'Mengunggah',
  waiting: 'Menginisiasi',
  transcribing: 'Mentranskripsi Audio',
  waiting_for_proofreading: 'Menunggu Proofreading',
  proofreading: 'Melakukan Proofreading',
  converting: 'Mengkonversi ke Word',
  completed: 'Selesai',
  error: 'Terjadi Kesalahan',
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
          title: "Kesalahan",
          description: data.error,
        })
        return
      }
      const data = await response.json()
      setTranscriptions(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Kesalahan",
        description: `Terjadi kesalahan saat mengambil data transkripsi (${error})`,
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
        title: "Kesalahan",
        description: "Mohon pilih salah satu: file audio atau link Google Drive, jangan keduanya",
      })
      setIsProcessing(false)
      return
    }

    if (driveLink && driveLink.includes('folders')) {
      toast({
        variant: "destructive",
        title: "Kesalahan",
        description: "Mohon berikan link file langsung, bukan link folder",
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
        title: "Kesalahan",
        description: "Mohon sediakan file audio atau link Google Drive",
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
          title: "Kesalahan",
          description: data.error,
        })
        return
      }

      toast({
        title: "Berhasil",
        description: "Proses audio berhasil dimulai",
      })

      await fetchTranscriptions()
      setFile(null)
      setTimeout(() => setFile(new File([], '')), 0)
      setDriveLink('')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Kesalahan",
        description: `Terjadi kesalahan saat memproses audio (${error})`,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (status === 'loading') {
    return <div>Memuat...</div>
  }

  return (
    <div>
      <Toaster />
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Unggah Audio/Video untuk Transkripsi</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* <div>
              <Label htmlFor="file">File Audio</Label>
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
              <Label htmlFor="driveLink">Link <span className="font-bold">Google Drive</span> atau <span className="font-bold">Youtube</span></Label>
              <Input
                id="driveLink"
                type="text"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/... atau https://youtube.com/... atau https://youtu.be/..."
              />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Syarat Link <span className="font-bold">Google Drive:</span></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Link harus memiliki <span className="font-bold text-red-600">izin akses</span>&nbsp;
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
                          Siapa saja yang memiliki link/Anyone with the link
                        </button>
                      </DialogTrigger>
                      <DialogContent className="lg:max-w-[800px]">
                        <DialogTitle className="text-lg font-bold dark:text-white mb-4">
                          Cara Membagikan File Google Drive
                        </DialogTitle>
                        <div className="flex justify-center">
                          <Image
                            src="/share.png"
                            alt="Cara membagikan file Google Drive"
                            width={800}
                            height={600}
                            className="max-w-full h-auto rounded-lg shadow-lg"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </li>
                  <li>Link harus mengarah ke <span className="font-bold text-red-600">file audio, bukan folder</span></li>
                </ul>

                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                    >
                      Tonton Tutorial Unggah ke Google Drive
                    </button>
                  </DialogTrigger>
                  <DialogContent className="lg:max-w-[1000px] h-[600px]">
                    <DialogTitle className="sr-only text-lg font-bold dark:text-white">
                      Tutorial Mengunggah Audio ke Google Drive dan Membagikan Secara Publik
                    </DialogTitle>
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/moVJE5h_np8?autoplay=1&cc_load_policy=1&cc_lang_pref=id&hl=id"
                      title="Tutorial Mengunggah Audio ke Google Drive dan Membagikan Secara Publik"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? <>Memproses<LoadingSpinner className="h-4 w-4 animate-spin" /></> : 'Mulai Transkrip'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transkripsi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Hasil</TableHead>
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
                        }}>Unduh</Button>
                        {/* <Button onClick={(e) => {
                          e.preventDefault()
                          e.nativeEvent.stopImmediatePropagation()
                          window.location.href = `/api/download/${item.txt_document_path}`
                        }}>Unduh TXT</Button> */}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {item.status !== 'completed' && item.status !== 'error' && (
                        <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {statusMessages[item.status] || item.status}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
