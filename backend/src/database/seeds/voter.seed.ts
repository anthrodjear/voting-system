import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voter } from '../../entities/voter.entity';
import { CountySeed } from './county.seed';
import { ConstituencySeed } from './constituency.seed';
import { WardSeed } from './ward.seed';

interface VoterData {
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email: string;
  phoneNumber: string;
  countyCode: string;
  constituencyCode: string;
  wardCode: string;
}

@Injectable()
export class VoterSeed {
  private readonly logger = new Logger(VoterSeed.name);

  // Kenyan first names
  private readonly firstNames = [
    'John', 'Mary', 'Joseph', 'Grace', 'David', 'Faith', 'Michael', 'Jane',
    'Daniel', 'Anne', 'James', 'Lucy', 'Robert', 'Margaret', 'William', 'Elizabeth',
    'George', 'Susan', 'Thomas', 'Catherine', 'Charles', 'Patricia', 'Peter', 'Jennifer',
    'Paul', 'Linda', 'Stephen', 'Sarah', 'Andrew', 'Karen', 'Philip', 'Nancy',
    'Simon', 'Betty', 'Eric', 'Dorothy', 'Martin', 'Sandra', 'Francis', 'Ashley',
    'Vincent', 'Kimberly', 'Patrick', 'Emily', 'Kennedy', 'Diana', 'Benson', 'Rachel',
    'Victor', 'Cynthia', 'Samson', 'Doris', 'Edwin', 'Joyce', 'Felix', 'Mildred',
    'Harrison', 'Irene', 'Sam', 'Carol', 'Collins', 'Grace', 'Dennis', 'Esther',
    'George', 'Agnes', 'Brian', 'Celestine', 'Caleb', 'Beatrice', 'Kevin', 'Caroline',
    'Emmanuel', 'Eunice', 'Fredrick', 'Florence', 'Gilbert', 'Gladys', 'Henry', 'Gloria',
    'Isaac', 'Hannah', 'Jacob', 'Ivy', 'Keith', 'Janet', 'Lawrence', 'Josephine',
    'Leonard', 'Joy', 'Maurice', 'Lucy', 'Nelson', 'Lilian', 'Oliver', 'Monica',
    'Quentin', 'Mercy', 'Richard', 'Nancy', 'Stanley', 'Naomi', 'Timothy', 'Pamela',
    'Ulysses', 'Priscilla', 'Valentine', 'Rebecca', 'Walter', 'Rose', 'Xavier', 'Ruth',
    'Yusuf', 'Sylvia', 'Zachary', 'Teresa'
  ];

  // Kenyan last names
  private readonly lastNames = [
    'Otieno', 'Omondi', 'Owino', 'Ochieng', 'Oduya', 'Oluoch', 'Onyango', 'Okoth',
    'Okwu', 'Oluoch', 'Akinyi', 'Adhiambo', 'Aluoch', 'Akoth', 'Anyango', 'Atieno',
    'Wafula', 'Wanyama', 'Wekesa', 'Wasike', 'Wangila', 'Watson', 'Waithaka', 'Wainaina',
    'Kamau', 'Kariuki', 'Kamanda', 'Karanja', 'Kimani', 'Kibaki', 'Kiplagat', 'Kiptoo',
    'Mutua', 'Musyoka', 'Musili', 'Muthama', 'Mureithi', 'Munyao', 'Mbugua', 'Mburu',
    'Njoroge', 'Ndung\'u', 'Ngugi', 'Njuguna', 'Ndegwa', 'Nyangau', 'Njenga', 'Nyamai',
    'Maina', 'Macharia', 'Mwaura', 'Murimi', 'Mathai', 'Mugo', 'Mwangi', 'Makori',
    'Ochieng\'', 'Owuor', 'Odhiambo', 'Ogot', 'Opondo', 'Odongo', 'Ojwang\'', 'Okello',
    'Wanjala', 'Wamalwa', 'Wasilwa', 'Wandera', 'Wekulo', 'Wetang\'ula', 'Wamalwa', 'Watete',
    'Kiplagat', 'Kosgei', 'Rotich', 'Rono', 'Sang', 'Sing\'ei', 'Soi', 'Tanui',
    'Kibet', 'Kiplagat', 'Korir', 'Langat', 'Cheruiyot', 'Chepkwony', 'Chebet', 'Chirchir'
  ];

