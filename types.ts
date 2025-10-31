
// Matches the 'user_role' enum in Supabase
export enum UserRole {
  APPRAISER = 'appraiser@zankli.com',
  HR = 'zanklihr@gmail.com',
  DOCS = 'docs.zmc@gmail.com',
  MD = 'mdzankli@gmail.com',
  CHAIRMAN = 'chairmanzankli@gmail.com',
}

// Matches the 'department' enum in Supabase
export enum Department {
  GOPD = 'GOPD',
  OPD = 'OPD',
  MAINTENANCE = 'MAINTENANCE',
  DRIVERS = 'DRIVERS',
  NURSES = 'NURSES',
  NURSES_ATTENDANTS = 'NURSES ATTENDANTS',
  INTERNAL_SECURITY = 'INTERNAL SECURITY',
  ADMIN = 'ADMIN',
  FRONT_DESK = 'FRONT DESK',
  LAB = 'LAB',
  RADIOLOGY = 'RADIOLOGY',
  BILLING = 'BILLING',
  INTERNAL_AUDIT = 'INTERNAL AUDIT',
  ACCOUNTS = 'ACCOUNTS',
  PAEDIATRICS = 'PAEDIATRICS',
  PHARMACY = 'PHARMACY',
  ICT = 'ICT',
}

// Matches the 'appraisal_status' enum in Supabase
export enum AppraisalStatus {
  DRAFT = 'Draft',
  PENDING_HR_APPROVAL = 'Pending HR Approval',
  PENDING_DOCS_APPROVAL = 'Pending Docs Approval',
  PENDING_MD_APPROVAL = 'Pending MD Approval',
  PENDING_CHAIRMAN_APPROVAL = 'Pending Chairman Approval',
  COMPLETED = 'Completed',
}

// Represents the 'profiles' table
export interface Profile {
  id: string; // UUID from auth.users
  full_name: string;
  role: UserRole;
}

// Represents the 'scores' JSONB column
export interface Score {
  [key: string]: number;
}

export interface AppraisalSection {
  title: string;
  questions: string[];
}

// Represents the 'signatures' table, with joined profile data
export interface Signature {
  id: string;
  appraisal_id: string;
  signer_id: string;
  comment?: string;
  signature_url: string;
  signed_at: string;
  profiles: Profile | null; // Profile of the signer
}

// Represents the 'appraisals' table
export interface Appraisal {
  id: string;
  employee_name: string;
  department: Department;
  hod_name: string;
  hod_signature_url: string; // URL to storage
  scores: Score;
  comments: string;
  overall_score: number;
  overall_rating: string;
  status: AppraisalStatus;
  created_by: string; // UUID of creator
  created_at: string;
}

// Type for a detailed view, including signatures
export type AppraisalWithSignatures = Appraisal & {
  signatures: Signature[];
}
