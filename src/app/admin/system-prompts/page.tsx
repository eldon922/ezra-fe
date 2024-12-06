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

type SystemPrompt = {
  id: number
  version: string
  prompt: string
  is_active: boolean
  created_at: string
}

export default function SystemPrompts() {
  const { toast } = useToast()
  const [systemPrompts, setSystemPrompts] = useState<Array<SystemPrompt>>([])
  const [activeSystemPrompt, setActiveSystemPrompt] = useState<SystemPrompt>()
  const [newVersion, setNewVersion] = useState('')
  const [newPrompt, setNewPrompt] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchSystemPrompts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system-prompts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch system prompts (${errorData})`);
      }

      const data = await response.json();
      setSystemPrompts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch system prompts (${error})`,
      })
    }
  }, [toast])

  const fetchSystemPromptActive = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/settings/active-system-prompt', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch active system prompt (${errorData})`);
      }

      const data = await response.json();
      setActiveSystemPrompt(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch active system prompt (${error})`,
      })
    }
  }, [toast])

  useEffect(() => {
    fetchSystemPrompts()
    fetchSystemPromptActive()
  }, [fetchSystemPrompts, fetchSystemPromptActive])

  const handleAddSystemPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/system-prompts', {
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
        throw new Error(`Failed to add system prompt (${errorData})`);
      }

      toast({
        title: "Success",
        description: `Add system prompt success`,
      })

      await fetchSystemPrompts();
      setNewVersion('');
      setNewPrompt('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add system prompt (${error})`,
      })
    } finally {
      setIsLoading(false);
    }
  }

  const handleSetSystemPromptActive = async (systemPromptId: string) => {
    setError('');
    try {
      const response = await fetch(`/api/admin/settings/active-system-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_prompt_id: systemPromptId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to activate system prompt');
      }

      toast({
        title: "Success",
        description: `Set system prompt success`,
      })

      await fetchSystemPromptActive();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to activate system prompt (${error})`,
      })
    }
  }

  return (
    <div className="space-y-8">
      <Toaster />
      <Card>
        <CardHeader>
          <CardTitle>Add New System Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSystemPrompt} className="space-y-4">
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
              {isLoading ? <>Adding<LoadingSpinner className="h-4 w-4 animate-spin" /></> : 'Add System Prompt'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active System Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(e) => handleSetSystemPromptActive(e.target.value)}
              value={activeSystemPrompt?.id}
            >
              <option>Select a version to activate</option>
              {systemPrompts.map((prompt) => (
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
          <CardTitle>System Prompts</CardTitle>
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
              {systemPrompts.map((prompt) => (
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