import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, serverTimestamp, onSnapshot, type Unsubscribe, type QuerySnapshot, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Comment } from '../types'
import { useAuthStore } from '@/modules/auth/stores/auth'

export const useCommentsStore = defineStore('comments', () => {
  // State
  const comments = ref<Array<Comment & { taskId?: string; projectId?: string }>>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let unsubscribeMap = new Map<string, Unsubscribe>()

  // Safely normalize Firestore Timestamp | Date | string | number to Date
  function normalizeDate(input: any): Date | undefined {
    if (!input) return undefined
    if (input instanceof Date) return input
    if (typeof (input as any).toDate === 'function') {
      try { return (input as any).toDate() } catch { return undefined }
    }
    if (typeof input === 'string' || typeof input === 'number') {
      const d = new Date(input)
      return isNaN(d.getTime()) ? undefined : d
    }
    return undefined
  }

  // Realtime subscribe for conversational updates
  function subscribeComments(entityId: string, entityType: 'task' | 'project') {
    const key = `${entityType}:${entityId}`
    // Cleanup existing
    unsubscribeComments(entityId, entityType)

    const field = entityType === 'task' ? 'taskId' : 'projectId'
    const q = query(
      collection(db, 'comments'),
      where(field, '==', entityId),
      orderBy('createdAt', 'asc')
    )

    // helper to apply snapshot docs
    const applySnapshot = (snapshot: QuerySnapshot<DocumentData>) => {
      const entityComments = snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
        const data = d.data() as any
        return {
          id: d.id,
          ...data,
          createdAt: normalizeDate(data.createdAt) || new Date(),
          updatedAt: normalizeDate(data.updatedAt)
        } as Comment
      })
      // Replace slice for this entity
      comments.value = comments.value.filter(c => {
        const taskId = (c as any).taskId
        const projectId = (c as any).projectId
        return entityType === 'task' ? taskId !== entityId : projectId !== entityId
      })
      comments.value.push(...entityComments)
    }

    let usedFallback = false
    const unsub = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      applySnapshot(snapshot)
    }, (e: any) => {
      // If index is missing, fallback to query without orderBy and re-subscribe once
      if (!usedFallback && (e?.code === 'failed-precondition' || /index/i.test(String(e)))) {
        usedFallback = true
        console.warn('Comments index missing, falling back to unordered subscription')
        const qNoOrder = query(
          collection(db, 'comments'),
          where(field, '==', entityId)
        )
        // replace previous unsub in map with new one
        const fallbackUnsub = onSnapshot(qNoOrder, (snap: QuerySnapshot<DocumentData>) => applySnapshot(snap), (err) => {
          console.error('subscribeComments fallback error', err)
          error.value = 'Failed to subscribe to comments'
        })
        // call original unsub to avoid double listeners
        try { unsub() } catch {}
        unsubscribeMap.set(key, fallbackUnsub)
        return
      }
      console.error('subscribeComments error', e)
      error.value = 'Failed to subscribe to comments'
    })
    unsubscribeMap.set(key, unsub)
    return unsub
  }

  function unsubscribeComments(entityId: string, entityType: 'task' | 'project') {
    const key = `${entityType}:${entityId}`
    const unsub = unsubscribeMap.get(key)
    if (unsub) {
      unsub()
      unsubscribeMap.delete(key)
    }
  }

  // Getters
  const getCommentsByTask = computed(() => (taskId: string) => {
    return comments.value.filter(comment => (comment as any).taskId === taskId)
  })

  const getCommentsByProject = computed(() => (projectId: string) => {
    return comments.value.filter(comment => (comment as any).projectId === projectId)
  })

  // Chat-friendly getter: sorted ascending by createdAt
  const getThread = computed(() => (entityId: string, entityType: 'task' | 'project') => {
    const list = entityType === 'task'
      ? comments.value.filter(c => (c as any).taskId === entityId)
      : comments.value.filter(c => (c as any).projectId === entityId)
    return list.sort((a, b) => {
      const da = (a.createdAt instanceof Date) ? a.createdAt.getTime() : new Date(a.createdAt as any).getTime()
      const db = (b.createdAt instanceof Date) ? b.createdAt.getTime() : new Date(b.createdAt as any).getTime()
      return da - db
    })
  })

  // Actions
  async function fetchComments(entityId: string, entityType: 'task' | 'project') {
    loading.value = true
    error.value = null
    try {
      const field = entityType === 'task' ? 'taskId' : 'projectId'
      let q = query(
        collection(db, 'comments'),
        where(field, '==', entityId),
        orderBy('createdAt', 'asc')
      )

      let querySnapshot: QuerySnapshot<DocumentData>
      try {
        querySnapshot = await getDocs(q)
      } catch (e: any) {
        if (e?.code === 'failed-precondition' || /index/i.test(String(e))) {
          console.warn('Comments index missing, fetching without orderBy and sorting client-side')
          q = query(
            collection(db, 'comments'),
            where(field, '==', entityId)
          )
          querySnapshot = await getDocs(q)
        } else {
          throw e
        }
      }
      const entityComments = querySnapshot.docs.map(d => {
        const data = d.data()
        return {
          id: d.id,
          ...data,
          createdAt: normalizeDate(data.createdAt) || new Date(),
          updatedAt: normalizeDate(data.updatedAt)
        } as Comment
      })
      
      // Update comments array
      comments.value = comments.value.filter(c => 
        entityType === 'task' ? c.taskId !== entityId : c.projectId !== entityId
      )
      // push unsorted; UI getter getThread sorts by createdAt asc
      comments.value.push(...entityComments)
      
    } catch (err) {
      error.value = 'Failed to fetch comments'
      console.error('Error fetching comments:', err)
    } finally {
      loading.value = false
    }
  }

  async function addComment(
    entityId: string, 
    entityType: 'task' | 'project', 
    content: string, 
    mentions: string[] = []
  ) {
    loading.value = true
    error.value = null
    try {
      const auth = useAuthStore()
      const authorId = auth.userProfile?.uid || auth.user?.uid || ''
      const authorName = auth.userProfile?.name || auth.user?.displayName || auth.user?.email || 'Unknown'
      if (!authorId) throw new Error('Not authenticated')
      const now = new Date()
      const commentData = {
        content,
        authorId,
        authorName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        mentions,
        [entityType === 'task' ? 'taskId' : 'projectId']: entityId
      }
      
      const docRef = await addDoc(collection(db, 'comments'), commentData)
      
      const newComment: Comment & { taskId?: string; projectId?: string } = {
        id: docRef.id,
        content,
        authorId,
        authorName,
        createdAt: now,
        mentions,
        taskId: entityType === 'task' ? entityId : undefined,
        projectId: entityType === 'project' ? entityId : undefined
      }
      
      comments.value.push(newComment)
      return newComment
    } catch (err) {
      error.value = 'Failed to add comment'
      console.error('Error adding comment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateComment(commentId: string, content: string) {
    loading.value = true
    error.value = null
    try {
      const commentRef = doc(db, 'comments', commentId)
      await updateDoc(commentRef, {
        content,
        updatedAt: serverTimestamp()
      })
      
      const index = comments.value.findIndex(c => c.id === commentId)
      if (index !== -1) {
        comments.value[index] = { 
          ...comments.value[index], 
          content, 
          updatedAt: new Date() 
        }
      }
    } catch (err) {
      error.value = 'Failed to update comment'
      console.error('Error updating comment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteComment(commentId: string) {
    loading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'comments', commentId))
      comments.value = comments.value.filter(c => c.id !== commentId)
    } catch (err) {
      error.value = 'Failed to delete comment'
      console.error('Error deleting comment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    comments,
    loading,
    error,
    
    // Getters
    getCommentsByTask,
    getCommentsByProject,
    getThread,
    
    // Actions
    fetchComments,
    subscribeComments,
    unsubscribeComments,
    addComment,
    updateComment,
    deleteComment
  }
})
