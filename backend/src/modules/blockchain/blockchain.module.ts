/**
 * Blockchain Module
 * 
 * NestJS module for blockchain service integration with Hyperledger Besu.
 * Provides blockchain-based vote recording and verification with:
 * - Circuit breaker pattern for resilience
 * - Graceful degradation when blockchain unavailable
 * - Service health indicators
 */

import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlockchainService } from '../../services/blockchain.service';
import { BlockchainController } from './blockchain.controller';

/**
 * Circuit breaker state
 */
enum CircuitBreakerState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

/**
 * Circuit breaker configuration
 */
interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  resetTimeout: number;
}

/**
 * Global blockchain module configuration
 */
export interface BlockchainModuleOptions {
  rpcUrl: string;
  wsUrl?: string;
  networkId: number;
  enableCircuitBreaker: boolean;
  circuitBreaker: CircuitBreakerConfig;
  gracefulDegradation: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,    // Open after 5 failures
  successThreshold: 2,    // Close after 2 successes
  resetTimeout: 30000,    // Try again after 30 seconds
};

/**
 * Blockchain Module
 * 
 * @Global() makes this module available in all feature modules
 * without needing to import it explicitly.
 */
@Global()
@Module({
  imports: [
    ConfigModule, // Ensure ConfigModule is available globally
  ],
  controllers: [BlockchainController],
  providers: [
    BlockchainService,
    {
      provide: 'BLOCKCHAIN_OPTIONS',
      useFactory: (configService: ConfigService): BlockchainModuleOptions => ({
        rpcUrl: configService.get<string>('BLOCKCHAIN_RPC_URL', 'http://localhost:8545'),
        wsUrl: configService.get<string>('BLOCKCHAIN_WS_URL'),
        networkId: configService.get<number>('BLOCKCHAIN_NETWORK_ID', 1337),
        enableCircuitBreaker: configService.get<boolean>('BLOCKCHAIN_CIRCUIT_BREAKER_ENABLED', true),
        circuitBreaker: {
          failureThreshold: configService.get<number>('BLOCKCHAIN_CB_FAILURE_THRESHOLD', 5),
          successThreshold: configService.get<number>('BLOCKCHAIN_CB_SUCCESS_THRESHOLD', 2),
          resetTimeout: configService.get<number>('BLOCKCHAIN_CB_RESET_TIMEOUT', 30000),
        },
        gracefulDegradation: configService.get<boolean>('BLOCKCHAIN_GRACEFUL_DEGRADATION', true),
      }),
      inject: [ConfigService],
    },
    {
      provide: 'CIRCUIT_BREAKER',
      useFactory: () => ({
        state: CircuitBreakerState.CLOSED,
        failureCount: 0,
        lastFailureTime: 0,
        config: DEFAULT_CIRCUIT_BREAKER_CONFIG,
        
        // Record a failure
        recordFailure: function(this: any) {
          this.failureCount++;
          this.lastFailureTime = Date.now();
          
          if (this.failureCount >= this.config.failureThreshold) {
            this.transitionToOpen();
          }
        },
        
        // Record a success
        recordSuccess: function(this: any) {
          this.failureCount = 0;
          if (this.state === CircuitBreakerState.HALF_OPEN) {
            this.transitionToClosed();
          }
        },
        
        // Transition to Open state
        transitionToOpen: function(this: any) {
          this.state = CircuitBreakerState.OPEN;
          console.warn('[CircuitBreaker] Circuit OPEN - Blockchain requests will be rejected');
        },
        
        // Transition to Closed state
        transitionToClosed: function(this: any) {
          this.state = CircuitBreakerState.CLOSED;
          this.failureCount = 0;
          console.log('[CircuitBreaker] Circuit CLOSED - Normal blockchain operation');
        },
        
        // Transition to Half-Open state
        transitionToHalfOpen: function(this: any) {
          this.state = CircuitBreakerState.HALF_OPEN;
          console.log('[CircuitBreaker] Circuit HALF_OPEN - Testing blockchain connection');
        },
        
        // Check if request should be allowed
        canExecute: function(this: any) {
          const now = Date.now();
          
          if (this.state === CircuitBreakerState.CLOSED) {
            return true;
          }
          
          if (this.state === CircuitBreakerState.OPEN) {
            // Check if reset timeout has passed
            if (now - this.lastFailureTime > this.config.resetTimeout) {
              this.transitionToHalfOpen();
              return true;
            }
            return false;
          }
          
          // Half-open: allow one request to test
          return true;
        },
        
        // Get current state
        getState: function() {
          return this.state;
        },
      }),
    },
  ],
  exports: [
    BlockchainService,
    'BLOCKCHAIN_OPTIONS',
    'CIRCUIT_BREAKER',
  ],
})
export class BlockchainModule {}