import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
  type UserCredential
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export interface UserProfile {
  uid: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'user' | 'viewer'
  department?: string
  accessSuppliers: string[] // Array of accessible supplier IDs
  accessProducts: string[] | 'all' // Array of accessible product IDs or 'all'
  visibleFields: string[] // Array of product/order fields visible to user
  preferences: {
    currency: string
    dateFormat: string
    timezone: string
    language: string
  }
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    userProfile: null as UserProfile | null,
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.userProfile?.role === 'admin',
    isManager: (state) => state.userProfile?.role === 'manager',
    canAccess: (state) => (resource: string) => {
      if (!state.userProfile) return false
      if (state.userProfile.role === 'admin') return true
      
      // Add resource-specific access logic here
      return true
    }
  },

  actions: {
    async signIn(email: string, password: string): Promise<void> {
      this.isLoading = true
      this.error = null
      
      try {
        const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user
        
        // Load user profile from Firestore
        await this.loadUserProfile(userCredential.user.uid)
        
        // Update last login
        if (this.userProfile) {
          await this.updateLastLogin()
        }
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async signUp(email: string, password: string, name: string): Promise<void> {
      this.isLoading = true
      this.error = null
      
      try {
        const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user
        
        // Update user profile in Firebase Auth
        await updateProfile(userCredential.user, { displayName: name })
        
        // Create user profile in Firestore
        await this.createUserProfile(userCredential.user.uid, {
          email,
          name,
          role: 'user', // Default role
          accessSuppliers: [],
          accessProducts: [],
          visibleFields: [],
          preferences: {
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            timezone: 'UTC',
            language: 'en'
          },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        await this.loadUserProfile(userCredential.user.uid)
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async signOut(): Promise<void> {
      this.isLoading = true
      
      try {
        await signOut(auth)
        this.user = null
        this.userProfile = null
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async resetPassword(email: string): Promise<void> {
      this.isLoading = true
      this.error = null
      
      try {
        await sendPasswordResetEmail(auth, email)
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async loadUserProfile(uid: string): Promise<void> {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid))
        if (userDoc.exists()) {
          this.userProfile = userDoc.data() as UserProfile
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      }
    },

    async createUserProfile(uid: string, profileData: Omit<UserProfile, 'uid'>): Promise<void> {
      try {
        const userProfileData = { uid, ...profileData }
        await setDoc(doc(db, 'users', uid), userProfileData)
        this.userProfile = userProfileData
      } catch (error) {
        console.error('Error creating user profile:', error)
        throw error
      }
    },

    async updateLastLogin(): Promise<void> {
      if (!this.userProfile) return
      
      try {
        await updateDoc(doc(db, 'users', this.userProfile.uid), {
          lastLogin: new Date(),
          updatedAt: new Date()
        })
      } catch (error) {
        console.error('Error updating last login:', error)
      }
    },

    setUser(user: User | null): void {
      this.user = user
      if (user) {
        this.loadUserProfile(user.uid)
      } else {
        this.userProfile = null
      }
    },

    clearError(): void {
      this.error = null
    },

    async createAdminUser(email: string, password: string, name: string): Promise<void> {
      this.isLoading = true
      this.error = null
      
      try {
        // Only admins can create other admins
        if (!this.isAdmin) {
          throw new Error('Insufficient permissions to create admin users')
        }

        const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        // Update user profile in Firebase Auth
        await updateProfile(userCredential.user, { displayName: name })
        
        // Create admin profile in Firestore
        await this.createUserProfile(userCredential.user.uid, {
          email,
          name,
          role: 'admin',
          accessSuppliers: 'all' as any,
          accessProducts: 'all',
          visibleFields: ['all'], // Admin can see all fields
          preferences: {
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            timezone: 'UTC',
            language: 'en'
          },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateUserRole(uid: string, newRole: 'admin' | 'manager' | 'user' | 'viewer'): Promise<void> {
      this.isLoading = true
      this.error = null
      
      try {
        // Only admins can change roles
        if (!this.isAdmin) {
          throw new Error('Insufficient permissions to update user roles')
        }

        await updateDoc(doc(db, 'users', uid), {
          role: newRole,
          updatedAt: new Date()
        })
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    getErrorMessage(errorCode: string): string {
      const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'default': 'An unexpected error occurred. Please try again.'
      }
      
      return errorMessages[errorCode] || errorMessages.default
    }
  }
})
