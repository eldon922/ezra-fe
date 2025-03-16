'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type User = {
  id: number
  username: string
  is_admin: boolean
  created_at: string
  transcription_count: number
}

type Transcription = {
  id: string
  user_id: number
  audio_file_path: string
  google_drive_url: string
  txt_document_path: string
  md_document_path: string
  word_document_path: string
  status: 'completed' | 'error' | 'waiting' | 'transcribing' | 'proofreading' | 'converting'
  created_at: string
  updated_at: string
  username: string
}

type ErrorLog = {
  id: number
  user_id: number
  transcription_id: number
  created_at: string
  error_message: string
  stack_trace: string | null
}

type Stats = {
  total_users: number
  total_transcriptions: number
  total_errors: number
}

export default function AdminDashboard() {
  const { theme } = useTheme()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([])
  const [stats, setStats] = useState<Stats>({ total_users: 0, total_transcriptions: 0, total_errors: 0 })

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, transcriptionsRes, logsRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/transcriptions'),
        fetch('/api/admin/logs'),
        fetch('/api/admin/stats'),
      ])

      const [usersData, transcriptionsData, logsData, statsData] = await Promise.all([
        usersRes.json(),
        transcriptionsRes.json(),
        logsRes.json(),
        statsRes.json(),
      ])

      setUsers(usersData)
      setTranscriptions(transcriptionsData)
      setErrorLogs(logsData)
      setStats(statsData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error fetching admin data (${error})`,
      })
    }
  }, [toast])

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchData()
    }
  }, [session, fetchData])

  if (!session?.user?.isAdmin) {
    return null
  }

  const handleDownload = (e: React.MouseEvent, filePath: string) => {
    e.preventDefault()
    e.nativeEvent.stopImmediatePropagation()
    window.location.href = `/api/admin/download/${filePath}`
  }

  const handleDeleteTranscription = async (transcription_id: string) => {
    if (!confirm(`Are you sure you want to delete transcription with id: ${transcription_id}?`)) {
      return
    }
    try {
      const response = await fetch(`/api/admin/transcriptions?id=${transcription_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete transcription');
      }

      toast({
        title: "Success",
        description: "Delete transcription success",
      })

      await fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete transcription (${error})`,
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2 dark:text-white">Total Users</h2>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total_users}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2 dark:text-white">Total Transcriptions</h2>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.total_transcriptions}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2 dark:text-white">Total Errors</h2>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.total_errors}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Users</h2>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transcriptions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.is_admin ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(user.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.transcription_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Recent Transcriptions</h2>
        <div className="bg-white dark:bg-gray-800 overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transcriptions.map((transcription) => (
                <tr key={transcription.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{transcription.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {transcription.audio_file_path && transcription.audio_file_path.split('/').pop()?.split('\\').pop()?.split('.')[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>{transcription.username}</div>
                    <div className="text-xs">ID: {transcription.user_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(transcription.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(transcription.updated_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{transcription.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 flex flex-col space-y-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteTranscription(transcription.id)}
                    >
                      Delete
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          View Files
                        </button>
                      </DialogTrigger>
                      <DialogContent className="p-6 mx-auto rounded-lg bg-white dark:bg-gray-800 shadow-xl sm:max-w-[1000px]">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-bold dark:text-white">Transcription Files</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          {transcription.google_drive_url && (
                            <div className="flex justify-between items-center">
                              <span className="dark:text-white">Google Drive</span>
                              <a
                                href={transcription.google_drive_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              >
                                Open
                              </a>
                            </div>
                          )}
                          {/* {transcription.audio_file_path && (
                            <div className="flex justify-between items-center">
                              <div className="dark:text-white">
                                <span className="font-semibold">Audio File:</span>
                                <span className="ml-2 mr-2">{transcription.audio_file_path.split('/').pop()}</span>
                              </div>
                              <Button onClick={(e) => { handleDownload(e, transcription.audio_file_path) }}>Download</Button>
                            </div>
                          )} */}
                          {transcription.txt_document_path && (
                            <div className="flex justify-between items-center">
                              <div className="dark:text-white">
                                <span className="font-semibold">Text Document:</span>
                                <span className="ml-2 mr-2">{transcription.txt_document_path.split('/').pop()}</span>
                              </div>
                              <Button onClick={(e) => { handleDownload(e, transcription.txt_document_path) }}>Download</Button>
                            </div>
                          )}
                          {transcription.md_document_path && (
                            <div className="flex justify-between items-center">
                              <div className="dark:text-white">
                                <span className="font-semibold">Markdown Document:</span>
                                <span className="ml-2 mr-2">{transcription.md_document_path.split('/').pop()}</span>
                              </div>
                              <Button onClick={(e) => { handleDownload(e, transcription.md_document_path) }}>Download</Button>
                            </div>
                          )}
                          {transcription.word_document_path && (
                            <div className="flex justify-between items-center">
                              <div className="dark:text-white">
                                <span className="font-semibold">Word Document:</span>
                                <span className="ml-2 mr-2">{transcription.word_document_path.split('/').pop()}</span>
                              </div>
                              <Button onClick={(e) => { handleDownload(e, transcription.word_document_path) }}>Download</Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Recent Error Logs</h2>
        <div className="bg-white dark:bg-gray-800 overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Error Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stack Trace</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {errorLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>ID: {log.id}</div>
                    <div>User ID: {log.user_id}</div>
                    <div>Transcription ID: {log.transcription_id}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{log.error_message}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {log.stack_trace !== "" ? (
                      <>
                        <button
                          onClick={() => {
                            const modal = document.getElementById(`stack-modal-${log.id}`) as HTMLDialogElement
                            if (modal) {
                              document.body.style.overflow = 'hidden'
                              modal.showModal()
                            }
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          View
                        </button>
                        <dialog
                          id={`stack-modal-${log.id}`}
                          className="modal p-6 mx-auto rounded-lg bg-white dark:bg-gray-800 shadow-xl backdrop:bg-black backdrop:opacity-50 w-3/4 overflow-y-auto"
                          onClick={(e) => {
                            const modal = e.target as HTMLDialogElement
                            const rect = modal.getBoundingClientRect()
                            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                              rect.left <= e.clientX && e.clientX <= rect.left + rect.width)
                            if (!isInDialog) {
                              modal.close()
                            }
                          }}
                          onClose={() => {
                            document.body.style.overflow = 'auto'
                          }}
                        >
                          <div className="flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-bold dark:text-white">Stack Trace</h3>
                            </div>
                            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                              <SyntaxHighlighter
                                language="javascript"
                                style={theme === 'dark' ? atomOneDark : atomOneLight}
                                customStyle={{ backgroundColor: 'transparent' }}
                              >
                                {log.stack_trace || ''}
                              </SyntaxHighlighter>
                            </pre>
                          </div>
                        </dialog>
                      </>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}