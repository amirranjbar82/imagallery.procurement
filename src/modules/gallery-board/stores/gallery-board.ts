import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  ProductMeta, 
  Scene, 
  Layer, 
  DisplayCalibration, 
  BulkImportJob, 
  ExportBundle,
  AssetUploadMeta,
  ExportOptions,
  Annotation,
  LayerId,
  SceneId,
  SKU
} from '../types/gallery-board'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy 
} from 'firebase/firestore'
import { 
  ref as storageRef,
  uploadBytes,
  getDownloadURL 
} from 'firebase/storage'
import { db, storage } from '../../../lib/firebase'

export const useGalleryBoardStore = defineStore('galleryBoard', () => {
  // State
  const assets = ref<ProductMeta[]>([])
  const assetsLoading = ref(false)
  
  const currentScene = ref<Scene | null>(null)
  const scenes = ref<Scene[]>([])
  const scenesLoading = ref(false)
  
  const calibration = ref<DisplayCalibration | null>(null)
  
  const selectedLayers = ref<LayerId[]>([])
  const showAnnotations = ref(true)
  const showLayerPanel = ref(true)
  
  const activeImportJob = ref<BulkImportJob | null>(null)
  const exportHistory = ref<ExportBundle[]>([])

  // Computed
  const selectedLayersData = computed(() => {
    if (!currentScene.value) return []
    return currentScene.value.layers.filter(layer => 
      selectedLayers.value.includes(layer.id)
    )
  })

  const hasCalibration = computed(() => calibration.value !== null)

  const visibleLayers = computed(() => {
    if (!currentScene.value) return []
    return currentScene.value.layers.filter(layer => layer.visible)
  })


  // Asset Management Actions
  const fetchAssets = async () => {
    assetsLoading.value = true
    try {
      // Mock data for development
      assets.value = [
        { 
          sku: 'MOCK-001',
          title: 'Sample Asset 1',
          category: 'Sample',
          tags: ['mock', 'sample'],
          src: '/placeholder.jpg',
          thumb: '/placeholder-thumb.jpg'
        },
        { 
          sku: 'MOCK-002',
          title: 'Sample Asset 2',
          category: 'Sample',
          tags: ['mock', 'sample'],
          src: '/placeholder2.jpg',
          thumb: '/placeholder2-thumb.jpg'
        }
      ] as ProductMeta[]
    } catch (error) {
      console.error('Error fetching assets:', error)
      throw error
    } finally {
      assetsLoading.value = false
    }
  }

  const uploadAsset = async (file: File, metadata: AssetUploadMeta): Promise<ProductMeta> => {
    try {
      // Upload image to Firebase Storage
      const imageRef = storageRef(storage, `gallery_assets/${metadata.sku}/${file.name}`)
      const uploadResult = await uploadBytes(imageRef, file)
      const imageUrl = await getDownloadURL(uploadResult.ref)

      // Generate thumbnail (simplified - in production use Sharp or similar)
      const thumbRef = storageRef(storage, `gallery_assets/${metadata.sku}/thumb_${file.name}`)
      const thumbUrl = await getDownloadURL(thumbRef) // Placeholder - implement thumbnail generation

      // Create asset document
      const assetData: ProductMeta = {
        ...metadata,
        src: imageUrl,
        thumb: thumbUrl,
        defaults: {
          lockInitialScale: metadata.lockInitialScale,
          recommendedZ: metadata.recommendedZ,
          anchor: { 
            x: metadata.anchorX || 0.5, 
            y: metadata.anchorY || 1 
          },
          shadow: metadata.shadowBlur ? {
            blur: metadata.shadowBlur,
            dx: metadata.shadowDx || 0,
            dy: metadata.shadowDy || 8,
            alpha: metadata.shadowAlpha || 0.4
          } : undefined
        }
      }

      const assetsCollection = collection(db, 'gallery_assets')
      const docRef = await addDoc(assetsCollection, assetData)
      
      const newAsset = { ...assetData, id: docRef.id }
      assets.value.push(newAsset)
      
      return newAsset
    } catch (error) {
      console.error('Error uploading asset:', error)
      throw error
    }
  }

  const bulkImport = async (_csvFile: File, _zipFile?: File): Promise<BulkImportJob> => {
    const jobId = `import_${Date.now()}`
    const job: BulkImportJob = {
      id: jobId,
      status: 'processing',
      totalItems: 0,
      processedItems: 0,
      failedItems: 0,
      errors: [],
      createdAt: Date.now()
    }

    activeImportJob.value = job

    try {
      // Process each item
      // ...
    } catch (error) {
      job.status = 'failed'
      job.completedAt = Date.now()
    }

    activeImportJob.value = job
    return job
  }

  // Scene Management Actions
  const fetchScenes = async () => {
    scenesLoading.value = true
    try {
      const scenesCollection = collection(db, 'gallery_scenes')
      const scenesSnapshot = await getDocs(query(scenesCollection, orderBy('updatedAt', 'desc')))
      
      scenes.value = scenesSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Scene[]
    } catch (error) {
      console.error('Error fetching scenes:', error)
      throw error
    } finally {
      scenesLoading.value = false
    }
  }

  const createScene = async (name: string, backgroundImage: string | null = null): Promise<Scene> => {
    const newScene: Omit<Scene, 'id'> = {
      name,
      backgroundImage: backgroundImage || null, // Ensure we don't pass undefined
      backgroundScale: 1,
      layers: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    try {
      const scenesCollection = collection(db, 'gallery_scenes')
      const docRef = await addDoc(scenesCollection, newScene)
      
      const scene = { ...newScene, id: docRef.id }
      scenes.value.unshift(scene)
      currentScene.value = scene
      
      return scene
    } catch (error) {
      console.error('Error creating scene:', error)
      throw error
    }
  }

  const loadScene = async (sceneId: SceneId) => {
    try {
      const sceneDoc = await getDoc(doc(db, 'gallery_scenes', sceneId))
      if (sceneDoc.exists()) {
        currentScene.value = { ...sceneDoc.data(), id: sceneDoc.id } as Scene
        selectedLayers.value = []
      }
    } catch (error) {
      console.error('Error loading scene:', error)
      throw error
    }
  }

  const saveScene = async () => {
    if (!currentScene.value) return

    try {
      const sceneRef = doc(db, 'gallery_scenes', currentScene.value.id)
      const updateData = {
        ...currentScene.value,
        updatedAt: Date.now()
      }
      
      await updateDoc(sceneRef, updateData)
      
      // Update local scenes array
      const index = scenes.value.findIndex(s => s.id === currentScene.value!.id)
      if (index !== -1) {
        scenes.value[index] = { ...updateData }
      }
    } catch (error) {
      console.error('Error saving scene:', error)
      throw error
    }
  }

  const updateScene = (sceneData: Partial<Scene>) => {
    if (!currentScene.value) return
    
    currentScene.value = {
      ...currentScene.value,
      ...sceneData,
      updatedAt: Date.now()
    }
  }

  // Layer Management Actions
  const addLayer = (productSku: SKU, x: number, y: number): Layer => {
    if (!currentScene.value) throw new Error('No active scene')

    const asset = assets.value.find(a => a.sku === productSku)
    if (!asset) throw new Error('Asset not found')

    const newLayer: Layer = {
      id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productSku,
      x,
      y,
      z: Math.max(...currentScene.value.layers.map(l => l.z), 0) + 1,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: asset.defaults?.lockInitialScale || false,
      anchorX: asset.defaults?.anchor?.x || 0.5,
      anchorY: asset.defaults?.anchor?.y || 1,
      annotations: []
    }

    // Apply true-scale if calibration exists
    if (calibration.value && asset.physical) {
      const trueScale = calculateTrueScale(asset.physical.widthCm, asset.physical.heightCm)
      newLayer.scaleX = trueScale
      newLayer.scaleY = trueScale
    }

    currentScene.value.layers.push(newLayer)
    selectedLayers.value = [newLayer.id]
    
    return newLayer
  }

  const updateLayer = (layerId: LayerId, updates: Partial<Layer>) => {
    if (!currentScene.value) return

    const layerIndex = currentScene.value.layers.findIndex(l => l.id === layerId)
    if (layerIndex !== -1) {
      currentScene.value.layers[layerIndex] = {
        ...currentScene.value.layers[layerIndex],
        ...updates
      }
    }
  }

  const deleteLayer = (layerId: LayerId) => {
    if (!currentScene.value) return

    currentScene.value.layers = currentScene.value.layers.filter(l => l.id !== layerId)
    selectedLayers.value = selectedLayers.value.filter(id => id !== layerId)
  }

  const reorderLayer = (layerId: LayerId, direction: 'forward' | 'backward' | 'front' | 'back') => {
    if (!currentScene.value) return

    const layer = currentScene.value.layers.find(l => l.id === layerId)
    if (!layer) return

    const layers = currentScene.value.layers
    
    switch (direction) {
      case 'forward':
        layer.z = Math.min(layer.z + 1, Math.max(...layers.map(l => l.z)))
        break
      case 'backward':
        layer.z = Math.max(layer.z - 1, Math.min(...layers.map(l => l.z)))
        break
      case 'front':
        layer.z = Math.max(...layers.map(l => l.z)) + 1
        break
      case 'back':
        layer.z = Math.min(...layers.map(l => l.z)) - 1
        break
    }
  }

  // Calibration Actions
  const saveCalibration = async (newCalibration: DisplayCalibration) => {
    try {
      const configRef = doc(db, 'gallery_config', 'display_calibration')
      await updateDoc(configRef, { calibration: newCalibration })
      calibration.value = newCalibration
    } catch (error) {
      console.error('Error saving calibration:', error)
      throw error
    }
  }

  const loadCalibration = async () => {
    try {
      const configDoc = await getDoc(doc(db, 'gallery_config', 'display_calibration'))
      if (configDoc.exists()) {
        calibration.value = configDoc.data().calibration
      }
    } catch (error) {
      console.error('Error loading calibration:', error)
    }
  }

  const calculateTrueScale = (widthCm: number, _heightCm?: number): number => {
    if (!calibration.value) return 1
    
    // Calculate scale based on physical size and pixel density
    // This is a simplified calculation - in production, consider image dimensions
    const pixelsPerCm = calibration.value.pixelsPerCm
    return (widthCm * pixelsPerCm) / 100 // Assuming 100px base size
  }

  // Annotation Actions
  const addAnnotation = (layerId: LayerId, annotationData: Omit<Annotation, 'id' | 'createdAt'>) => {
    if (!currentScene.value) return

    const layer = currentScene.value.layers.find(l => l.id === layerId)
    if (!layer) return

    const annotation: Annotation = {
      ...annotationData,
      id: `annotation-${Date.now()}`,
      createdAt: Date.now(),
      author: 'Current User'
    } as Annotation

    if (!layer.annotations) layer.annotations = []
    layer.annotations.push(annotation)

    return annotation
  }

  const updateAnnotation = (layerId: LayerId, annotationId: string, updates: Partial<Omit<Annotation, 'id' | 'type' | 'createdAt'>>) => {
    if (!currentScene.value) return

    const layer = currentScene.value.layers.find(l => l.id === layerId)
    if (!layer?.annotations) return

    const annotationIndex = layer.annotations.findIndex(a => a.id === annotationId)
    if (annotationIndex === -1) return

    // Create a type-safe update that preserves the original annotation type
    const original = layer.annotations[annotationIndex]
    layer.annotations[annotationIndex] = {
      ...original,
      ...updates,
      // Ensure type safety by keeping the original type
      type: original.type,
      id: original.id,
      createdAt: original.createdAt
    } as Annotation
  }

  const deleteAnnotation = (layerId: LayerId, annotationId: string) => {
    if (!currentScene.value) return

    const layer = currentScene.value.layers.find(l => l.id === layerId)
    if (!layer || !layer.annotations) return

    layer.annotations = layer.annotations.filter(a => a.id !== annotationId)
  }

  // Export Actions
  const exportScene = async (options: ExportOptions): Promise<ExportBundle> => {
    if (!currentScene.value) throw new Error('No active scene')

    const exportId = `export_${Date.now()}`
    
    // This would integrate with backend export service
    // For now, return a mock bundle
    const bundle: ExportBundle = {
      id: exportId,
      sceneId: currentScene.value.id,
      type: options.type,
      options,
      files: [
        {
          name: `${currentScene.value.name}_${options.type}.${options.type === 'pdf' ? 'pdf' : 'zip'}`,
          path: `/exports/${exportId}/`,
          type: options.type === 'pdf' ? 'application/pdf' : 'application/zip',
          size: 1024000 // Mock size
        }
      ],
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    }

    exportHistory.value.unshift(bundle)
    return bundle
  }

  // Selection Actions
  const selectLayers = (layerIds: LayerId[]) => {
    selectedLayers.value = layerIds
  }

  const clearSelection = () => {
    selectedLayers.value = []
  }

  const toggleLayerSelection = (layerId: LayerId) => {
    const index = selectedLayers.value.indexOf(layerId)
    if (index === -1) {
      selectedLayers.value.push(layerId)
    } else {
      selectedLayers.value.splice(index, 1)
    }
  }

  // Initialize store
  const initialize = async () => {
    await Promise.all([
      fetchAssets(),
      fetchScenes(),
      loadCalibration()
    ])
  }

  return {
    // State
    assets,
    assetsLoading,
    currentScene,
    scenes,
    scenesLoading,
    calibration,
    selectedLayers,
    showAnnotations,
    showLayerPanel,
    activeImportJob,
    exportHistory,
    
    // Computed
    selectedLayersData,
    hasCalibration,
    visibleLayers,
    // Asset Actions
    fetchAssets,
    uploadAsset,
    bulkImport,
    fetchScenes,
    createScene,
    loadScene,
    saveScene,
    addLayer,
    updateLayer,
    deleteLayer,
    reorderLayer,
    saveCalibration,
    loadCalibration,
    calculateTrueScale,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    exportScene,
    selectLayers,
    clearSelection,
    toggleLayerSelection,
    updateScene,
    initialize
  }
})
