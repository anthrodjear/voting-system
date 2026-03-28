# Vote Page

## Overview

The Vote Page is the core secure voting interface implementing Smart Group-Based Voting with dynamic batch management. It provides a seamless voting experience while maintaining the security and integrity required for national elections.

---

## 1. Page Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VOTING PAGE FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│   │   Login    │────>│  Biometric │────>│  Batch     │                   │
│   │   Check    │     │  Verify    │     │  Assign    │                   │
│   └─────────────┘     └─────────────┘     └─────────────┘                   │
│                                                  │                           │
│                                                  ▼                           │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│   │ Confirmation│<────│  Submit    │<────│  Ballot    │                   │
│   │            │     │  Vote     │     │  Display   │                   │
│   └─────────────┘     └─────────────┘     └─────────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Components

### 2.1 Batch Status Display

```typescript
// Batch status component
interface BatchStatusProps {
  batchId: string;
  status: 'waiting' | 'active' | 'submitting' | 'completed';
  position: number;
  totalInBatch: number;
  estimatedWait: number;
  votesCollected: number;
  timeRemaining: number;
}

export function BatchStatusDisplay({ 
  batchId, 
  status, 
  position, 
  totalInBatch,
  estimatedWait,
  votesCollected,
  timeRemaining 
}: BatchStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'submitting': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'waiting': return 'Waiting for batch to start';
      case 'active': return 'Ready to vote';
      case 'submitting': return 'Submitting votes';
      case 'completed': return 'Batch completed';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Your Batch Status</h3>
        <Badge variant={status === 'active' ? 'green' : 'yellow'}>
          {getStatusText()}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Position in batch */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Your position</span>
          <span className="font-bold text-2xl">{position} / {totalInBatch}</span>
        </div>

        {/* Batch progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Batch progress</span>
            <span className="font-medium">{votesCollected} votes</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getStatusColor()} rounded-full transition-all`}
              style={{ width: `${(votesCollected / totalInBatch) * 100}%` }}
            />
          </div>
        </div>

        {/* Time remaining */}
        {status === 'active' && (
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-gray-600">Time remaining</span>
            <span className="font-mono text-xl font-bold text-orange-600">
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}

        {/* Heartbeat indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Connection active - heartbeat sent</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Ballot Display

### 3.1 Ballot Component

```typescript
// Ballot selection component
interface BallotProps {
  positions: Position[];
  selected: Record<string, string>; // position -> candidateId
  onSelect: (position: string, candidateId: string) => void;
}

export function BallotDisplay({ positions, selected, onSelect }: BallotProps) {
  return (
    <div className="space-y-6">
      {positions.map((position) => (
        <div key={position.id} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">{position.title}</h3>
          
          <div className="space-y-3">
            {position.candidates.map((candidate) => (
              <button
                key={candidate.id}
                className={`
                  w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4
                  ${selected[position.id] === candidate.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'}
                `}
                onClick={() => onSelect(position.id, candidate.id)}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img 
                    src={candidate.photo} 
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{candidate.name}</p>
                  <p className="text-sm text-gray-500">{candidate.party}</p>
                </div>
                {selected[position.id] === candidate.id && (
                  <CheckCircleIcon className="w-6 h-6 text-blue-500" />
                )}
              </button>
            ))}
            
            {/* None of the above option */}
            <button
              className={`
                w-full p-4 rounded-lg border-2 transition-all
                ${selected[position.id] === 'none' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => onSelect(position.id, 'none')}
            >
              <span className="font-medium text-gray-600">None of the above</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Vote Submission

### 4.1 Submission Flow

```typescript
// Vote submission hook
export function useVoteSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<SubmissionProgress | null>(null);

  const submitVote = async (encryptedVote: EncryptedVote) => {
    setIsSubmitting(true);
    setProgress({ stage: 'encrypting', message: 'Encrypting your vote...' });

    try {
      // Stage 1: Client-side encryption
      await sleep(500); // Simulated
      setProgress({ stage: 'submitting', message: 'Submitting to batch...' });

      // Stage 2: Submit to batch
      const response = await fetch('/api/votes/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encryptedVote: encryptedVote.data,
          zkProof: encryptedVote.proof,
          batchId: currentBatchId
        })
      });

      if (!response.ok) throw new Error('Submission failed');

      setProgress({ stage: 'confirming', message: 'Confirming on blockchain...' });

      // Stage 3: Wait for blockchain confirmation
      const result = await waitForConfirmation(response.json().confirmationId);

      setProgress({ stage: 'complete', message: 'Vote recorded!' });

      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitVote, isSubmitting, progress };
}

