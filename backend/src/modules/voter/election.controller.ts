import { Controller, Get, Query, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';

import { Election } from '../../entities/election.entity';
import { Voter } from '../../entities/voter.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('elections')
@Controller('elections')
export class ElectionController {
  constructor(
    @InjectRepository(Election)
    private electionRepository: Repository<Election>,
    @InjectRepository(Voter)
    private voterRepository: Repository<Voter>,
  ) {}

  @Get('my-elections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get upcoming elections available to the current voter' })
  @ApiResponse({ status: 200, description: 'List of upcoming elections for the voter' })
  async getMyElections(
    @CurrentUser('id') voterId: string,
  ): Promise<{ success: boolean; data: Election[] }> {
    // Get the voter's county
    const voter = await this.voterRepository.findOne({
      where: { id: voterId },
      select: ['countyId'],
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    const now = new Date();
    
    // Get elections that are upcoming and either:
    // 1. Have no counties specified (national elections), or
    // 2. Include the voter's county
    const elections = await this.electionRepository
      .createQueryBuilder('election')
      .where('election.election_date >= :now', { now })
      .andWhere('election.status = :status', { status: 'active' })
      .andWhere('(election.counties IS NULL OR array_length(election.counties, 1) = 0 OR :countyId = ANY(election.counties))', { countyId: voter.countyId })
      .orderBy('election.election_date', 'ASC')
      .take(10)
      .getMany();

    return {
      success: true,
      data: elections,
    };
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming elections' })
  @ApiResponse({ status: 200, description: 'List of upcoming elections' })
  async getUpcomingElections(): Promise<{ success: boolean; data: Election[] }> {
    const now = new Date();
    
    const elections = await this.electionRepository.find({
      where: {
        electionDate: MoreThanOrEqual(now),
        status: 'active',
      },
      order: { electionDate: 'ASC' },
      take: 10,
    });

    return {
      success: true,
      data: elections,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get election by ID' })
  @ApiResponse({ status: 200, description: 'Election details' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async getElection(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: Election }> {
    const election = await this.electionRepository.findOne({
      where: { id },
    });

    if (!election) {
      throw new NotFoundException(`Election with ID ${id} not found`);
    }

    return {
      success: true,
      data: election,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all elections' })
  @ApiResponse({ status: 200, description: 'List of all elections' })
  async getAllElections(): Promise<{ success: boolean; data: Election[] }> {
    const elections = await this.electionRepository.find({
      order: { electionDate: 'DESC' },
    });

    return {
      success: true,
      data: elections,
    };
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current active election (status=active and date is today)' })
  @ApiResponse({ status: 200, description: 'Current active election' })
  async getCurrentElection(): Promise<{ success: boolean; data: Election | null }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const election = await this.electionRepository.findOne({
      where: {
        status: 'active',
        electionDate: MoreThanOrEqual(todayStart),
      },
      order: { electionDate: 'ASC' },
    });

    // Also check for elections with status 'voting'
    if (!election) {
      const votingElection = await this.electionRepository.findOne({
        where: { status: 'voting' },
        order: { electionDate: 'ASC' },
      });

      return {
        success: true,
        data: votingElection || null,
      };
    }

    return {
      success: true,
      data: election,
    };
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get election results' })
  @ApiResponse({ status: 200, description: 'Election results' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async getElectionResults(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: any }> {
    const election = await this.electionRepository.findOne({
      where: { id },
    });

    if (!election) {
      throw new NotFoundException(`Election with ID ${id} not found`);
    }

    // TODO: In production, join with Vote and Candidate tables for real results
    // For now, return election-level stats
    return {
      success: true,
      data: {
        electionId: election.id,
        electionName: election.electionName,
        totalVotesCast: election.totalVotesCast,
        turnoutPercentage: election.turnoutPercentage,
        status: election.status,
        lastUpdated: new Date(),
      },
    };
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get election timeline' })
  @ApiResponse({ status: 200, description: 'Election timeline' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async getElectionTimeline(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: any }> {
    const election = await this.electionRepository.findOne({
      where: { id },
    });

    if (!election) {
      throw new NotFoundException(`Election with ID ${id} not found`);
    }

    return {
      success: true,
      data: {
        electionId: election.id,
        electionName: election.electionName,
        registration: {
          start: election.registrationStartDate,
          end: election.registrationEndDate,
        },
        voting: {
          start: election.votingStartDate,
          end: election.votingEndDate,
        },
        results: election.votingEndDate,
      },
    };
  }
}
