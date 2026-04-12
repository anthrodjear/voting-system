import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Election } from '../../entities/election.entity';

interface ElectionData {
  electionName: string;
  electionType: string;
  electionDate: Date;
  registrationStartDate: Date;
  registrationEndDate: Date;
  nominationStartDate: Date;
  nominationEndDate: Date;
  votingStartDate: Date;
  votingEndDate: Date;
  status: string;
  enableOnlineVoting: boolean;
  totalVotesCast?: number;
  turnoutPercentage?: number;
  counties?: string[];
}

@Injectable()
export class ElectionSeed {
  private readonly logger = new Logger(ElectionSeed.name);

  private readonly elections: ElectionData[] = [
    // Past elections
    {
      electionName: 'Kenya General Elections 2017',
      electionType: 'general',
      electionDate: new Date('2017-08-08'),
      registrationStartDate: new Date('2017-04-01'),
      registrationEndDate: new Date('2017-06-30'),
      nominationStartDate: new Date('2017-05-01'),
      nominationEndDate: new Date('2017-05-15'),
      votingStartDate: new Date('2017-08-08T06:00:00'),
      votingEndDate: new Date('2017-08-08T18:00:00'),
      status: 'completed',
      enableOnlineVoting: false,
      totalVotesCast: 15012430,
      turnoutPercentage: 78.92,
    },
    {
      electionName: 'Kenya General Elections 2013',
      electionType: 'general',
      electionDate: new Date('2013-03-04'),
      registrationStartDate: new Date('2012-11-01'),
      registrationEndDate: new Date('2013-01-31'),
      nominationStartDate: new Date('2012-12-01'),
      nominationEndDate: new Date('2012-12-15'),
      votingStartDate: new Date('2013-03-04T06:00:00'),
      votingEndDate: new Date('2013-03-04T17:00:00'),
      status: 'completed',
      enableOnlineVoting: false,
      totalVotesCast: 12366737,
      turnoutPercentage: 72.16,
    },
    {
      electionName: 'Kenya By-Election 2021 - Kajiado West',
      electionType: 'by-election',
      electionDate: new Date('2021-03-04'),
      registrationStartDate: new Date('2021-01-15'),
      registrationEndDate: new Date('2021-02-15'),
      nominationStartDate: new Date('2021-02-01'),
      nominationEndDate: new Date('2021-02-08'),
      votingStartDate: new Date('2021-03-04T06:00:00'),
      votingEndDate: new Date('2021-03-04T17:00:00'),
      status: 'completed',
      enableOnlineVoting: false,
      totalVotesCast: 24567,
      turnoutPercentage: 52.34,
    },
    {
      electionName: 'Kenya By-Election 2022 - Kitui Rural',
      electionType: 'by-election',
      electionDate: new Date('2022-09-08'),
      registrationStartDate: new Date('2022-07-15'),
      registrationEndDate: new Date('2022-08-15'),
      nominationStartDate: new Date('2022-08-01'),
      nominationEndDate: new Date('2022-08-10'),
      votingStartDate: new Date('2022-09-08T06:00:00'),
      votingEndDate: new Date('2022-09-08T17:00:00'),
      status: 'completed',
      enableOnlineVoting: false,
      totalVotesCast: 34521,
      turnoutPercentage: 58.92,
    },
    // Active election
    {
      electionName: 'Kenya General Elections 2024',
      electionType: 'general',
      electionDate: new Date('2024-08-15'),
      registrationStartDate: new Date('2024-04-01'),
      registrationEndDate: new Date('2024-06-30'),
      nominationStartDate: new Date('2024-06-01'),
      nominationEndDate: new Date('2024-06-15'),
      votingStartDate: new Date('2024-08-15T06:00:00'),
      votingEndDate: new Date('2024-08-15T18:00:00'),
      status: 'active',
      enableOnlineVoting: true,
    },
    // Upcoming elections
    {
      electionName: 'Kenya General Elections 2027',
      electionType: 'general',
      electionDate: new Date('2027-08-17'),
      registrationStartDate: new Date('2027-04-01'),
      registrationEndDate: new Date('2027-06-30'),
      nominationStartDate: new Date('2027-06-01'),
      nominationEndDate: new Date('2027-06-15'),
      votingStartDate: new Date('2027-08-17T06:00:00'),
      votingEndDate: new Date('2027-08-17T18:00:00'),
      status: 'active',
      enableOnlineVoting: true,
    },
    {
      electionName: 'County By-Election 2025 - Nairobi',
      electionType: 'by-election',
      electionDate: new Date('2025-03-15'),
      registrationStartDate: new Date('2025-01-15'),
      registrationEndDate: new Date('2025-02-15'),
      nominationStartDate: new Date('2025-02-01'),
      nominationEndDate: new Date('2025-02-10'),
      votingStartDate: new Date('2025-03-15T06:00:00'),
      votingEndDate: new Date('2025-03-15T17:00:00'),
      status: 'active',
      enableOnlineVoting: true,
      counties: ['Nairobi'],
    },
    {
      electionName: 'Kenya By-Election 2024 - Mombasa',
      electionType: 'by-election',
      electionDate: new Date('2024-10-15'),
      registrationStartDate: new Date('2024-08-01'),
      registrationEndDate: new Date('2024-09-15'),
      nominationStartDate: new Date('2024-09-01'),
      nominationEndDate: new Date('2024-09-10'),
      votingStartDate: new Date('2024-10-15T06:00:00'),
      votingEndDate: new Date('2024-10-15T17:00:00'),
      status: 'draft',
      enableOnlineVoting: true,
      counties: ['Mombasa'],
    },
    // Additional test elections
    {
      electionName: 'Kenya General Elections 2022',
      electionType: 'general',
      electionDate: new Date('2022-08-09'),
      registrationStartDate: new Date('2022-04-01'),
      registrationEndDate: new Date('2022-06-30'),
      nominationStartDate: new Date('2022-06-01'),
      nominationEndDate: new Date('2022-06-15'),
      votingStartDate: new Date('2022-08-09T06:00:00'),
      votingEndDate: new Date('2022-08-09T18:00:00'),
      status: 'completed',
      enableOnlineVoting: false,
      totalVotesCast: 14567923,
      turnoutPercentage: 75.23,
    },
    {
      electionName: 'Kenya By-Election 2023 - Nakuru',
      electionType: 'by-election',
      electionDate: new Date('2023-10-26'),
      registrationStartDate: new Date('2023-08-15'),
      registrationEndDate: new Date('2023-09-30'),
      nominationStartDate: new Date('2023-09-15'),
      nominationEndDate: new Date('2023-09-20'),
      votingStartDate: new Date('2023-10-26T06:00:00'),
      votingEndDate: new Date('2023-10-26T17:00:00'),
      status: 'completed',
      enableOnlineVoting: true,
      totalVotesCast: 28765,
      turnoutPercentage: 48.92,
      counties: ['Nakuru'],
    },
  ];

