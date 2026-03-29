/**
 * Vote Casting Page Component
 * Batch status, ballot display, submission modal, confirmation
 */

import React, { useState } from 'react';
import { Button, Card, Badge, Modal, ProgressBar, Alert } from '../../components/ui';
import { VoterLayout } from '../../components/layout';

// ============================================
// TYPES
// ============================================

interface Candidate {
  id: string;
  name: string;
  party: string;
  avatar?: string;
}

interface Position {
  id: string;
  name: string;
  candidates: Candidate[];
  selectedCandidate?: string;
}

// ============================================
// MOCK DATA
// ============================================

const POSITIONS: Position[] = [
  {
    id: 'president',
    name: 'President',
    candidates: [
      { id: 'p1', name: 'Raila Odinga', party: 'Azimio La Umoja' },
      { id: 'p2', name: 'William Ruto', party: 'Kenya Kwanza' },
      { id: 'p3', name: 'George Khaniri', party: 'Safina' },
      { id: 'p4', name: 'None of the Above', party: '' },
    ],
  },
  {
    id: 'governor',
    name: 'Governor - Nairobi',
    candidates: [
      { id: 'g1', name: 'Johnson Sakaja', party: 'UDA' },
      { id: 'g2', name: 'Mike Mbuvi Sonko', party: 'FKA' },
      { id: 'g3', name: 'Polycarp Igathe', party: 'Jubilee' },
      { id: 'g4', name: 'None of the Above', party: '' },
    ],
  },
  {
    id: 'senator',
    name: 'Senator - Nairobi',
    candidates: [
      { id: 's1', name: 'Aden Duale', party: 'UDA' },
      { id: 's2', name: 'Peterson Oloo', party: 'ODM' },
      { id: 's3', name: 'None of the Above', party: '' },
    ],
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export const VotePage: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>(POSITIONS);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState(0);

  // Batch status simulation
  const batchStatus = {
    position: 1457,
    total: 5000,
    timeRemaining: 120,
  };

  const handleSelectCandidate = (positionId: string, candidateId: string) => {
    setPositions(prev => prev.map(pos => 
      pos.id === positionId 
        ? { ...pos, selectedCandidate: candidateId }
        : pos
    ));
  };

  const completedPositions = positions.filter(p => p.selectedCandidate).length;
  const totalPositions = positions.length;
  const canSubmit = completedPositions === totalPositions;

  const handleSubmit = async () => {
    setSubmitting(true);
    setShowConfirmModal(false);
    
    // Simulate submission stages
    const stages = [
      { message: 'Encrypting your vote...', duration: 2000 },
      { message: 'Submitting to blockchain...', duration: 2500 },
      { message: 'Confirming transaction...', duration: 2000 },
    ];

    for (let i = 0; i < stages.length; i++) {
      setSubmitStage(i);
      await new Promise(resolve => setTimeout(resolve, stages[i].duration));
    }

    setSubmitting(false);
    setShowSuccessModal(true);
  };

  return (
    <VoterLayout>
      {/* Security Banner */}
      <Alert variant="info" className="mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <p className="font-medium">Secure Voting Session</p>
            <p className="text-sm">Your vote is encrypted and will be recorded on the blockchain</p>
          </div>
        </div>
      </Alert>

      {/* Batch Status Panel */}
      <Card variant="default" className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-voter-50">
              <svg className="w-6 h-6 text-voter-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Batch Status</p>
              <p className="font-semibold">Position #{batchStatus.position.toLocaleString()} of {batchStatus.total.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex-1 max-w-xs">
            <ProgressBar 
              value={batchStatus.position} 
              max={batchStatus.total} 
              size="sm"
              color="voter"
              showLabel
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-voter-500">{batchStatus.timeRemaining}s</p>
              <p className="text-xs text-neutral-500">Time Left</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
              </span>
              <span className="text-sm text-neutral-600">Secure</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-neutral-900">Your Ballot</h2>
          <Badge variant={canSubmit ? 'success' : 'warning'}>
            {completedPositions} / {totalPositions} positions completed
          </Badge>
        </div>
        <ProgressBar 
          value={completedPositions} 
          max={totalPositions} 
          size="md"
          color="voter"
        />
      </div>

      {/* Ballot */}
      <div className="space-y-6">
        {positions.map((position) => (
          <Card key={position.id} variant="default" padding="lg">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">{position.name}</h3>
            
            <div className="space-y-3">
              {position.candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => handleSelectCandidate(position.id, candidate.id)}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                    ${position.selectedCandidate === candidate.id
                      ? 'border-voter-500 bg-voter-50'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    }
                  `}
                >
                  {/* Radio indicator */}
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${position.selectedCandidate === candidate.id
                      ? 'border-voter-500 bg-voter-500'
                      : 'border-neutral-300'
                    }
                  `}>
                    {position.selectedCandidate === candidate.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                    {candidate.avatar ? (
                      <img src={candidate.avatar} alt={candidate.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-neutral-500 font-semibold">
                        {candidate.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Candidate info */}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-neutral-900">{candidate.name}</p>
                    {candidate.party && (
                      <p className="text-sm text-neutral-500">{candidate.party}</p>
                    )}
                  </div>

                  {/* Selected check */}
                  {position.selectedCandidate === candidate.id && (
                    <svg className="w-6 h-6 text-voter-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8">
        <Button 
          onClick={() => setShowConfirmModal(true)}
          disabled={!canSubmit}
          fullWidth
          size="lg"
        >
          Submit Your Vote
        </Button>
        
        {!canSubmit && (
          <p className="text-center text-sm text-neutral-500 mt-2">
            Please complete all positions to submit your vote
          </p>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Your Vote"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Review Ballot
            </Button>
            <Button onClick={handleSubmit}>
              Confirm & Submit
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Alert variant="warning">
            <p className="text-sm">
              <strong>Important:</strong> Once you submit your vote, it cannot be changed. 
              Please review your selections carefully.
            </p>
          </Alert>

          <div className="space-y-3">
            {positions.map((position) => (
              <div key={position.id} className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-neutral-600">{position.name}</span>
                <span className="font-medium">
                  {position.candidates.find(c => c.id === position.selectedCandidate)?.name || 'Not selected'}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Your vote will be encrypted and recorded on the blockchain
            </div>
          </div>
        </div>
      </Modal>

      {/* Submission Progress Modal */}
      <Modal
        isOpen={submitting}
        onClose={() => {}}
        size="md"
      >
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-voter-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-voter-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            {['Encrypting your vote...', 'Submitting to blockchain...', 'Confirming transaction...'][submitStage]}
          </h3>
          
          <div className="mt-6">
            <ProgressBar 
              value={submitStage + 1} 
              max={3} 
              size="md"
              color="voter"
            />
          </div>

          <p className="text-sm text-neutral-500 mt-4">
            Please do not close this window
          </p>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {}}
        size="md"
      >
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <svg className="w-12 h-12 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Vote Submitted!</h2>
          <p className="text-neutral-500 mb-6">Your vote has been securely recorded on the blockchain</p>

          <Card variant="outlined" className="text-left mb-6">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500">Confirmation Number</p>
                <p className="font-mono font-semibold text-lg">VR-2026-001547-VOTE-8A3F</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Transaction Hash</p>
                <p className="font-mono text-sm text-neutral-600 break-all">
                  0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Timestamp</p>
                <p className="font-medium">March 28, 2026 at 10:45:32 AM</p>
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button variant="secondary" fullWidth>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </Button>
            <Button fullWidth>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Modal>
    </VoterLayout>
  );
};

export default VotePage;
