'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

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
  status: 'submitted' | 'uploading' | 'trimming' | 'waiting' | 'transcribing' | 'waiting_for_proofreading' | 'proofreading' | 'converting' | 'completed' | 'error'
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

  const getFilenameWithoutExtension = (filePath: string) => {
    const filename = filePath.split(/[/\\]/).pop() || '';
    return filename.split('.').slice(0, -1).join('.');
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Total Users</h2>
              <p className="text-3xl font-bold text-white mb-1">{stats.total_users}</p>
              <p className="text-blue-100 text-sm">Registered members</p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Total Transcriptions</h2>
              <p className="text-3xl font-bold text-white mb-1">{stats.total_transcriptions}</p>
              <p className="text-green-100 text-sm">Files processed</p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Total Errors</h2>
              <p className="text-3xl font-bold text-white mb-1">{stats.total_errors}</p>
              <p className="text-red-100 text-sm">
                {stats.total_errors === 0 ? 'All systems normal' : 'Issues to resolve'}
              </p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">
                {stats.total_errors === 0 ? '✅' : '⚠️'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
              <div className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                👥 No users found
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Users will appear here as they register.
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {user.username}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {user.id}
                        </p>
                      </div>
                    </div>
                    {user.is_admin && (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          <span className="mr-1">👑</span>
                          Admin
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Member Since
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Transcriptions
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {user.transcription_count}
                        </span>
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 text-xs">📄</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Activity Level</span>
                        <span className={`px-2 py-1 rounded-full ${
                          user.transcription_count > 10 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : user.transcription_count > 5 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {user.transcription_count > 10 ? 'High' : user.transcription_count > 5 ? 'Medium' : 'Low'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Recent Transcriptions</h2>
        <div className="space-y-4">
          {transcriptions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
              <div className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                📝 No transcriptions found
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Transcriptions will appear here as users submit audio files.
              </p>
            </div>
          ) : (
            transcriptions.map((transcription) => (
              <div key={transcription.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🎵</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {transcription.audio_file_path ? getFilenameWithoutExtension(transcription.audio_file_path) : 'Unnamed File'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            ID: {transcription.id}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 text-xs">👤</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{transcription.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">User ID: {transcription.user_id}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 dark:text-purple-400 text-xs">📅</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium">Created:</span> {new Date(transcription.created_at).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                              })}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium">Updated:</span> {new Date(transcription.updated_at).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              transcription.status === 'completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                : transcription.status === 'error'
                                ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                            }`}>
                              {transcription.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <span className="mr-2">📁</span>
                          View Files
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-bold dark:text-white flex items-center">
                            <span className="mr-2">📁</span>
                            Transcription Files - {getFilenameWithoutExtension(transcription.audio_file_path || 'Unknown')}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          {transcription.google_drive_url && (
                            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                  <span className="text-blue-600 dark:text-blue-400 text-sm">🎵</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-blue-800 dark:text-blue-200">Audio File</p>
                                  <p className="text-xs text-blue-600 dark:text-blue-400">Google Drive Link</p>
                                </div>
                              </div>
                              <Button
                                onClick={() => window.open(transcription.google_drive_url, '_blank', 'noopener,noreferrer')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                              >
                                <span className="mr-2">🔗</span>
                                Open
                              </Button>
                            </div>
                          )}
                          
                          {transcription.txt_document_path && (
                            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                  <span className="text-green-600 dark:text-green-400 text-sm">📄</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-green-800 dark:text-green-200">Text Document</p>
                                  <p className="text-xs text-green-600 dark:text-green-400">{transcription.txt_document_path.split('/').pop()}</p>
                                </div>
                              </div>
                              <Button 
                                onClick={(e) => handleDownload(e, transcription.txt_document_path)} 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                              >
                                <span className="mr-2">⬇️</span>
                                Download
                              </Button>
                            </div>
                          )}

                          {transcription.md_document_path && (
                            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                  <span className="text-purple-600 dark:text-purple-400 text-sm">📝</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-purple-800 dark:text-purple-200">Markdown Document</p>
                                  <p className="text-xs text-purple-600 dark:text-purple-400">{transcription.md_document_path.split('/').pop()}</p>
                                </div>
                              </div>
                              <Button 
                                onClick={(e) => handleDownload(e, transcription.md_document_path)} 
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                size="sm"
                              >
                                <span className="mr-2">⬇️</span>
                                Download
                              </Button>
                            </div>
                          )}

                          {transcription.word_document_path && (
                            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                                  <span className="text-orange-600 dark:text-orange-400 text-sm">📋</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-orange-800 dark:text-orange-200">Word Document</p>
                                  <p className="text-xs text-orange-600 dark:text-orange-400">{transcription.word_document_path.split('/').pop()}</p>
                                </div>
                              </div>
                              <Button 
                                onClick={(e) => handleDownload(e, transcription.word_document_path)} 
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                size="sm"
                              >
                                <span className="mr-2">⬇️</span>
                                Download
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteTranscription(transcription.id)}
                    >
                      <span className="mr-2">🗑️</span>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Recent Error Logs</h2>
        <div className="space-y-4">
          {errorLogs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
              <div className="text-green-600 dark:text-green-400 text-lg font-medium">
                🎉 No errors found - System running smoothly!
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                All transcriptions are processing without issues.
              </p>
            </div>
          ) : (
            errorLogs.map((log) => (
              <div key={log.id} className="bg-white dark:bg-gray-800 border-l-4 border-red-500 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                            <span className="text-red-600 dark:text-red-400 text-sm font-bold">!</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Error ID:</span>
                            <span className="ml-1 text-sm font-mono text-gray-900 dark:text-white">{log.id}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID:</span>
                          <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            {log.user_id}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Transcription ID:</span>
                          <span className="text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded font-mono">
                            {log.transcription_id}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Error Message:</h4>
                        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3">
                          <pre className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap font-mono">
                            {log.error_message}
                          </pre>
                        </div>
                      </div>

                      {log.stack_trace && log.stack_trace !== "" && (
                        <div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <span className="mr-2">🔍</span>
                                View Stack Trace
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                              <DialogHeader>
                                <DialogTitle className="text-lg font-bold dark:text-white flex items-center">
                                  <span className="mr-2">🐛</span>
                                  Stack Trace - Error #{log.id}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 overflow-auto max-h-[60vh]">
                                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                                  <SyntaxHighlighter
                                    language="javascript"
                                    style={theme === 'dark' ? atomOneDark : atomOneLight}
                                    customStyle={{ 
                                      backgroundColor: 'transparent',
                                      fontSize: '12px',
                                      lineHeight: '1.4'
                                    }}
                                    showLineNumbers={true}
                                  >
                                    {log.stack_trace}
                                  </SyntaxHighlighter>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}