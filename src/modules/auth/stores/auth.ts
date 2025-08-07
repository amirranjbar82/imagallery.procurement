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
import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, getDocs } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

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
  createdBy?: 'admin' | 'self-signup' // Track how user was created
  activatedAt?: Date // Track when user was activated
  activatedBy?: string // Track who activated the user
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    userProfile: null as UserProfile | null,
    users: [] as UserProfile[],
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.userProfile?.role === 'admin',
    isManager: (state) => state.userProfile?.role === 'manager',
    canAccess: (state) => (_resource: string) => {
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
        
        // Check if user is active
        if (!this.userProfile?.isActive) {
          this.error = 'Your account is not activated yet. Please contact the system administrator for access.'
          await signOut(auth)
          this.user = null
          this.userProfile = null
          throw new Error('Account not activated')
        }
        
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
          isActive: false, // New users are inactive by default
          createdBy: 'self-signup',
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
        } else {
          // User profile doesn't exist, create a default one
          await this.createDefaultUserProfile(uid)
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

    async createDefaultUserProfile(uid: string): Promise<void> {
      try {
        // Get user info from Firebase Auth
        const user = this.user
        if (!user) return

        const defaultProfile: Omit<UserProfile, 'uid'> = {
          email: user.email || '',
          name: user.displayName || user.email?.split('@')[0] || 'User',
          role: 'user', // Default role for new users
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
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }

        await this.createUserProfile(uid, defaultProfile)
        console.log('Created default user profile for:', user.email)
      } catch (error) {
        console.error('Error creating default user profile:', error)
        throw error
      }
    },

    async setUser(user: User | null): Promise<void> {
      this.user = user
      if (user) {
        await this.loadUserProfile(user.uid)
      } else {
        this.userProfile = null
      }
    },

    clearError(): void {
      this.error = null
    },

    async createUser(email: string, password: string, name: string, role: 'admin' | 'manager' | 'user' | 'viewer' = 'user'): Promise<void> {
      this.isLoading = true
      this.error = null
      
      try {
        // Only admins can create users
        if (!this.isAdmin) {
          throw new Error('Insufficient permissions to create users')
        }

        // Store current user to restore session later
        const currentUser = auth.currentUser
        const currentUserProfile = this.userProfile
        
        if (!currentUser) {
          throw new Error('No authenticated user found')
        }

        // Create the new user (this will log out current user)
        const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password)
        const newUser = userCredential.user
        
        // Update user profile in Firebase Auth
        await updateProfile(newUser, { displayName: name })
        
        // Create user profile in Firestore
        await this.createUserProfile(newUser.uid, {
          email,
          name,
          role,
          accessSuppliers: role === 'admin' ? 'all' as any : [],
          accessProducts: role === 'admin' ? 'all' : [],
          visibleFields: role === 'admin' ? ['all'] : [],
          preferences: {
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            timezone: 'UTC',
            language: 'en'
          },
          isActive: false, // All admin-created users are inactive by default
          createdBy: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        })

        // Sign out the newly created user
        await signOut(auth)
        
        // Restore the original admin session
        // We need to sign in the admin again
        // This is a limitation of Firebase client SDK - in production use Firebase Admin SDK
        
        // For now, restore the user state manually
        this.user = currentUser
        this.userProfile = currentUserProfile
        
        // Note: The admin will need to refresh the page or re-login to fully restore session
        // This is a known limitation when using Firebase client SDK for admin operations
        
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createAdminUser(email: string, password: string, name: string): Promise<void> {
      return this.createUser(email, password, name, 'admin')
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

    async activateUser(uid: string): Promise<void> {
      this.isLoading = true
      this.error = null
      
      try {
        // Only admins can activate users
        if (!this.isAdmin) {
          throw new Error('Insufficient permissions to activate users')
        }

        await updateDoc(doc(db, 'users', uid), {
          isActive: true,
          activatedAt: new Date(),
          activatedBy: this.userProfile?.uid,
          updatedAt: new Date()
        })

        // Update local users array if it exists
        const userIndex = this.users.findIndex(u => u.uid === uid)
        if (userIndex !== -1) {
          this.users[userIndex] = {
            ...this.users[userIndex],
            isActive: true,
            activatedAt: new Date(),
            activatedBy: this.userProfile?.uid,
            updatedAt: new Date()
          }
        }
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deactivateUser(uid: string): Promise<void> {
      this.isLoading = true
      this.error = null
      
      try {
        // Only admins can deactivate users
        if (!this.isAdmin) {
          throw new Error('Insufficient permissions to deactivate users')
        }

        await updateDoc(doc(db, 'users', uid), {
          isActive: false,
          updatedAt: new Date()
        })

        // Update local users array if it exists
        const userIndex = this.users.findIndex(u => u.uid === uid)
        if (userIndex !== -1) {
          this.users[userIndex] = {
            ...this.users[userIndex],
            isActive: false,
            updatedAt: new Date()
          }
        }
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.isLoading = false
      }
    },



    async fetchUsers(): Promise<void> {
      this.isLoading = true
      this.error = null
      
      try {
        // Only admins can fetch all users
        if (!this.isAdmin) {
          throw new Error('Insufficient permissions to view users')
        }

        const usersQuery = query(
          collection(db, 'users'),
          orderBy('name')
        )
        
        const snapshot = await getDocs(usersQuery)
        this.users = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as UserProfile))
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch users'
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
