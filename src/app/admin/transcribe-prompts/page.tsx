'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
    <div className="space-y-8">
      <Toaster />
      <Card>
        <CardHeader>
          <CardTitle>Add New Transcribe Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTranscribePrompt} className="space-y-4">
            <div>
              <Label htmlFor="newVersion">Version</Label>
              <Input
                id="newVersion"
                type="text"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="newPrompt">Prompt</Label>
              <textarea
                id="newPrompt"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                required
                disabled={isLoading}
                rows={20}
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <>Adding<LoadingSpinner className="h-4 w-4 animate-spin" /></> : 'Add Transcribe Prompt'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Transcribe Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(e) => handleSetTranscribePromptActive(e.target.value)}
              value={activeTranscribePrompt?.id}
            >
              <option>Select a version to activate</option>
              {transcribePrompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.version.toString()} - {prompt.prompt.toString().substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transcribe Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Prompt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transcribePrompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell>{prompt.id}</TableCell>
                  <TableCell>{prompt.version}</TableCell>
                  <TableCell>{new Date(prompt.created_at).toLocaleString()}</TableCell>
                  <TableCell className="whitespace-pre-wrap">{prompt.prompt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}