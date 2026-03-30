import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../../entities/candidate.entity';
import { CountySeed } from './county.seed';
import { ConstituencySeed } from './constituency.seed';
import { WardSeed } from './ward.seed';
import { ElectionSeed } from './election.seed';

interface CandidateData {
  candidateNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  position: string;
  countyCode?: string;
  constituencyCode?: string;
  wardCode?: string;
  partyName: string;
  partyAbbreviation: string;
  isIndependent: boolean;
  dateOfBirth: Date;
  electionId?: string;
}

@Injectable()
export class CandidateSeed {
  private readonly logger = new Logger(CandidateSeed.name);

  // Kenyan political parties
  private readonly parties = [
    { name: 'Jubilee Party', abbreviation: 'JP' },
    { name: 'Orange Democratic Movement', abbreviation: 'ODM' },
    { name: 'Kenya African National Union', abbreviation: 'KANU' },
    { name: 'Wiper Democratic Movement', abbreviation: 'WDM' },
    { name: ' Amani National Congress', abbreviation: 'ANC' },
    { name: 'Ford Kenya', abbreviation: 'FORD-K' },
    { name: 'Kenya Union Party', abbreviation: 'KUP' },
    { name: 'Chama Cha Mashinani', abbreviation: 'CCM' },
    { name: 'National Rainbow Coalition', abbreviation: 'NARC' },
    { name: 'Progressive Party', abbreviation: 'PP' },
  ];

  // Kenyan names for candidates
  private readonly firstNames = [
    'William', 'Raila', 'Musalia', 'Kenyatta', 'Ruto', 'Kalisy', 'Kenyatta',
    'George', 'Uhuru', 'Mwai', 'Jaramogi', 'Odinga', 'Mudavadi', 'Wetangula',
    'Musyoka', 'Kilonzo', 'Mwakazi', 'Njonjo', 'Kosgey', 'Lonyangapuo', 'Wafula',
    'Simeon', 'Kipchumba', 'Murat', 'Abdikadir', 'Hassan', 'Mohammed', 'Ali',
    'Hussein', 'Ahmed', 'Omar', 'Yusuf', 'Ibrahim', 'Saleh', 'Mohamud', 'Abdalla',
    'John', 'Peter', 'James', 'David', 'Michael', 'Samuel', 'Paul', 'Stephen',
    'Joseph', 'Charles', 'Daniel', 'Robert', 'Thomas', 'Andrew', 'Philip', 'Francis'
  ];

