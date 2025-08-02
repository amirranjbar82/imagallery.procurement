export interface Document {
  documentId: string;
  name: string;
  description?: string;
  type: DocumentType;
  category: string;
  tags: string[];
  version: string;
  status: DocumentStatus;
  filePath: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  metadata: DocumentMetadata;
  parentDocumentId?: string;
  relatedEntityType?: EntityType;
  relatedEntityId?: string;
  permissions: DocumentPermissions;
  uploadedBy: string;
  lastModifiedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentVersion {
  versionId: string;
  documentId: string;
  version: string;
  filePath: string;
  fileSize: number;
  checksum: string;
  changeDescription?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface DocumentMetadata {
  author?: string;
  subject?: string;
  keywords?: string[];
  lastPrintDate?: Date;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  customFields?: { [key: string]: any };
}

export interface DocumentPermissions {
  canView: string[];
  canEdit: string[];
  canDelete: string[];
  canShare: string[];
  canApprove: string[];
  departmentAccess: string[];
  isPublic: boolean;
}

export interface DocumentLink {
  linkId: string;
  sourceDocumentId: string;
  targetDocumentId: string;
  linkType: LinkType;
  description?: string;
  createdBy: string;
  createdAt: Date;
}

export interface DocumentTemplate {
  templateId: string;
  name: string;
  description?: string;
  category: string;
  templatePath: string;
  fields: TemplateField[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateField {
  fieldId: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export type DocumentType = 'contract' | 'invoice' | 'report' | 'specification' | 'certificate' | 'policy' | 'manual' | 'other';
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived' | 'expired';
export type EntityType = 'supplier' | 'customer' | 'project' | 'task' | 'order' | 'inventory' | 'user' | 'department';
export type LinkType = 'related' | 'supersedes' | 'references' | 'attachment';
export type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'file';
