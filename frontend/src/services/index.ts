// ===========================================
// SERVICES INDEX
// Location: src/services/index.ts
// ===========================================

// API Client
export { 
  api, 
  apiClient,
  ApiException, 
  UnauthorizedException
} from './api-client';

// Auth Service
export { 
  login, 
  logout, 
  refreshToken, 
  getCurrentUser, 
  register, 
  updateProfile, 
  changePassword, 
  requestPasswordReset, 
  resetPassword, 
  verifyEmail, 
  resendVerificationEmail, 
  validateSession 
} from './auth';

export type { 
  LoginCredentials, 
  RegisterData, 
  RefreshTokenResponse 
} from './auth';

// Voter Service
export { 
  checkIdAvailability, 
  lookupNiif, 
  register as registerVoter, 
  getProfile, 
  getRegistrationStatus, 
  updateProfile as updateVoterProfile, 
  enrollBiometrics, 
  getBiometricStatus, 
  getVoters, 
  getVoterById, 
  verifyVoter as verifyVoterRecord, 
  rejectVoter as rejectVoterRecord, 
  getVoterStats 
} from './voter';

export type { 
  NiifLookupResult, 
  RegistrationStatusResponse, 
  VoterFilterParams 
} from './voter';

// Election Service
export { 
  getElections, 
  getCurrentElection, 
  getElectionById, 
  getElectionWithResults, 
  getElectionPositions, 
  getPositionCandidates, 
  getCandidateById, 
  getCandidates, 
  submitCandidateApplication, 
  approveCandidate, 
  rejectCandidate, 
  getElectionsByType, 
  getUpcomingElections, 
  getElectionTimeline 
} from './election';

export type { 
  ElectionFilterParams, 
  ElectionWithResults 
} from './election';

// Vote Service
export { 
  joinBatch, 
  getBatchStatus, 
  leaveBatch, 
  submitVote, 
  getConfirmation, 
  getVoteReceipt, 
  hasVoted, 
  getPendingVotes, 
  getVotingProgress, 
  verifyVoteOnChain, 
  getLiveResults, 
  requestBallot, 
  cancelBallotRequest 
} from './vote';

export type { 
  VoteData, 
  BatchStatusResponse, 
  VoteReceipt, 
  PendingVote 
} from './vote';

// Admin Service
export { 
  getDashboardStats, 
  getActivityFeed, 
  getReturningOfficers, 
  getReturningOfficerById, 
  approveRO, 
  rejectRO, 
  suspendRO, 
  reactivateRO, 
  getCounties, 
  getCountyByCode, 
  assignROToCounty, 
  getSystemHealth, 
  getAuditLogs, 
  getAdminUsers, 
  createAdminUser, 
  updateAdminUser, 
  deleteAdminUser 
} from './admin';

export type { 
  AdminFilterParams, 
  SystemHealth, 
  AuditLog 
} from './admin';

// RO Service
export { 
  getDashboardStats as getRODashboardStats, 
  getPendingApprovals, 
  getVotingProgress as getROVotingProgress, 
  getCountyVoters, 
  verifyVoter as verifyROVoter, 
  rejectVoter as rejectROVoter, 
  getActiveBatches, 
  getBatchById as getROBatchById, 
  closeBatch as closeROBatch, 
  getCountyElections, 
  getVoterStatistics, 
  getVotingStatistics, 
  getRecentActivity, 
  exportVoters 
} from './ro';

export type { 
  RODashboardStats, 
  PendingApproval, 
  VotingProgress, 
  CountyVoter, 
  VoterManagementFilter 
} from './ro';
