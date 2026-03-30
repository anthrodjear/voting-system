import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface TestFixture {
  voter: any;
  candidate: any;
  election: any;
  admin: any;
}

let app: INestApplication;
let dataSource: DataSource;

export async function setupTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.TEST_DB_HOST || 'localhost',
        port: parseInt(process.env.TEST_DB_PORT || '5433'),
        username: process.env.TEST_DB_USER || 'postgres',
        password: process.env.TEST_DB_PASSWORD || 'postgres',
        database: process.env.TEST_DB_NAME || 'voting_test',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        dropSchema: true,
      }),
    ],
  }).compile();

  app = moduleFixture.createNestApplication();
  dataSource = app.get<DataSource>(DataSource);
  
  await app.init();
  return app;
}

export async function teardownTestApp(): Promise<void> {
  if (app) {
    await app.close();
  }
}

export async function clearDatabase(): Promise<void> {
  if (dataSource) {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.delete({});
    }
  }
}

export async function createVoterFixture(dataSource: DataSource, voterData: Partial<any> = {}): Promise<any> {
  const voter = {
    nationalId: voterData.nationalId || '12345678',
    firstName: voterData.firstName || 'John',
    lastName: voterData.lastName || 'Doe',
    dateOfBirth: voterData.dateOfBirth || new Date('1990-01-01'),
    email: voterData.email || 'john@example.com',
    phoneNumber: voterData.phoneNumber || '+254700000000',
    status: voterData.status || 'verified',
    passwordHash: voterData.passwordHash || '$2a$10$test',
    ...voterData,
  };
  
  return dataSource.getRepository('voter').save(voter);
}

export async function createElectionFixture(dataSource: DataSource, electionData: Partial<any> = {}): Promise<any> {
  const election = {
    name: electionData.name || 'Test Election',
    type: electionData.type || 'presidential',
    description: electionData.description || 'Test Description',
    status: electionData.status || 'draft',
    startTime: electionData.startTime || new Date(Date.now() + 3600000),
    endTime: electionData.endTime || new Date(Date.now() + 7200000),
    ...electionData,
  };
  
  return dataSource.getRepository('election').save(election);
}

export async function createCandidateFixture(dataSource: DataSource, candidateData: Partial<any> = {}): Promise<any> {
  const candidate = {
    firstName: candidateData.firstName || 'Jane',
    lastName: candidateData.lastName || 'Smith',
    partyName: candidateData.partyName || 'Party A',
    status: candidateData.status || 'approved',
    ...candidateData,
  };
  
  return dataSource.getRepository('candidate').save(candidate);
}

export async function createAdminFixture(dataSource: DataSource, adminData: Partial<any> = {}): Promise<any> {
  const admin = {
    username: adminData.username || 'admin',
    email: adminData.email || 'admin@example.com',
    passwordHash: adminData.passwordHash || '$2a$10$test',
    role: adminData.role || 'super_admin',
    ...adminData,
  };
  
  return dataSource.getRepository('super_admin').save(admin);
}

export async function createTestFixtures(): Promise<TestFixture> {
  const voter = await createVoterFixture(dataSource);
  const election = await createElectionFixture(dataSource);
  const candidate = await createCandidateFixture(dataSource, { electionId: election.id });
  const admin = await createAdminFixture(dataSource);
  
  return { voter, candidate, election, admin };
}
