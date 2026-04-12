'use client';

import { useState, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Input, Badge, Alert } from '@/components/ui';
import observerService, { VoteVerification } from '@/services/observer';

export default function ObserverBlockchainPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoteVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = useCallback(async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a transaction hash or voter ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await observerService.verifyVote(searchQuery.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to verify vote');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-observer-50 dark:bg-observer-900/30">
            <CubeIcon className="w-8 h-8 text-observer-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Blockchain Verification
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Verify individual votes on the blockchain
            </p>
          </div>
        </div>
      </Card>

      {/* Search Card */}
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Transaction Hash or Voter ID
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter transaction hash or voter ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleVerify}
                loading={loading}
                disabled={loading || !searchQuery.trim()}
                className="px-6"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="error" title="Verification Failed">
              {error}
            </Alert>
          )}
        </div>
      </Card>

      {/* Results Card */}
      {result && (
        <Card>
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`rounded-xl p-6 flex items-center gap-4 ${
              result.verified 
                ? 'bg-success-light dark:bg-success/10' 
                : 'bg-error-light dark:bg-error/10'
            }`}>
              {result.verified ? (
                <>
                  <div className="p-3 rounded-full bg-success/20">
                    <CheckCircleIcon className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-success">
                        Vote Verified
                      </h3>
                      <Badge variant="success">Valid</Badge>
                    </div>
                    <p className="text-sm text-success/80 mt-1">
                      This vote has been recorded on the blockchain
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-full bg-error/20">
                    <XCircleIcon className="w-8 h-8 text-error" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-error">
                        Vote Not Found
                      </h3>
                      <Badge variant="error">Invalid</Badge>
                    </div>
                    <p className="text-sm text-error/80 mt-1">
                      No vote record found for this transaction
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Verification Details */}
            {result.verified && (
              <div className="grid gap-4">
                {/* Block Number */}
                <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                    <CubeIcon className="w-5 h-5" />
                    <span>Block Number</span>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {result.transactionHash || 'N/A'}
                  </span>
                </div>

                {/* Timestamp */}
                <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                    <ClockIcon className="w-5 h-5" />
                    <span>Timestamp</span>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {result.timestamp 
                      ? new Date(result.timestamp).toLocaleString() 
                      : 'N/A'}
                  </span>
                </div>

                {/* Vote Hash */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Vote Hash</span>
                  </div>
                  <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100">
                    {result.transactionHash 
                      ? result.transactionHash.substring(0, 16) + '...' 
                      : 'N/A'}
                  </span>
                </div>
              </div>
            )}

            {/* Message */}
            {!result.verified && (
              <div className="text-sm text-neutral-500 dark:text-neutral-400 pt-2">
                Vote verification failed. The transaction may not exist or may have failed.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <div className="flex gap-4">
          <InformationCircleIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
              How Blockchain Verification Works
            </h4>
            <div className="text-sm text-primary-700 dark:text-primary-300 space-y-2">
              <p>
                Every vote cast in this election is recorded on a blockchain, creating an immutable 
                and transparent record of the voting process.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Transaction Hash:</strong> A unique identifier for each vote 
                  transaction on the blockchain
                </li>
                <li>
                  <strong>Immutable Record:</strong> Once recorded, votes cannot be 
                  altered or deleted
                </li>
                <li>
                  <strong>Public Verification:</strong> Anyone can verify that a 
                  specific vote was recorded
                </li>
                <li>
                  <strong>Transparency:</strong> All verified votes contribute 
                  to the final tally
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}