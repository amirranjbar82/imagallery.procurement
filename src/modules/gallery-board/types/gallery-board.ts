// GalleryBoard Types - Technical Requirements v1.1
// Date: 2025-09-11

export type SKU = string
export type LayerId = string
export type SceneId = string
export type AnnotationId = string
export type AnnotationType = 'text' | 'ink' | 'voice'

// Physical Size Interface
export interface PhysicalSize {
  widthCm: number
  heightCm: number
  depthCm?: number
  unit?: 'cm' | 'in'
}

// Product Metadata with Physical Size Support
export interface ProductMeta {
  sku: SKU
  title: string
  category: string
  tags?: string[]
  src: string
  thumb: string
  physical?: PhysicalSize // Required for true-scale rendering
  description?: string
  defaults?: Partial<Layer> & { 
    lockInitialScale?: boolean
    recommendedZ?: number
    anchor?: { x: number; y: number }
    shadow?: {
      blur: number
      dx: number
      dy: number
      alpha: number
    }
  }
}

// Annotation Base Interface
export interface AnnotationBase {
  id: AnnotationId
  type: AnnotationType
  createdAt: number
  author?: string
}

// Specific Annotation Types
export interface TextAnnotation extends AnnotationBase {
  type: 'text'
  html: string // Rich text content
}

export interface InkAnnotation extends AnnotationBase {
  type: 'ink'
  paths: Array<{
    points: number[] // Vector path points
    pressure?: number[] // Optional pressure data
  }>
}

export interface VoiceAnnotation extends AnnotationBase {
  type: 'voice'
  file: string // File path/URL
  durationMs?: number
  waveformData?: number[] // For thumbnail generation
}

export type Annotation = TextAnnotation | InkAnnotation | VoiceAnnotation

// Layer Interface with Annotations
export interface Layer {
  id: LayerId
  productSku: SKU
  x: number
  y: number
  z: number // Z-order for layering
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
  visible: boolean
  locked: boolean // Prevents transform and selection
  annotations?: Annotation[]
  // Transform anchor point (0-1 normalized)
  anchorX: number
  anchorY: number
}

// Color Palette for Export
export interface ColorInfo {
  hex: string
  r: number
  g: number
  b: number
  a?: number
  name?: string // Optional color name
}

// Customer Information
export interface CustomerInfo {
  name: string
  phone?: string
  email?: string
}

// Scene with Enhanced Metadata
export interface Scene {
  id: SceneId
  name: string
  backgroundImage: string | null
  backgroundScale: number
  layers: Layer[]
  createdAt: number
  updatedAt: number
  customer?: CustomerInfo
  palette?: {
    colors: ColorInfo[]
    extractedAt?: number
  }
  // Real-world markers for background scaling
  realWorldMarkers?: Array<{
    name: string
    realSizeCm: number
    pixelSize: number
  }>
}

// Display Calibration
export interface DisplayCalibration {
  pixelsPerCm: number
  method: 'specs' | 'card' // Calibration method used
  deviceInfo?: {
    diagonal: number // inches
    resolution: { width: number; height: number }
  }
  calibratedAt: number
  deviceId?: string
}

// Device Configuration
export interface DeviceConfig {
  calibration?: DisplayCalibration
  showroomName?: string
  defaultExportSettings?: {
    includePrices: boolean
    language: 'en' | 'fa'
    logoUrl?: string
  }
}

// Asset Upload/Ingest Types
export interface AssetUploadMeta {
  sku: SKU
  title: string
  category: string
  tags?: string[]
  description?: string
  physicalSize: PhysicalSize
  defaultScale?: number
  lockInitialScale?: boolean
  recommendedZ?: number
  anchorX?: number
  anchorY?: number
  shadowBlur?: number
  shadowDx?: number
  shadowDy?: number
  shadowAlpha?: number
}

// Bulk Import Types
export interface BulkImportJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalItems: number
  processedItems: number
  failedItems: number
  errors: Array<{
    row: number
    field?: string
    message: string
  }>
  createdAt: number
  completedAt?: number
}

// Export Bundle Types
export type ExportBundleType = 'snapshot' | 'pdf' | 'zip'

export interface ExportOptions {
  type: ExportBundleType
  includePrices?: boolean
  includeAnnotations?: boolean
  language?: 'en' | 'fa'
  customerInfo?: CustomerInfo
  resolution?: 'panel' | 'high' | 'print'
}

export interface ExportBundle {
  id: string
  sceneId: SceneId
  type: ExportBundleType
  options: ExportOptions
  files: Array<{
    name: string
    path: string
    type: string
    size: number
  }>
  createdAt: number
  expiresAt?: number
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Store State Types
export interface GalleryBoardState {
  // Assets
  assets: ProductMeta[]
  assetsLoading: boolean
  
  // Scenes
  currentScene: Scene | null
  scenes: Scene[]
  scenesLoading: boolean
  
  // Calibration
  calibration: DisplayCalibration | null
  
  // UI State
  selectedLayers: LayerId[]
  showAnnotations: boolean
  showLayerPanel: boolean
  
  // Import/Export
  activeImportJob: BulkImportJob | null
  exportHistory: ExportBundle[]
}

// Event Types for WebSocket
export interface WSEvent {
  type: string
  data: any
  timestamp: number
  userId?: string
}

export interface AnnotationEvent extends WSEvent {
  type: 'annotation:added' | 'annotation:updated' | 'annotation:deleted'
  data: {
    layerId: LayerId
    annotation: Annotation
  }
}

export interface CalibrationEvent extends WSEvent {
  type: 'calibration:updated'
  data: {
    calibration: DisplayCalibration
  }
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
