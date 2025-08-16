'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/spinner'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import React, { useCallback, useEffect, useState } from 'react'

type ProofreadPrompt = {
  id: number
  version: string
  prompt: string
  is_active: boolean
  created_at: string
}

export default function ProofreadPrompts() {
  const { toast } = useToast()
  const [proofreadPrompts, setProofreadPrompts] = useState<Array<ProofreadPrompt>>([])
  const [activeProofreadPrompt, setActiveProofreadPrompt] = useState<ProofreadPrompt>()
  const [newVersion, setNewVersion] = useState('')
  const [newPrompt, setNewPrompt] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchProofreadPrompts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/proofread-prompts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch proofread prompts (${errorData})`);
      }

      const data = await response.json();
      setProofreadPrompts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch proofread prompts (${error})`,
      })
    }
  }, [toast])

  const fetchProofreadPromptActive = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/settings/active-proofread-prompt', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch active proofread prompt (${errorData})`);
      }

      const data = await response.json();
      setActiveProofreadPrompt(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch active proofread prompt (${error})`,
      })
    }
  }, [toast])

  useEffect(() => {
    fetchProofreadPrompts()
    fetchProofreadPromptActive()
  }, [fetchProofreadPrompts, fetchProofreadPromptActive])

  const handleAddProofreadPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/proofread-prompts', {
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
        throw new Error(`Failed to add proofread prompt (${errorData})`);
      }

      toast({
        title: "Success",
        description: `Add proofread prompt success`,
      })

      await fetchProofreadPrompts();
      setNewVersion('');
      setNewPrompt('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add proofread prompt (${error})`,
      })
    } finally {
      setIsLoading(false);
    }
  }

  const handleSetProofreadPromptActive = async (proofreadPromptId: string) => {
    setError('');
    try {
      const response = await fetch(`/api/admin/settings/active-proofread-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proofread_prompt_id: proofreadPromptId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to activate proofread prompt');
      }

      toast({
        title: "Success",
        description: `Activate proofread prompt success`,
      })

      await fetchProofreadPromptActive();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to activate proofread prompt (${error})`,
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Toaster />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proofread Prompts</h1>
          <p className="text-muted-foreground mt-1">Manage AI prompts for proofreading and text correction</p>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full">
          <span className="text-purple-800 dark:text-purple-200 text-sm font-medium">
            ✏️ {proofreadPrompts.length} Prompts
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Add New Proofread Prompt</h2>
            <p className="text-purple-100 text-sm">Create a new AI prompt for proofreading and text correction</p>
          </div>
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">✏️</span>
          </div>
        </div>
        
        <form onSubmit={handleAddProofreadPrompt} className="space-y-4">
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
                className="bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder:text-purple-100"
                placeholder="e.g., v1.0, v2.0"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="newPrompt" className="text-white">Prompt Content</Label>
            <textarea
              id="newPrompt"
              className="flex min-h-[200px] w-full rounded-md border border-white border-opacity-30 bg-white bg-opacity-20 px-3 py-2 text-sm text-white placeholder:text-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              required
              disabled={isLoading}
              rows={8}
              placeholder="Enter the AI prompt for proofreading..."
            />
          </div>
          {error && <p className="text-red-200 bg-red-500 bg-opacity-20 p-3 rounded">{error}</p>}
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="bg-white text-purple-600 hover:bg-gray-100 font-medium"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <span className="mr-2">➕</span>
                Add Proofread Prompt
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Active Proofread Prompt</h2>
            <p className="text-muted-foreground text-sm">Select which prompt version to use for proofreading</p>
          </div>
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <span className="text-orange-600 dark:text-orange-400 text-lg">⚡</span>
          </div>
        </div>
        
        <select
          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => handleSetProofreadPromptActive(e.target.value)}
          value={activeProofreadPrompt?.id || ''}
        >
          <option value="">Select a version to activate</option>
          {proofreadPrompts.map((prompt) => (
            <option key={prompt.id} value={prompt.id}>
              {prompt.version} - {prompt.prompt.substring(0, 100)}...
            </option>
          ))}
        </select>
        
        {activeProofreadPrompt && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-green-600 dark:text-green-400 text-sm">✅</span>
              <span className="font-medium text-green-800 dark:text-green-200">Currently Active: {activeProofreadPrompt.version}</span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Created: {new Date(activeProofreadPrompt.created_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">All Proofread Prompts</h2>
        <div className="space-y-4">
          {proofreadPrompts.map((prompt) => (
            <div key={prompt.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">✏️</span>
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
                  {prompt.id === activeProofreadPrompt?.id && (
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