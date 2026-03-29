// ===========================================
// CORE TYPE DEFINITIONS
// Location: src/types/index.ts
// ===========================================

// ===========================================
// USER & AUTH TYPES
// ===========================================

export type UserRole = 'super_admin' | 'admin' | 'returning_officer' | 'sub_ro' | 'voter';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  county?: string;
  constituency?: string;
  ward?: string;
  avatar?: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// ===========================================
// VOTER TYPES
// ===========================================

export type RegistrationStatus = 'not_registered' | 'pending' | 'verified' | 'rejected';

export interface VoterProfile {
  id: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  email?: string;
  phone?: string;
  county: string;
  constituency: string;
  ward: string;
  registrationStatus: RegistrationStatus;
  biometricsEnrolled: {
    face: boolean;
    fingerprints: boolean;
  };
  registeredAt?: string;
  verifiedAt?: string;
}

export interface VoterRegistrationData {
  nationalId: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  county: string;
  constituency: string;
  ward: string;
  email?: string;
  phone?: string;
  faceTemplate: string;
  fingerprints: FingerprintData[];
  password: string;
  securityQuestions: SecurityAnswer[];
}

export interface FingerprintData {
  finger: string;
  template: string;
  quality: number;
}

export interface SecurityAnswer {
  questionId: string;
  answer: string;
}

// ===========================================
// ELECTION TYPES
// ===========================================

export type ElectionStatus = 'draft' | 'published' | 'registration_open' | 'voting_open' | 'voting_closed' | 'results_published' | 'cancelled';

export interface Election {
  id: string;
  name: string;
  type: 'general' | 'by-election' | 'primary';
  status: ElectionStatus;
  description?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  positions: Position[];
  counties: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  title: string;
  description?: string;
  level: 'national' | 'county' | 'constituency' | 'ward';
  maxCandidates: number;
  candidates: Candidate[];
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  partySymbol?: string;
  photo?: string;
  bio?: string;
  county?: string;
  constituency?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  approvedBy?: string;
  createdAt: string;
}

// ===========================================
// COUNTY & LOCATION TYPES
// ===========================================

export interface County {
  code: string;
  name: string;
  region: string;
  constituencies: Constituency[];
}

export interface Constituency {
  code: string;
  name: string;
  countyCode: string;
  wards: Ward[];
}

export interface Ward {
  code: string;
  name: string;
  constituencyCode: string;
}

// ===========================================
// VOTING TYPES
// ===========================================

export interface Batch {
  id: string;
  electionId: string;
  status: BatchStatus;
  position: number;
  totalVoters: number;
  votesCollected: number;
  startTime?: string;
  endTime?: string;
}

export type BatchStatus = 'waiting' | 'active' | 'submitting' | 'completed' | 'expired';

export interface VoteSubmission {
  batchId: string;
  encryptedVote: string;
  zkProof: string;
  timestamp: number;
}

export interface VoteConfirmation {
  confirmationNumber: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
  electionId: string;
  voterId: string;
}

// ===========================================
// ADMIN TYPES
// ===========================================

export interface ReturningOfficer {
  id: string;
  userId: string;
  user: User;
  county: County;
  status: 'pending' | 'approved' | 'suspended';
  assignedAt?: string;
  approvedBy?: string;
}

export interface DashboardStats {
  voters: {
    total: number;
    registered: number;
    verified: number;
    pending: number;
    change: number;
  };
  votes: {
    total: number;
    turnout: number;
    lastHour: number;
  };
  counties: {
    total: number;
    active: number;
  };
  ro: {
    total: number;
    approved: number;
    pending: number;
  };
}

export interface ActivityItem {
  id: string;
  type: 'ro_application' | 'candidate' | 'election' | 'vote' | 'system';
  action: string;
  details: string;
  timestamp: string;
  user?: string;
  status: 'success' | 'warning' | 'error';
}

// ===========================================
// NOTIFICATION TYPES
// ===========================================

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===========================================
// FORM TYPES
// ===========================================

export interface FormFieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}
