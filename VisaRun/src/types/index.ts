export type CheckpointType = 'land' | 'air';
export type CheckpointStatus = 'open' | 'closed' | 'busy';

export interface Checkpoint {
  id: string;
  name: string;
  nameLocal: string;
  type: CheckpointType;
  status: CheckpointStatus;
  hours: string;
  lat: number;
  lng: number;
  pitfalls: string[];
  description: string;
}

export interface Tour {
  id: string;
  from: string;
  to: string;
  checkpointId: string;
  departure: string;
  priceUsd: number;
  seatsLeft: number;
  vehicle: string;
}

export interface Agent {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  services: string[];
  priceFrom: number;
  reviews: { author: string; text: string; rating: number }[];
}

export interface CompanionPost {
  id: string;
  author: string;
  route: string;
  date: string;
  seatsNeeded: number;
  message: string;
  transport: string;
}

export interface BorderReport {
  id: string;
  checkpointId: string;
  author: string;
  time: string;
  message: string;
}

export type VisaLimit = 30 | 45 | 90;
export type Citizenship = 'RU' | 'DE' | 'KZ';
export type EntryType = 'visa-free' | 'e-visa';
export type Currency = 'VND' | 'USD' | 'RUB';

export interface VisaRunRecord {
  id: string;
  entryDate: string;
  checkpoint: string;
  entryType: EntryType;
  exitDate?: string;
}

export interface VisaTrackerState {
  entryDate: string;
  exitDate: string;
  dayLimit: VisaLimit;
  location: string;
  citizenship: Citizenship;
  entryType: EntryType;
  visaRunHistory: VisaRunRecord[];
}

export interface ReminderSettings {
  days14: boolean;
  days7: boolean;
  days3: boolean;
  days1: boolean;
}

export interface AppSettings {
  reminders: ReminderSettings;
  notificationTime: string;
  criticalAlerts: boolean;
  currency: Currency;
  offlineCache: boolean;
  biometricsEnabled: boolean;
  pinEnabled: boolean;
  pinCode: string;
  partnerMode: boolean;
  partnerRoute: string;
  partnerTariff: string;
  documentCacheSize: number;
}

export type Language = 'ru' | 'en' | 'vi';

export interface Client {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AppNotificationType = 'deadline' | 'critical' | 'overstay';

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  daysRemaining?: number;
}

export type ChecklistCategory = 'documents' | 'money' | 'route' | 'timing';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  labelRu: string;
  labelEn: string;
  labelVi: string;
  required: boolean;
}

export interface EVisaFormData {
  fullName: string;
  passportNumber: string;
  icaoLine: string;
  nationality: string;
  photoUploaded: boolean;
  preArrivalCompleted: boolean;
}
