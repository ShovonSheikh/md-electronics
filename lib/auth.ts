import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface AdminUser extends User {
  is_admin?: boolean
}

export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      throw new Error(error.message)
    }
    return session
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      throw new Error(error.message)
    }
    return user
  },

  // Check if user is admin
  async isAdmin(user: User | null): Promise<boolean> {
    if (!user) return false
    
    try {
      // Check if user has admin role in user metadata
      const isAdmin = user.user_metadata?.is_admin === true || 
                     user.app_metadata?.is_admin === true
      
      return isAdmin
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}