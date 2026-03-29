'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon,
  ClockIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { Button, Card, Badge, Modal, Progress, Alert } from '@/components/ui';
import { cn } from '@/lib/utils';

// Mock election data
const election = {
  id: '1',
  name: 'General Election 2027',
  status: 'voting_open' as const,
  positions: [
    {
      id: '1',
      title: 'President',
      description: 'Elect the President of Kenya',
      candidates: [
        { id: '1', name: 'Candidate A', party: 'Party A', photo: null },
        { id: '2', name: 'Candidate B', party: 'Party B', photo: null },
        { id: '3', name: 'Candidate C', party: 'Party C', photo: null },
      ],
    },
    {
      id: '2',
      title: 'Governor - Nairobi',
      description: 'Elect the Governor of Nairobi County',
      candidates: [
        { id: '4', name: 'Candidate D', party: 'Party A', photo: null },
        { id: '5', name: 'Candidate E', party: 'Party D', photo: null },
      ],
    },
  ],
};

// Mock batch status
const batchStatus = {
  status: 'active' as const,
  position: 1,
  totalPositions: 2,
  timeRemaining: 300, // 5 minutes in seconds
};

export default function VotePage() {
  const router = useRouter();
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({});
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteConfirmed, setVoteConfirmed] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  const currentPosition = election.positions[currentPositionIndex];

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [currentPosition.id]: candidateId,
    }));
  };

  const handleNextPosition = () => {
    if (currentPositionIndex < election.positions.length - 1) {
      setCurrentPositionIndex(prev => prev + 1);
    } else {
      setShowConfirmation(true);
    }
  };

  const handlePreviousPosition = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(prev => prev - 1);
    }
  };

  const handleSubmitVote = async () => {
    setIsSubmitting(true);
    try {
      // Simulate vote submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate confirmation number
      const confNum = `VOTE-${Date.now().toString(36).toUpperCase()}`;
      setConfirmationNumber(confNum);
      setVoteConfirmed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = selectedCandidates[currentPosition.id];

  // If vote is confirmed, show confirmation screen
  if (voteConfirmed) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card padding="lg" className="shadow-xl text-center">
          <div className="w-24 h-24 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-16 h-16 text-success" />
          </div>
          
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Vote Cast Successfully!</h2>
          <p className="text-neutral-600 mb-8">
            Your vote has been securely recorded on the blockchain.
          </p>

          <div className="bg-neutral-50 rounded-xl p-6 mb-8">
            <p className="text-sm text-neutral-500 mb-2">Confirmation Number</p>
            <p className="text-2xl font-mono font-bold text-neutral-900">{confirmationNumber}</p>
          </div>

          <Alert variant="info" className="mb-6 text-left">
            Please save your confirmation number. You can use it to verify your vote on the blockchain.
          </Alert>

          <Button
            fullWidth
            size="lg"
            onClick={() => router.push('/voter/dashboard')}
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Batch Status Banner */}
      <Card className="bg-gradient-to-r from-voter-500 to-voter-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <LockClosedIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{election.name}</h2>
              <p className="text-voter-100">Secure Voting Session</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <ClockIcon className="w-5 h-5" />
              <span className="font-mono text-lg">{Math.floor(batchStatus.timeRemaining / 60)}:{(batchStatus.timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
            <p className="text-sm text-voter-100">Time remaining</p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Position {batchStatus.position} of {batchStatus.totalPositions}</span>
            <span>{Math.round((batchStatus.position / batchStatus.totalPositions) * 100)}%</span>
          </div>
          <Progress value={batchStatus.position} max={batchStatus.totalPositions} variant="warning" />
        </div>
      </Card>

      {/* Security Notice */}
      <Alert variant="warning">
        <div className="flex items-center gap-3">
          <ShieldCheckIcon className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-medium">Your vote is encrypted and secure</p>
            <p className="text-sm">Each vote is encrypted with zero-knowledge proofs to ensure privacy while maintaining transparency.</p>
          </div>
        </div>
      </Alert>

      {/* Current Position Ballot */}
      <Card padding="lg">
        <div className="mb-6">
          <Badge variant="info" className="mb-2">Position {currentPositionIndex + 1} of {election.positions.length}</Badge>
          <h2 className="text-2xl font-bold text-neutral-900">{currentPosition.title}</h2>
          <p className="text-neutral-500">{currentPosition.description}</p>
        </div>

        <div className="space-y-4">
          {currentPosition.candidates.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => handleSelectCandidate(candidate.id)}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all text-left",
                selectedCandidates[currentPosition.id] === candidate.id
                  ? "border-voter-500 bg-voter-50"
                  : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                  selectedCandidates[currentPosition.id] === candidate.id
                    ? "border-voter-500 bg-voter-500 text-white"
                    : "border-neutral-300"
                )}>
                  {selectedCandidates[currentPosition.id] === candidate.id && (
                    <CheckCircleIcon className="w-5 h-5" />
                  )}
                </div>
                <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center">
                  <span className="text-neutral-500 font-semibold">
                    {candidate.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">{candidate.name}</p>
                  <p className="text-sm text-neutral-500">{candidate.party}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="secondary"
            onClick={handlePreviousPosition}
            disabled={currentPositionIndex === 0}
          >
            Previous
          </Button>
          <Button
            fullWidth
            onClick={handleNextPosition}
            disabled={!canProceed}
          >
            {currentPositionIndex === election.positions.length - 1 ? 'Review Vote' : 'Next Position'}
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Confirm Your Vote"
        size="lg"
        footer={
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
              Go Back
            </Button>
            <Button onClick={handleSubmitVote} loading={isSubmitting}>
              Submit Vote
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Please review your selections before submitting. Once submitted, your vote cannot be changed.
          </p>
          
          <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
            {election.positions.map((position, index) => (
              <div key={position.id} className="flex justify-between items-center">
                <span className="text-neutral-500">{position.title}</span>
                <span className="font-medium">
                  {position.candidates.find(c => c.id === selectedCandidates[position.id])?.name || 'Not selected'}
                </span>
              </div>
            ))}
          </div>

          <Alert variant="error">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="font-medium">Warning: This action is irreversible</span>
            </div>
          </Alert>
        </div>
      </Modal>
    </div>
  );
}
