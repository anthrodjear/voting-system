/**
 * Blockchain Module
 * 
 * NestJS module for blockchain service integration.
 * Provides blockchain-based vote recording and verification.
 */

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BlockchainService } from '../../services/blockchain.service';

@Global()
@Module({
  imports: [
    ConfigModule, // Ensure ConfigModule is available
  ],
  providers: [
    BlockchainService,
  ],
  exports: [
    BlockchainService,
  ],
})
export class BlockchainModule {}
