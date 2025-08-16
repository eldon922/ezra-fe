'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/spinner'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import React, { useCallback, useEffect, useState } from 'react'

type User = {
  id: number
  username: string
  is_admin: boolean
  created_at: string
  transcription_count: number
}

export default function AdminSetting() {
  const { toast } = useToast()
  const [users, setUsers] = useState<Array<User>>([])
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch users (${errorData})`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch users (${error})`,
      })
    }
  }, [toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add user (${errorData})`);
      }

      toast({
        title: "Success",
        description: `Add user ${newUsername} success`,
      })

      await fetchUsers();
      setNewUsername('');
      setNewPassword('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add user (${error})`,
      })
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user: ${user.username}?\nThis is a destructive action, all of the data related to this user (${user.username}) including transcriptions will be DELETED PERMANENTLY.`)) {
      return
    }
    try {
      const response = await fetch(`/api/admin/users?id=${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      toast({
        title: "Success",
        description: "Delete user success",
      })

      await fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete user (${error})`,
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Toaster />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage user accounts and permissions</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
          <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">
            👥 {users.length} Total Users
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Add New User</h2>
            <p className="text-green-100 text-sm">Create a new user account for the system</p>
          </div>
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">➕</span>
          </div>
        </div>
        
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="newUsername" className="text-white">Username</Label>
            <Input
              id="newUsername"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder:text-green-100"
              placeholder="Enter username"
            />
          </div>
          <div>
            <Label htmlFor="newPassword" className="text-white">Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder:text-green-100"
              placeholder="Enter password"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="bg-white text-green-600 hover:bg-gray-100 font-medium"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <span className="mr-2">➕</span>
                Add User
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">All Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      <span className="mr-1">👑</span>
                      Admin
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
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
                </div>

                {!user.is_admin && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteUser(user)}
                    className="w-full"
                    size="sm"
                  >
                    <span className="mr-2">🗑️</span>
                    Delete User
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}