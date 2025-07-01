'use client'

import { useState, useEffect } from 'react'
import { authService, type AdminUser } from '@/lib/auth'
import type { Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await authService.getSession()
        setSession(session)
        
        if (session?.user) {
          const adminStatus = await authService.isAdmin(session.user)
          setUser({ ...session.user, is_admin: adminStatus })
          setIsAdmin(adminStatus)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        if (session?.user) {
          const adminStatus = await authService.isAdmin(session.user)
          setUser({ ...session.user, is_admin: adminStatus })
          setIsAdmin(adminStatus)
        } else {
          setUser(null)
          setIsAdmin(false)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await authService.signIn(email, password)
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null)
      setSession(null)
      setIsAdmin(false)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signOut,
  }
}