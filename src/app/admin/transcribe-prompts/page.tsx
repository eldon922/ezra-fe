'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/spinner'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import React, { useCallback, useEffect, useState } from 'react'

type TranscribePrompt = {
  id: number
  version: string
  prompt: string
  is_active: boolean
  created_at: string
}

export default function TranscribePrompts() {
  const { toast } = useToast()
  const [transcribePrompts, setTranscribePrompts] = useState<Array<TranscribePrompt>>([])
  const [activeTranscribePrompt, setActiveTranscribePrompt] = useState<TranscribePrompt>()
  const [newVersion, setNewVersion] = useState('')
  const [newPrompt, setNewPrompt] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchTranscribePrompts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/transcribe-prompts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch transcribe prompts (${errorData})`);
      }

      const data = await response.json();
      setTranscribePrompts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch transcribe prompts (${error})`,
      })
    }
  }, [toast])

  const fetchTranscribePromptActive = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/settings/active-transcribe-prompt', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch active transcribe prompt (${errorData})`);
      }

      const data = await response.json();
      setActiveTranscribePrompt(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch active transcribe prompt (${error})`,
      })
    }
  }, [toast])

  useEffect(() => {
    fetchTranscribePrompts()
    fetchTranscribePromptActive()
  }, [fetchTranscribePrompts, fetchTranscribePromptActive])

  const handleAddTranscribePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/transcribe-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: newVersion,
          prompt: newPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add transcribe prompt (${errorData})`);
      }

      toast({
        title: "Success",
        description: `Add transcribe prompt success`,
      })

      await fetchTranscribePrompts();
      setNewVersion('');
      setNewPrompt('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add transcribe prompt (${error})`,
      })
    } finally {
      setIsLoading(false);
    }
  }

  const handleSetTranscribePromptActive = async (transcribePromptId: string) => {
    setError('');
    try {
      const response = await fetch(`/api/admin/settings/active-transcribe-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcribe_prompt_id: transcribePromptId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to activate transcribe prompt');
      }

      toast({
        title: "Success",
        description: `Activate transcribe prompt success`,
      })

      await fetchTranscribePromptActive();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to activate transcribe prompt (${error})`,
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Toaster />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transcribe Prompts</h1>
          <p className="text-muted-foreground mt-1">Manage AI prompts for transcription processing</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
          <span className="text-green-800 dark:text-green-200 text-sm font-medium">
            📝 {transcribePrompts.length} Prompts
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Add New Transcribe Prompt</h2>
            <p className="text-blue-100 text-sm">Create a new AI prompt for transcription processing</p>
          </div>
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">📝</span>
          </div>
        </div>
        
        <form onSubmit={handleAddTranscribePrompt} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newVersion" className="text-white">Version</Label>
              <Input
                id="newVersion"
                type="text"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder:text-blue-100"
                placeholder="e.g., v1.0, v2.0"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="newPrompt" className="text-white">Prompt Content</Label>
            <textarea
              id="newPrompt"
              className="flex min-h-[200px] w-full rounded-md border border-white border-opacity-30 bg-white bg-opacity-20 px-3 py-2 text-sm text-white placeholder:text-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              required
              disabled={isLoading}
              rows={8}
              placeholder="Enter the AI prompt for transcription..."
            />
          </div>
          {error && <p className="text-red-200 bg-red-500 bg-opacity-20 p-3 rounded">{error}</p>}
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="bg-white text-blue-600 hover:bg-gray-100 font-medium"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <span className="mr-2">➕</span>
                Add Transcribe Prompt
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Active Transcribe Prompt</h2>
            <p className="text-muted-foreground text-sm">Select which prompt version to use for new transcriptions</p>
          </div>
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <span className="text-orange-600 dark:text-orange-400 text-lg">⚡</span>
          </div>
        </div>
        
        <select
          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => handleSetTranscribePromptActive(e.target.value)}
          value={activeTranscribePrompt?.id || ''}
        >
          <option value="">Select a version to activate</option>
          {transcribePrompts.map((prompt) => (
            <option key={prompt.id} value={prompt.id}>
              {prompt.version} - {prompt.prompt.substring(0, 100)}...
            </option>
          ))}
        </select>
        
        {activeTranscribePrompt && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-green-600 dark:text-green-400 text-sm">✅</span>
              <span className="font-medium text-green-800 dark:text-green-200">Currently Active: {activeTranscribePrompt.version}</span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Created: {new Date(activeTranscribePrompt.created_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">All Transcribe Prompts</h2>
        <div className="space-y-4">
          {transcribePrompts.map((prompt) => (
            <div key={prompt.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">📝</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Version {prompt.version}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {prompt.id} • Created: {new Date(prompt.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {prompt.id === activeTranscribePrompt?.id && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <span className="mr-1">⚡</span>
                      Active
                    </span>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Prompt Content:</h4>
                  <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {prompt.prompt}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}