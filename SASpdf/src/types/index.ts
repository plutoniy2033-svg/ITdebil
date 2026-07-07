export type ToolMode =
  | 'select'
  | 'text'
  | 'edit-text'
  | 'note'
  | 'signature'
  | 'image'
  | 'redact';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface PdfAnnotation {
  id: string;
  type: 'text' | 'note' | 'signature' | 'image' | 'redact' | 'edit-text';
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  color?: string;
  imageData?: string;
  originalText?: string;
  sourceBlockId?: string;
}

export interface SecuritySettings {
  userPassword: string;
  ownerPassword: string;
  allowPrinting: boolean;
  allowCopying: boolean;
  allowEditing: boolean;
}

export interface PdfDocumentState {
  fileName: string;
  numPages: number;
  currentPage: number;
  scale: number;
  annotations: PdfAnnotation[];
}