  // Kenyan regions for distribution
  private readonly regions = [
    { countyCode: '001', constituencyCode: '001', wardCode: '001001', countyName: 'Nairobi', constituencyName: 'Starehe', wardName: 'Pumwani' },
    { countyCode: '001', constituencyCode: '002', wardCode: '001006', countyName: 'Nairobi', constituencyName: 'Kasarani', wardName: 'Kasarani' },
    { countyCode: '001', constituencyCode: '006', wardCode: '001021', countyName: 'Nairobi', constituencyName: 'Westlands', wardName: 'Westlands' },
    { countyCode: '001', constituencyCode: '014', wardCode: '001051', countyName: 'Nairobi', constituencyName: 'Langata', wardName: 'Langata' },
    { countyCode: '001', constituencyCode: '017', wardCode: '001061', countyName: 'Nairobi', constituencyName: 'Embakasi', wardName: 'Embakasi' },
    { countyCode: '002', constituencyCode: '018', wardCode: '002002', countyName: 'Mombasa', constituencyName: 'Kisauni', wardName: 'Kisauni' },
    { countyCode: '002', constituencyCode: '019', wardCode: '002006', countyName: 'Mombasa', constituencyName: 'Nyali', wardName: 'Nyali' },
    { countyCode: '003', constituencyCode: '024', wardCode: '003001', countyName: 'Kwale', constituencyName: 'Msambweni', wardName: 'Msambweni' },
    { countyCode: '004', constituencyCode: '028', wardCode: '004001', countyName: 'Kilifi', constituencyName: 'Kilifi North', wardName: 'Kilifi North' },
    { countyCode: '004', constituencyCode: '030', wardCode: '004010', countyName: 'Kilifi', constituencyName: 'Malindi', wardName: 'Malindi' },
    { countyCode: '013', constituencyCode: '067', wardCode: '013001', countyName: 'Meru', constituencyName: 'Igembe North', wardName: 'Igembe North' },
    { countyCode: '013', constituencyCode: '074', wardCode: '013024', countyName: 'Meru', constituencyName: 'Central Imenti', wardName: 'Central Imenti' },
    { countyCode: '016', constituencyCode: '084', wardCode: '016004', countyName: 'Kitui', constituencyName: 'Kitui Central', wardName: 'Kitui Central' },
    { countyCode: '017', constituencyCode: '092', wardCode: '017003', countyName: 'Machakos', constituencyName: 'Machakos Town', wardName: 'Mumbuni North' },
    { countyCode: '017', constituencyCode: '099', wardCode: '017019', countyName: 'Machakos', constituencyName: 'Kangundo', wardName: 'Kangundo' },
    { countyCode: '020', constituencyCode: '114', wardCode: '020003', countyName: 'Nyeri', constituencyName: 'Mkurweni', wardName: 'Mkurweni' },
    { countyCode: '020', constituencyCode: '117', wardCode: '020006', countyName: 'Nyeri', constituencyName: 'Nyeri Town', wardName: 'Nyeri Town' },
    { countyCode: '023', constituencyCode: '130', wardCode: '023001', countyName: 'Kiambu', constituencyName: 'Githunguri', wardName: 'Githunguri' },
    { countyCode: '023', constituencyCode: '132', wardCode: '023003', countyName: 'Kiambu', constituencyName: 'Juja', wardName: 'Juja' },
    { countyCode: '023', constituencyCode: '133', wardCode: '023004', countyName: 'Kiambu', constituencyName: 'Thika Town', wardName: 'Thika Town' },
    { countyCode: '027', constituencyCode: '155', wardCode: '027001', countyName: 'Trans-Nzoia', constituencyName: 'Kwanza', wardName: 'Kwanza' },
    { countyCode: '027', constituencyCode: '157', wardCode: '027003', countyName: 'Trans-Nzoia', constituencyName: 'Kiminini', wardName: 'Kiminini' },
    { countyCode: '028', constituencyCode: '160', wardCode: '028001', countyName: 'Uasin Gishu', constituencyName: 'Soy', wardName: 'Soy' },
    { countyCode: '028', constituencyCode: '161', wardCode: '028002', countyName: 'Uasin Gishu', constituencyName: 'Turbo', wardName: 'Turbo' },
    { countyCode: '033', constituencyCode: '185', wardCode: '033001', countyName: 'Nakuru', constituencyName: 'Molo', wardName: 'Molo' },
    { countyCode: '033', constituencyCode: '187', wardCode: '033003', countyName: 'Nakuru', constituencyName: 'Naivasha', wardName: 'Naivasha' },
    { countyCode: '033', constituencyCode: '190', wardCode: '033006', countyName: 'Nakuru', constituencyName: 'Rongai', wardName: 'Rongai' },
    { countyCode: '038', constituencyCode: '218', wardCode: '038001', countyName: 'Kakamega', constituencyName: 'Likuyani', wardName: 'Likuyani' },
    { countyCode: '038', constituencyCode: '226', wardCode: '038009', countyName: 'Kakamega', constituencyName: 'Kakamega Central', wardName: 'Kakamega Central' },
    { countyCode: '040', constituencyCode: '235', wardCode: '040001', countyName: 'Bungoma', constituencyName: 'Bungoma West', wardName: 'Bungoma West' },
    { countyCode: '040', constituencyCode: '239', wardCode: '040005', countyName: 'Bungoma', constituencyName: 'Kanduyi', wardName: 'Kanduyi' },
    { countyCode: '042', constituencyCode: '251', wardCode: '042001', countyName: 'Siaya', constituencyName: 'Ugenya', wardName: 'Ugenya' },
    { countyCode: '042', constituencyCode: '253', wardCode: '042003', countyName: 'Siaya', constituencyName: 'Siaya', wardName: 'Siaya' },
    { countyCode: '043', constituencyCode: '257', wardCode: '043001', countyName: 'Kisumu', constituencyName: 'Kisumu West', wardName: 'Kisumu West' },
    { countyCode: '043', constituencyCode: '258', wardCode: '043002', countyName: 'Kisumu', constituencyName: 'Kisumu Central', wardName: 'Kisumu Central' },
    { countyCode: '044', constituencyCode: '264', wardCode: '044001', countyName: 'Homa Bay', constituencyName: 'Kasipul', wardName: 'Kasipul' },
    { countyCode: '044', constituencyCode: '270', wardCode: '044007', countyName: 'Homa Bay', constituencyName: 'Homa Bay Town', wardName: 'Homa Bay Town' },
    { countyCode: '046', constituencyCode: '281', wardCode: '046004', countyName: 'Kisii', constituencyName: 'Kisii Town', wardName: 'Kisii Town' },
    { countyCode: '047', constituencyCode: '289', wardCode: '047003', countyName: 'Nyamira', constituencyName: 'Nyamira Town', wardName: 'Nyamira Town' },
  ];