  private readonly lastNames = [
    'Kenyatta', 'Odinga', 'Mudavadi', 'Wetangula', 'Ruto', 'Kosgey', 'Wafula',
    'Lonyangapuo', 'Kipchumba', 'Kenyatta', 'Mwai', 'Njonjo', 'Jaramogi', 'Nyamweya',
    'Musyoka', 'Kilonzo', 'Nthenge', 'Wambua', 'Mutua', 'Muthama', 'Ngunjiri',
    'Abdikadir', 'Hassan', 'Mohammed', 'Ali', 'Hussein', 'Omar', 'Yusuf', 'Ibrahim',
    'Saleh', 'Mohamud', 'Abdalla', 'Osman', 'Salad', 'Ahmed', 'Haji', 'Mbarra',
    'Owino', 'Ochieng', 'Omondi', 'Otieno', 'Wafula', 'Wanyama', 'Wekesa', 'Masinde'
  ];

  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    private readonly countySeed: CountySeed,
    private readonly constituencySeed: ConstituencySeed,
    private readonly wardSeed: WardSeed,
    private readonly electionSeed: ElectionSeed,
  ) {}

  private generateDateOfBirth(minAge: number, maxAge: number): Date {
    const today = new Date();
    const year = today.getFullYear() - Math.floor(minAge + Math.random() * (maxAge - minAge));
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    return new Date(year, month, day);
  }

  private generateCandidateNumber(position: string, index: number): string {
    const prefix = {
      'President': 'P',
      'Governor': 'G',
      'Senator': 'S',
      'MP': 'MP',
      'MCA': 'MCA',
    }[position] || 'C';
    return `${prefix}${index.toString().padStart(3, '0')}`;
  }

  async seed(): Promise<void> {
    this.logger.log('Starting candidate seed...');

    // Get IDs mapping
    const countyIdMap = await this.countySeed.getCountyIds();
    const constituencyIdMap = await this.constituencySeed.getConstituencyIds();
    const wardIdMap = await this.wardSeed.getWardIds();
    const electionIdMap = await this.electionSeed.getElectionIds();

    // Get the general election ID
    const generalElectionId = electionIdMap.get('2024-08-15');

    // Generate Presidential Candidates (5 candidates)
    const presidentialCandidates = await this.generatePresidentialCandidates(countyIdMap, generalElectionId);
    
    // Generate Governor Candidates (10 counties with multiple candidates each)
    const governorCandidates = await this.generateGovernorCandidates(countyIdMap, electionIdMap);
    
    // Generate Senator Candidates (10 counties with multiple candidates each)
    const senatorCandidates = await this.generateSenatorCandidates(countyIdMap, electionIdMap);
    
    // Generate MP Candidates (20 constituencies)
    const mpCandidates = await this.generateMPCandidates(constituencyIdMap, electionIdMap);
    
    // Generate MCA Candidates (20 wards)
    const mcaCandidates = await this.generateMCACandidates(wardIdMap, constituencyIdMap, electionIdMap);

    this.logger.log(`Candidate seed complete.`);
  }

  private async generatePresidentialCandidates(
    countyIdMap: Map<string, string>,
    electionId?: string,
  ): Promise<void> {
    const candidates: CandidateData[] = [
      {
        candidateNumber: 'P001',
        firstName: 'William',
        lastName: 'Kenyatta',
        middleName: 'Samoei',
        position: 'President',
        partyName: 'Jubilee Party',
        partyAbbreviation: 'JP',
        isIndependent: false,
        dateOfBirth: new Date(1961, 10, 20),
        electionId,
      },
      {
        candidateNumber: 'P002',
        firstName: 'Raila',
        lastName: 'Odinga',
        middleName: 'Amolo',
        position: 'President',
        partyName: 'Orange Democratic Movement',
        partyAbbreviation: 'ODM',
        isIndependent: false,
        dateOfBirth: new Date(1943, 3, 7),
        electionId,
      },
      {
        candidateNumber: 'P003',
        firstName: 'Musalia',
        lastName: 'Mudavadi',
        position: 'President',
        partyName: 'Amani National Congress',
        partyAbbreviation: 'ANC',
        isIndependent: false,
        dateOfBirth: new Date(1961, 3, 21),
        electionId,
      },
      {
        candidateNumber: 'P004',
        firstName: 'George',
        lastName: 'Kenyatta',
        position: 'President',
        partyName: '',
        partyAbbreviation: '',
        isIndependent: true,
        dateOfBirth: new Date(1965, 5, 12),
        electionId,
      },
      {
        candidateNumber: 'P005',
        firstName: 'Willy',
        lastName: 'Tonnet',
        position: 'President',
        partyName: 'Independent',
        partyAbbreviation: 'IND',
        isIndependent: true,
        dateOfBirth: new Date(1970, 8, 30),
        electionId,
      },
    ];

    for (const candidateData of candidates) {
      await this.upsertCandidate(candidateData);
    }
  }

  private async generateGovernorCandidates(
    countyIdMap: Map<string, string>,
    electionIdMap: Map<string, string>,
  ): Promise<void> {
    const governorCounties = [
      { code: '001', name: 'Nairobi', electionDate: '2024-08-15' },
      { code: '002', name: 'Mombasa', electionDate: '2024-08-15' },
      { code: '004', name: 'Kilifi', electionDate: '2024-08-15' },
      { code: '013', name: 'Meru', electionDate: '2024-08-15' },
      { code: '016', name: 'Kitui', electionDate: '2024-08-15' },
      { code: '023', name: 'Kiambu', electionDate: '2024-08-15' },
      { code: '028', name: 'Uasin Gishu', electionDate: '2024-08-15' },
      { code: '033', name: 'Nakuru', electionDate: '2024-08-15' },
      { code: '038', name: 'Kakamega', electionDate: '2024-08-15' },
      { code: '043', name: 'Kisumu', electionDate: '2024-08-15' },
    ];

    let candidateIndex = 1;

    for (const county of governorCounties) {
      const electionId = electionIdMap.get(county.electionDate);
      const countyId = countyIdMap.get(county.code);

      // Generate 3-5 candidates per county
      const numCandidates = 3 + Math.floor(Math.random() * 3);

      for (let i = 0; i < numCandidates; i++) {
        const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
        const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
        const party = this.parties[Math.floor(Math.random() * this.parties.length)];
        const isIndependent = Math.random() > 0.7;

        const candidateData: CandidateData = {
          candidateNumber: this.generateCandidateNumber('Governor', candidateIndex++),
          firstName,
          lastName,
          position: 'Governor',
          countyCode: county.code,
          partyName: isIndependent ? 'Independent' : party.name,
          partyAbbreviation: isIndependent ? 'IND' : party.abbreviation,
          isIndependent,
          dateOfBirth: this.generateDateOfBirth(35, 65),
          electionId,
        };

        await this.upsertCandidate(candidateData, countyId);
      }
    }
  }

  private async generateSenatorCandidates(
    countyIdMap: Map<string, string>,
    electionIdMap: Map<string, string>,
  ): Promise<void> {
    const senatorCounties = [
      { code: '001', name: 'Nairobi', electionDate: '2024-08-15' },
      { code: '002', name: 'Mombasa', electionDate: '2024-08-15' },
      { code: '003', name: 'Kwale', electionDate: '2024-08-15' },
      { code: '004', name: 'Kilifi', electionDate: '2024-08-15' },
      { code: '013', name: 'Meru', electionDate: '2024-08-15' },
      { code: '016', name: 'Kitui', electionDate: '2024-08-15' },
      { code: '017', name: 'Machakos', electionDate: '2024-08-15' },
      { code: '020', name: 'Nyeri', electionDate: '2024-08-15' },
      { code: '023', name: 'Kiambu', electionDate: '2024-08-15' },
      { code: '033', name: 'Nakuru', electionDate: '2024-08-15' },
    ];

    let candidateIndex = 1;

    for (const county of senatorCounties) {
      const electionId = electionIdMap.get(county.electionDate);
      const countyId = countyIdMap.get(county.code);

      const numCandidates = 3 + Math.floor(Math.random() * 3);

      for (let i = 0; i < numCandidates; i++) {
        const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
        const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
        const party = this.parties[Math.floor(Math.random() * this.parties.length)];
        const isIndependent = Math.random() > 0.7;

        const candidateData: CandidateData = {
          candidateNumber: this.generateCandidateNumber('Senator', candidateIndex++),
          firstName,
          lastName,
          position: 'Senator',
          countyCode: county.code,
          partyName: isIndependent ? 'Independent' : party.name,
          partyAbbreviation: isIndependent ? 'IND' : party.abbreviation,
          isIndependent,
          dateOfBirth: this.generateDateOfBirth(30, 65),
          electionId,
        };

        await this.upsertCandidate(candidateData, countyId);
      }
    }
  }

  private async generateMPCandidates(
    constituencyIdMap: Map<string, string>,
    electionIdMap: Map<string, string>,
  ): Promise<void> {
    const mpConstituencies = [
      { code: '001', electionDate: '2024-08-15' },
      { code: '006', electionDate: '2024-08-15' },
      { code: '018', electionDate: '2024-08-15' },
      { code: '024', electionDate: '2024-08-15' },
      { code: '028', electionDate: '2024-08-15' },
      { code: '067', electionDate: '2024-08-15' },
      { code: '083', electionDate: '2024-08-15' },
      { code: '091', electionDate: '2024-08-15' },
      { code: '112', electionDate: '2024-08-15' },
      { code: '130', electionDate: '2024-08-15' },
      { code: '142', electionDate: '2024-08-15' },
      { code: '160', electionDate: '2024-08-15' },
      { code: '185', electionDate: '2024-08-15' },
      { code: '218', electionDate: '2024-08-15' },
      { code: '235', electionDate: '2024-08-15' },
      { code: '251', electionDate: '2024-08-15' },
      { code: '257', electionDate: '2024-08-15' },
      { code: '264', electionDate: '2024-08-15' },
      { code: '278', electionDate: '2024-08-15' },
      { code: '287', electionDate: '2024-08-15' },
    ];

    let candidateIndex = 1;

    for (const constituency of mpConstituencies) {
      const electionId = electionIdMap.get(constituency.electionDate);
      const constituencyId = constituencyIdMap.get(constituency.code);

      const numCandidates = 4 + Math.floor(Math.random() * 4);

      for (let i = 0; i < numCandidates; i++) {
        const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
        const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
        const party = this.parties[Math.floor(Math.random() * this.parties.length)];
        const isIndependent = Math.random() > 0.6;

        const candidateData: CandidateData = {
          candidateNumber: this.generateCandidateNumber('MP', candidateIndex++),
          firstName,
          lastName,
          position: 'MP',
          constituencyCode: constituency.code,
          partyName: isIndependent ? 'Independent' : party.name,
          partyAbbreviation: isIndependent ? 'IND' : party.abbreviation,
          isIndependent,
          dateOfBirth: this.generateDateOfBirth(25, 65),
          electionId,
        };

        await this.upsertCandidate(candidateData, undefined, constituencyId);
      }
    }
  }

  private async generateMCACandidates(
    wardIdMap: Map<string, string>,
    constituencyIdMap: Map<string, string>,
    electionIdMap: Map<string, string>,
  ): Promise<void> {
    const mcaWards = [
      { wardCode: '001001', constituencyCode: '001' },
      { wardCode: '001006', constituencyCode: '002' },
      { wardCode: '001021', constituencyCode: '006' },
      { wardCode: '002002', constituencyCode: '018' },
      { wardCode: '003001', constituencyCode: '024' },
      { wardCode: '004001', constituencyCode: '028' },
      { wardCode: '013001', constituencyCode: '067' },
      { wardCode: '016004', constituencyCode: '084' },
      { wardCode: '017003', constituencyCode: '092' },
      { wardCode: '020003', constituencyCode: '114' },
      { wardCode: '023001', constituencyCode: '130' },
      { wardCode: '027001', constituencyCode: '155' },
      { wardCode: '028001', constituencyCode: '160' },
      { wardCode: '033001', constituencyCode: '185' },
      { wardCode: '038001', constituencyCode: '218' },
      { wardCode: '040001', constituencyCode: '235' },
      { wardCode: '042001', constituencyCode: '251' },
      { wardCode: '043001', constituencyCode: '257' },
      { wardCode: '044001', constituencyCode: '264' },
      { wardCode: '046004', constituencyCode: '281' },
    ];

    let candidateIndex = 1;
    const electionId = electionIdMap.get('2024-08-15');

    for (const ward of mcaWards) {
      const wardId = wardIdMap.get(ward.wardCode);
      const constituencyId = constituencyIdMap.get(ward.constituencyCode);

      const numCandidates = 3 + Math.floor(Math.random() * 4);

      for (let i = 0; i < numCandidates; i++) {
        const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
        const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
        const party = this.parties[Math.floor(Math.random() * this.parties.length)];
        const isIndependent = Math.random() > 0.6;

        const candidateData: CandidateData = {
          candidateNumber: this.generateCandidateNumber('MCA', candidateIndex++),
          firstName,
          lastName,
          position: 'MCA',
          constituencyCode: ward.constituencyCode,
          wardCode: ward.wardCode,
          partyName: isIndependent ? 'Independent' : party.name,
          partyAbbreviation: isIndependent ? 'IND' : party.abbreviation,
          isIndependent,
          dateOfBirth: this.generateDateOfBirth(21, 60),
          electionId,
        };

        await this.upsertCandidate(candidateData, undefined, constituencyId, wardId);
      }
    }
  }

  private async upsertCandidate(
    candidateData: CandidateData,
    countyId?: string,
    constituencyId?: string,
    wardId?: string,
  ): Promise<void> {
    try {
      const existing = await this.candidateRepository.findOne({
        where: { candidateNumber: candidateData.candidateNumber },
      });

      if (existing) {
        await this.candidateRepository.update(existing.id, {
          firstName: candidateData.firstName,
          lastName: candidateData.lastName,
          middleName: candidateData.middleName,
          position: candidateData.position,
          countyId,
          constituencyId,
          wardId,
          partyName: candidateData.partyName,
          partyAbbreviation: candidateData.partyAbbreviation,
          isIndependent: candidateData.isIndependent,
          dateOfBirth: candidateData.dateOfBirth,
          electionId: candidateData.electionId,
          status: 'approved',
          approvedAt: new Date(),
        });
      } else {
        const candidate = this.candidateRepository.create({
          candidateNumber: candidateData.candidateNumber,
          firstName: candidateData.firstName,
          lastName: candidateData.lastName,
          middleName: candidateData.middleName,
          position: candidateData.position,
          countyId,
          constituencyId,
          wardId,
          partyName: candidateData.partyName,
          partyAbbreviation: candidateData.partyAbbreviation,
          isIndependent: candidateData.isIndependent,
          dateOfBirth: candidateData.dateOfBirth,
          electionId: candidateData.electionId,
          status: 'approved',
          submittedAt: new Date(),
          approvedAt: new Date(),
        });
        await this.candidateRepository.save(candidate);
      }
    } catch (error) {
      this.logger.error(`Error upserting candidate ${candidateData.candidateNumber}:`, error.message);
    }
  }
}
