import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Comment } from '../types'

export const useCommentsStore = defineStore('comments', () => {
  // State
  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

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

  // Getters
  const getCommentsByTask = computed(() => (taskId: string) => {
    return comments.value.filter(comment => comment.taskId === taskId)
  })

  const getCommentsByProject = computed(() => (projectId: string) => {
    return comments.value.filter(comment => comment.projectId === projectId)
  })

  // Actions
  async function fetchComments(entityId: string, entityType: 'task' | 'project') {
    loading.value = true
    error.value = null
    try {
      const field = entityType === 'task' ? 'taskId' : 'projectId'
      const q = query(
        collection(db, 'comments'),
        where(field, '==', entityId),
        orderBy('createdAt', 'asc')
      )
      
      const querySnapshot = await getDocs(q)
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
      const now = new Date()
      const commentData = {
        content,
        authorId: '', // Will be set by auth context
        authorName: '', // Will be set by auth context
        createdAt: now,
        mentions,
        [entityType === 'task' ? 'taskId' : 'projectId']: entityId
      }
      
      const docRef = await addDoc(collection(db, 'comments'), commentData)
      
      const newComment: Comment = {
        id: docRef.id,
        content,
        authorId: '',
        authorName: '',
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
        updatedAt: new Date()
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
    
    // Actions
    fetchComments,
    addComment,
    updateComment,
    deleteComment
  }
})