// Submission progress component
export function SubmissionProgress({ progress }: { progress: SubmissionProgress }) {
  const stages = ['encrypting', 'submitting', 'confirming', 'complete'];
  const currentIndex = stages.indexOf(progress.stage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            {progress.stage === 'complete' ? (
              <CheckCircleIcon className="w-16 h-16 text-green-500" />
            ) : (
              <LoadingSpinner className="w-16 h-16 text-blue-500" />
            )}
          </div>
          
          <h3 className="text-xl font-bold mb-2">
            {progress.stage === 'complete' ? 'Vote Submitted!' : 'Submitting Your Vote'}
          </h3>
          
          <p className="text-gray-600 mb-6">{progress.message}</p>

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-2">
            {stages.map((stage, index) => (
              <div key={stage} className="flex items-center">
                <div 
                  className={`
                    w-3 h-3 rounded-full
                    ${index < currentIndex ? 'bg-green-500' : 
                      index === currentIndex ? 'bg-blue-500 animate-pulse' : 'bg-gray-200'}
                  `}
                />
                {index < stages.length - 1 && (
                  <div className={`w-8 h-0.5 ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Security Features

### 5.1 Vote Encryption

```typescript
// Client-side vote encryption
export async function encryptVote(
  selections: Record<string, string>,
  electionPublicKey: string
): Promise<EncryptedVote> {
  // 1. Encode selections as integer vector
  const encoded = encodeSelections(selections);
  
  // 2. Add random padding
  const padded = addRandomPadding(encoded);
  
  // 3. Encrypt with election public key (homomorphic)
  const encrypted = await heEncrypt(padded, electionPublicKey);
  
  // 4. Generate ZK proof
  const proof = await generateVoteProof(encrypted, encoded);
  
  return {
    data: encrypted.toBase64(),
    proof: proof.toBase64(),
    timestamp: Date.now()
  };
}
```

---

## 6. Confirmation

### 6.1 Vote Confirmation Display

```typescript
// Confirmation component
export function VoteConfirmation({ 
  confirmation 
}: { 
  confirmation: VoteConfirmation 
}) {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircleIcon className="w-12 h-12 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Vote Recorded Successfully!</h2>
      <p className="text-gray-600 mb-6">
        Your vote has been securely recorded on the blockchain.
      </p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Confirmation Number</p>
            <p className="font-mono font-bold">{confirmation.confirmationNumber}</p>
          </div>
          <div>
            <p className="text-gray-500">Time</p>
            <p className="font-medium">{formatDateTime(confirmation.timestamp)}</p>
          </div>
          <div>
            <p className="text-gray-500">Transaction Hash</p>
            <p className="font-mono text-xs truncate">{confirmation.txHash}</p>
          </div>
          <div>
            <p className="text-gray-500">Block</p>
            <p className="font-medium">#{confirmation.blockNumber}</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> Save your confirmation number. It is the 
          only proof that your vote was recorded. You can use it to verify 
          your vote was counted without revealing who you voted for.
        </p>
      </div>

      <Button 
        variant="primary" 
        onClick={() => window.print()}
        className="w-full"
      >
        Print Confirmation
      </Button>
    </div>
  );
}
```

---

## 7. Error Handling

### 7.1 Error States

```typescript
// Voting error handling
const votingErrors = {
  'ALREADY_VOTED': {
    title: 'You Have Already Voted',
    message: 'Your National ID has already been used to cast a vote in this election.',
    icon: AlertTriangleIcon
  },
  'BATCH_EXPIRED': {
    title: 'Batch Expired',
    message: 'Your batch session has expired due to inactivity. Please join a new batch to vote.',
    icon: ClockIcon
  },
  'NETWORK_ERROR': {
    title: 'Connection Error',
    message: 'Unable to connect to the voting server. Please check your internet connection.',
    icon: WifiIcon
  },
  'VERIFICATION_FAILED': {
    title: 'Verification Failed',
    message: 'Your biometric verification could not be completed. Please try again.',
    icon: UserIcon
  }
};

export function VotingError({ code }: { code: keyof typeof votingErrors }) {
  const error = votingErrors[code];
  
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <error.icon className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">{error.title}</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <Button variant="primary" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );
}
```
