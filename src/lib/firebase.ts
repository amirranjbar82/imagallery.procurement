import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  // These values are safe to expose in client-side code
  // They will be replaced with actual values during build or via environment variables
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "placeholder",
  authDomain: `ima-gallery.firebaseapp.com`,
  projectId: "ima-gallery",
  storageBucket: `ima-gallery.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "placeholder",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "placeholder"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

// Set Firebase region (Middle East Central 1 as per firebase.json)
// functions.region = 'me-central1'

export default app