  constructor(
    @InjectRepository(Election)
    private readonly electionRepository: Repository<Election>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting election seed...');

    for (const electionData of this.elections) {
      try {
        // Find existing election by election name and date
        const existing = await this.electionRepository.findOne({
          where: { 
            electionName: electionData.electionName,
            electionDate: electionData.electionDate,
          },
        });

        if (existing) {
          await this.electionRepository.update(existing.id, {
            electionType: electionData.electionType,
            registrationStartDate: electionData.registrationStartDate,
            registrationEndDate: electionData.registrationEndDate,
            nominationStartDate: electionData.nominationStartDate,
            nominationEndDate: electionData.nominationEndDate,
            votingStartDate: electionData.votingStartDate,
            votingEndDate: electionData.votingEndDate,
            status: electionData.status,
            enableOnlineVoting: electionData.enableOnlineVoting,
            totalVotesCast: electionData.totalVotesCast || 0,
            turnoutPercentage: electionData.turnoutPercentage || undefined,
            counties: electionData.counties || [],
          });
          this.logger.debug(`Updated election: ${electionData.electionName}`);
        } else {
          const election = this.electionRepository.create({
            electionName: electionData.electionName,
            electionType: electionData.electionType,
            electionDate: electionData.electionDate,
            registrationStartDate: electionData.registrationStartDate,
            registrationEndDate: electionData.registrationEndDate,
            nominationStartDate: electionData.nominationStartDate,
            nominationEndDate: electionData.nominationEndDate,
            votingStartDate: electionData.votingStartDate,
            votingEndDate: electionData.votingEndDate,
            status: electionData.status,
            enableOnlineVoting: electionData.enableOnlineVoting,
            totalVotesCast: electionData.totalVotesCast || 0,
            turnoutPercentage: electionData.turnoutPercentage || undefined,
            counties: electionData.counties || [],
          });
          await this.electionRepository.save(election);
          this.logger.debug(`Inserted election: ${electionData.electionName}`);
        }
      } catch (error) {
        this.logger.error(`Error seeding election ${electionData.electionName}:`, error.message);
      }
    }

    const count = await this.electionRepository.count();
    this.logger.log(`Election seed complete. Total elections: ${count}`);
  }

  async getElectionIds(): Promise<Map<string, string>> {
    const elections = await this.electionRepository.find();
    const electionMap = new Map<string, string>();
    elections.forEach((election) => {
      // Map by date string (YYYY-MM-DD format)
      // Handle case where electionDate might be a string from database
      const date = election.electionDate instanceof Date 
        ? election.electionDate 
        : new Date(election.electionDate);
      const dateStr = date.toISOString().split('T')[0];
      electionMap.set(dateStr, election.id);
      // Also map by election name for convenience
      electionMap.set(election.electionName, election.id);
    });
    return electionMap;
  }
}
