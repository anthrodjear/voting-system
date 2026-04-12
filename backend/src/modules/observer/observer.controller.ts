import { Controller, Get, Param, Query, HttpStatus, HttpCode, Logger } from '@nestjs/common';
import { ObserverService } from './observer.service';

/**
 * Observer Controller
 * 
 * Provides public read-only endpoints for election monitoring and reporting.
 * These endpoints are designed for observers, journalists, and public transparency.
 */
@Controller('api/observer')
export class ObserverController {
  private readonly logger = new Logger(ObserverController.name);

  constructor(private readonly observerService: ObserverService) {}

  /**
   * GET /api/observer/election-stats
   * 
   * Returns current election statistics including:
   * - Total registered voters
   * - Total votes cast
   * - Turnout percentage
   * - Current election status
   */
  @Get('election-stats')
  @HttpCode(HttpStatus.OK)
  async getElectionStats() {
    this.logger.log('GET /api/observer/election-stats');
    return this.observerService.getElectionStats();
  }

  /**
   * GET /api/observer/candidates
   * 
   * Returns candidate results with vote counts and percentages.
   * Results are sorted by vote count in descending order.
   */
  @Get('candidates')
  @HttpCode(HttpStatus.OK)
  async getCandidateResults() {
    this.logger.log('GET /api/observer/candidates');
    return this.observerService.getCandidateResults();
  }

  /**
   * GET /api/observer/voter-turnout
   * 
   * Returns voter turnout statistics including:
   * - Number of registered voters
   * - Number of voters who have voted
   * - Turnout percentage
   */
  @Get('voter-turnout')
  @HttpCode(HttpStatus.OK)
  async getVoterTurnout() {
    this.logger.log('GET /api/observer/voter-turnout');
    return this.observerService.getVoterTurnout();
  }

  /**
   * GET /api/observer/vote/:hash
   * 
   * Verifies a vote by transaction hash.
   * Returns verification status including block number, timestamp, and verification result.
   * 
   * @param hash - Transaction hash to verify
   */
  @Get('vote/:hash')
  @HttpCode(HttpStatus.OK)
  async verifyVote(@Param('hash') hash: string) {
    this.logger.log(`GET /api/observer/vote/${hash}`);
    return this.observerService.verifyVote(hash);
  }

  /**
   * GET /api/observer/reports
   * 
   * Generates various reports for export.
   * 
   * @param type - Report type: 'election-results', 'voter-turnout', 'votes', 'voters'
   * @param format - Output format: 'json', 'csv' (future support)
   */
  @Get('reports')
  @HttpCode(HttpStatus.OK)
  async generateReport(
    @Query('type') type: string = 'election-results',
    @Query('format') format: string = 'json',
  ) {
    this.logger.log(`GET /api/observer/reports?type=${type}&format=${format}`);
    return this.observerService.generateReport(type, format);
  }
}