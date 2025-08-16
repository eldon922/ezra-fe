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
import { Upload, Clock, CheckCircle, XCircle, AlertCircle, FileText, Calendar, Download, ExternalLink, Play, Square } from 'lucide-react'

type Transcription = {
  id: string
  created_at: string
  updated_at: string
  status: 'submitted' | 'uploading' | 'trimming' | 'waiting' | 'transcribing' | 'waiting_for_proofreading' | 'proofreading' | 'converting' | 'completed' | 'error'
  word_document_path: string
  txt_document_path: string
  audio_file_name: string
}

// Add this mapping to show Indonesian status
const statusMessages = {
  submitted: 'Dikirim',
  uploading: 'Mengunggah',
  trimming: 'Memotong Audio',
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
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const formatTimeInput = (value: string) => {
    // Remove any non-digit characters (we'll handle colons automatically)
    const digitsOnly = value.replace(/[^0-9]/g, '')

    // Process digits and validate each position
    let validatedDigits = ''

    for (let i = 0; i < digitsOnly.length && i < 6; i++) {
      const digit = digitsOnly[i]
      const position = i % 2 // 0 for first digit of pair, 1 for second digit
      const segment = Math.floor(i / 2) // 0 for hours, 1 for minutes, 2 for seconds

      if (segment === 0) {
        // Hours: allow any digit (00-99)
        validatedDigits += digit
      } else {
        // Minutes and seconds: must be 00-59
        if (position === 0) {
          // First digit of minutes/seconds: can only be 0-5
          if (parseInt(digit) <= 5) {
            validatedDigits += digit
          } else {
            break // Stop processing if invalid first digit
          }
        } else {
          // Second digit: can be any digit 0-9
          validatedDigits += digit
        }
      }
    }

    // Auto-format with colons: HHMMSS -> HH:MM:SS
    let formatted = ''
    for (let i = 0; i < validatedDigits.length; i++) {
      if (i === 2 || i === 4) {
        formatted += ':'
      }
      formatted += validatedDigits[i]
    }

    return formatted
  }

  const handleTimeKeyDown = (e: React.KeyboardEvent) => {
    // Only allow digits and navigation keys
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
    }
  }

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
        description: "Mohon sediakan link Google Drive atau Youtube",
      })
      setIsProcessing(false)
      return
    }

    // Add trimming times if provided
    if (startTime) {
      formData.append('start_time', startTime)
    }
    if (endTime) {
      formData.append('end_time', endTime)
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
      setStartTime('')
      setEndTime('')
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
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Unggah Audio/Video untuk Transkripsi
          </CardTitle>
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
              <Label htmlFor="driveLink" className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                Link <span className="font-bold">Google Drive</span> atau <span className="font-bold">Youtube</span>
              </Label>
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
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p>Syarat Link <span className="font-bold">Google Drive:</span></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Link harus memiliki <span className="font-bold text-red-600">izin akses</span>&nbsp;
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
                                Siapa saja yang memiliki link/Anyone with the link
                              </button>
                            </DialogTrigger>
                            <DialogContent className="lg:max-w-[600px] h-[600px]">
                              <DialogTitle className="text-lg font-bold dark:text-white mb-4">
                                Cara Membagikan File Google Drive
                              </DialogTitle>
                              <div className="flex justify-center overflow-auto">
                                <Image
                                  src="/share.png"
                                  alt="Cara membagikan file Google Drive"
                                  width={800}
                                  height={600}
                                  className="w-full max-w-4xl h-auto object-contain rounded-lg shadow-lg"
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
                          <div className="flex justify-center items-center h-full">
                            <iframe
                              width="97%"
                              height="100%"
                              src="https://www.youtube.com/embed/moVJE5h_np8?autoplay=1&cc_load_policy=1&cc_lang_pref=id&hl=id"
                              title="Tutorial Mengunggah Audio ke Google Drive dan Membagikan Secara Publik"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Potong Audio (Opsional)
              </Label>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="startTime" className="flex items-center gap-2 mb-2">
                    <Play className="h-3 w-3 text-green-600" />
                    Waktu Mulai (hh:mm:ss)
                  </Label>
                  <Input
                    id="startTime"
                    type="text"
                    value={startTime}
                    onChange={(e) => {
                      const formattedValue = formatTimeInput(e.target.value)
                      setStartTime(formattedValue)
                    }}
                    onKeyDown={handleTimeKeyDown}
                    placeholder="00:01:30"
                    pattern="[0-9]{1,2}:[0-9]{2}:[0-9]{2}"
                    title="Masukkan waktu mulai dalam format hh:mm:ss"
                    maxLength={8}
                  />
                </div>
                <div className="flex items-center justify-center pb-2">
                  <span className="text-gray-500 dark:text-gray-400 font-bold text-lg">—</span>
                </div>
                <div className="flex-1">
                  <Label htmlFor="endTime" className="flex items-center gap-2 mb-2">
                    <Square className="h-3 w-3 text-red-600" />
                    Waktu Selesai (hh:mm:ss)
                  </Label>
                  <Input
                    id="endTime"
                    type="text"
                    value={endTime}
                    onChange={(e) => {
                      const formattedValue = formatTimeInput(e.target.value)
                      setEndTime(formattedValue)
                    }}
                    onKeyDown={handleTimeKeyDown}
                    placeholder="00:05:45"
                    pattern="[0-9]{1,2}:[0-9]{2}:[0-9]{2}"
                    title="Masukkan waktu selesai dalam format hh:mm:ss"
                    maxLength={8}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Format: jam:menit:detik (contoh: 00:01:30 untuk 1 menit 30 detik)</p>
                <p>Kosongkan jika ingin memproses seluruh audio</p>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p>Disarankan untuk memotong audio agar hanya berisi <span className="font-bold">khotbah yang ingin ditranskripsi</span>. Hapus bagian musik, liturgis, atau aktivitas lain yang tidak perlu ditranskripsi untuk hasil yang lebih akurat.</p>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isProcessing ? <>Memproses<LoadingSpinner className="h-4 w-4 animate-spin" /></> : 'Mulai Transkrip'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Riwayat Transkripsi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <colgroup>
              <col className="w-40" />
              <col className="w-auto" />
              <col className="w-28" />
              <col className="w-36" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Tanggal
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    Nama
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-green-600" />
                    Hasil
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-yellow-600" />
                    Status
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transcriptions.map((item, index) => (
                <TableRow
                  key={item.id}
                  className={`
                    transition-colors border-b border-gray-200 dark:border-gray-600
                    ${index % 2 === 0
                      ? 'bg-white dark:bg-gray-900 hover:bg-blue-100 dark:hover:bg-gray-800'
                      : 'bg-blue-50 dark:bg-gray-800 hover:bg-blue-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <TableCell className="font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {new Date(item.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {(() => {
                          const now = new Date();
                          const createdAt = new Date(item.created_at);
                          const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
                          const diffInHours = Math.floor(diffInMinutes / 60);

                          const fullDate = createdAt.toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          });

                          if (diffInHours < 24) {
                            let relativeTime;
                            if (diffInMinutes < 1) {
                              relativeTime = "Baru saja";
                            } else if (diffInMinutes < 60) {
                              relativeTime = diffInMinutes === 1 ? "1 menit yang lalu" : `${diffInMinutes} menit yang lalu`;
                            } else if (diffInHours === 1) {
                              relativeTime = "1 jam yang lalu";
                            } else {
                              relativeTime = `${diffInHours} jam yang lalu`;
                            }
                            return relativeTime;
                          }
                        })()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100 font-medium">
                    <div className="break-words" title={item.audio_file_name}>
                      {item.audio_file_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.status === 'completed' ? (
                      <>
                        <Button onClick={(e) => {
                          e.preventDefault()
                          e.nativeEvent.stopImmediatePropagation()
                          window.location.href = `/api/download/${item.word_document_path}`
                        }} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Unduh
                        </Button>
                        {/* <Button onClick={(e) => {
                          e.preventDefault()
                          e.nativeEvent.stopImmediatePropagation()
                          window.location.href = `/api/download/${item.txt_document_path}`
                        }}>Unduh TXT</Button> */}
                      </>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-2 ${item.status === 'completed' ? 'text-green-600' :
                      item.status === 'error' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                      {item.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                      {item.status === 'error' && <XCircle className="h-4 w-4" />}
                      {item.status !== 'completed' && item.status !== 'error' && (
                        <LoadingSpinner className="h-4 w-4 animate-spin" />
                      )}
                      <span className="font-medium">
                        {statusMessages[item.status] || item.status}
                      </span>
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