  private usedNationalIds: Set<string> = new Set();

  constructor(
    @InjectRepository(Voter)
    private readonly voterRepository: Repository<Voter>,
    private readonly countySeed: CountySeed,
    private readonly constituencySeed: ConstituencySeed,
    private readonly wardSeed: WardSeed,
  ) {}

  /**
   * Generate a unique 8-digit National ID
   */
  private generateNationalId(): string {
    let nationalId: string;
    let attempts = 0;
    do {
      // Generate a number between 10000000 and 99999999
      nationalId = Math.floor(10000000 + Math.random() * 90000000).toString();
      attempts++;
      if (attempts > 100) {
        // Fallback with timestamp suffix
        nationalId = (10000000 + Math.floor(Math.random() * 80000000) + attempts).toString();
      }
    } while (this.usedNationalIds.has(nationalId));
    this.usedNationalIds.add(nationalId);
    return nationalId;
  }

  /**
   * Generate a random date of birth (between 18 and 80 years old)
   */
  private generateDateOfBirth(): Date {
    const today = new Date();
    const minAge = 18;
    const maxAge = 80;
    const minYear = today.getFullYear() - maxAge;
    const maxYear = today.getFullYear() - minAge;
    const year = Math.floor(minYear + Math.random() * (maxYear - minYear));
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    return new Date(year, month, day);
  }

