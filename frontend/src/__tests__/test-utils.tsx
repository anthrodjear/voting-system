// ============================================
// TEST UTILITIES
// Location: src/__tests__/test-utils.tsx
// ============================================

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/providers/auth-provider';

// Default query client for testing
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

// Wrapper component for providers
interface WrapperProps {
  children: ReactNode;
}

const TestWrapper = ({ children }: WrapperProps) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Custom render function with providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, { wrapper: TestWrapper, ...options });
}

// Re-export testing library utilities
export * from '@testing-library/react';

// Export custom render
export { customRender as render };

// Mock user data factory
export const mockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'voter' as const,
  phone: '+1234567890',
  county: 'Nairobi',
  constituency: 'Westlands',
  ward: 'Kitisuru',
  isVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Mock batch data factory
export const mockBatch = (overrides = {}) => ({
  id: 'batch-1',
  status: 'waiting' as const,
  position: 1,
  totalVoters: 10,
  startTime: new Date(Date.now() + 600000).toISOString(),
  electionId: 'election-1',
  ...overrides,
});

// Mock position data factory
export const mockPosition = (overrides = {}) => ({
  id: 'position-1',
  title: 'President',
  description: 'Elect the President of Kenya',
  level: 'national' as const,
  maxCandidates: 1,
  candidates: [
    { id: 'candidate-1', name: 'Candidate A', party: 'Party A', symbol: 'A' },
    { id: 'candidate-2', name: 'Candidate B', party: 'Party B', symbol: 'B' },
  ],
  ...overrides,
});

// Mock vote confirmation factory
export const mockVoteConfirmation = (overrides = {}) => ({
  confirmationNumber: 'CONF-123456',
  timestamp: new Date().toISOString(),
  txHash: '0x1234567890abcdef',
  blockNumber: 12345678,
  ...overrides,
});

// Create a mock function
export const createMockFn = <T extends (...args: unknown[]) => unknown>(
  implementation?: T
): jest.Mock => {
  return jest.fn(implementation);
};

// Wait for a condition to be true
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 1000
): Promise<void> => {
  const startTime = Date.now();
  while (condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
};