  /**
   * Generate a Kenyan phone number
   */
  private generatePhoneNumber(): string {
    const prefixes = ['070', '071', '072', '073', '074', '075', '076', '077', '078', '079'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(100000 + Math.random() * 900000).toString();
    return prefix + suffix;
  }

  /**
   * Generate 100+ test voters
   */
  private generateVoterData(): VoterData[] {
    const voters: VoterData[] = [];
    const numVoters = 120;

    for (let i = 0; i < numVoters; i++) {
      const region = this.regions[Math.floor(Math.random() * this.regions.length)];
      const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
      const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
      
      voters.push({
        nationalId: this.generateNationalId(),
        firstName,
        lastName,
        dateOfBirth: this.generateDateOfBirth(),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        phoneNumber: this.generatePhoneNumber(),
        countyCode: region.countyCode,
        constituencyCode: region.constituencyCode,
        wardCode: region.wardCode,
      });
    }

    return voters;
  }

  async seed(): Promise<void> {
    this.logger.log('Starting voter seed...');

    // Get IDs mapping
    const countyIdMap = await this.countySeed.getCountyIds();
    const constituencyIdMap = await this.constituencySeed.getConstituencyIds();
    const wardIdMap = await this.wardSeed.getWardIds();

    const votersData = this.generateVoterData();

    for (const voterData of votersData) {
      try {
        const countyId = countyIdMap.get(voterData.countyCode);
        const constituencyId = constituencyIdMap.get(voterData.constituencyCode);
        const wardId = wardIdMap.get(voterData.wardCode);

        if (!countyId || !constituencyId || !wardId) {
          this.logger.warn(`Location not found for voter ${voterData.nationalId}`);
          continue;
        }

        const existing = await this.voterRepository.findOne({
          where: { nationalId: voterData.nationalId },
        });

        // Default password hash (bcrypt of 'voter123')
        const defaultPasswordHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

        if (existing) {
          await this.voterRepository.update(existing.id, {
            firstName: voterData.firstName,
            lastName: voterData.lastName,
            dateOfBirth: voterData.dateOfBirth,
            email: voterData.email,
            phoneNumber: voterData.phoneNumber,
            countyId,
            constituencyId,
            wardId,
            countyName: voterData.countyCode, // Simplified
            constituencyName: voterData.constituencyCode, // Simplified
            wardName: voterData.wardCode, // Simplified
            status: 'verified',
            nationalIdVerified: true,
            verifiedAt: new Date(),
            passwordHash: existing.passwordHash || defaultPasswordHash,
          });
        } else {
          const voter = this.voterRepository.create({
            nationalId: voterData.nationalId,
            firstName: voterData.firstName,
            lastName: voterData.lastName,
            dateOfBirth: voterData.dateOfBirth,
            email: voterData.email,
            phoneNumber: voterData.phoneNumber,
            countyId,
            constituencyId,
            wardId,
            countyName: voterData.countyCode,
            constituencyName: voterData.constituencyCode,
            wardName: voterData.wardCode,
            status: 'verified',
            nationalIdVerified: true,
            verifiedAt: new Date(),
            registeredAt: new Date(),
            passwordHash: defaultPasswordHash,
            failedLoginAttempts: 0,
          });
          await this.voterRepository.save(voter);
        }
      } catch (error) {
        this.logger.error(`Error seeding voter ${voterData.nationalId}:`, error.message);
      }
    }

    const count = await this.voterRepository.count();
    this.logger.log(`Voter seed complete. Total voters: ${count}`);
  }
}
