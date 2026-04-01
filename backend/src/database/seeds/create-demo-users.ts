import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as argon2 from 'argon2';

config();

import { Voter } from '../../entities/voter.entity';
import { ReturningOfficer } from '../../entities/returning-officer.entity';
import { SuperAdmin } from '../../entities/super-admin.entity';
import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';
import { VoterBiometric } from '../../entities/voter-biometric.entity';

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'voting_system',
    entities: [County, Constituency, Ward, Voter, VoterBiometric, ReturningOfficer, SuperAdmin],
    synchronize: false,
    logging: false,
  });

  await dataSource.initialize();
  console.log('Database connected');

  const countyRepo = dataSource.getRepository(County);
  const constRepo = dataSource.getRepository(Constituency);
  const wardRepo = dataSource.getRepository(Ward);

  let county = await countyRepo.findOne({ where: {} });
  let constituency = await constRepo.findOne({ where: {} });
  let ward = await wardRepo.findOne({ where: {} });

  if (!county) {
    county = await countyRepo.save(countyRepo.create({
      countyCode: '001', countyName: 'Mombasa', region: 'Coast', capital: 'Mombasa City',
    }));
    console.log('Created county');
  }
  if (!constituency) {
    constituency = await constRepo.save(constRepo.create({
      constituencyCode: '001', constituencyName: 'Mvita', countyId: county.id,
    }));
    console.log('Created constituency');
  }
  if (!ward) {
    ward = await wardRepo.save(wardRepo.create({
      wardCode: '001', wardName: 'Mvita', constituencyId: constituency.id,
    }));
    console.log('Created ward');
  }

  const voterPassword = await argon2.hash('Voter123456!');
  const adminPassword = await argon2.hash('Admin123456!');
  const roPassword = await argon2.hash('Ro123456789!');

  // Demo Voter
  const voterRepo = dataSource.getRepository(Voter);
  let v = await voterRepo.findOne({ where: { nationalId: '12345678' } });
  if (!v) {
    v = voterRepo.create({
      nationalId: '12345678', firstName: 'John', lastName: 'Doe',
      dateOfBirth: new Date('1990-01-15'), email: 'voter@iebc.go.ke',
      phoneNumber: '+254700000001', countyId: county.id, countyName: county.countyName,
      constituencyId: constituency.id, constituencyName: constituency.constituencyName,
      wardId: ward.id, wardName: ward.wardName,
      passwordHash: voterPassword, status: 'active',
    });
    console.log('Created demo voter: voter@iebc.go.ke / Voter123456!');
  } else {
    v.passwordHash = voterPassword;
    console.log('Updated demo voter password');
  }
  await voterRepo.save(v);

  // Demo Admin
  const adminRepo = dataSource.getRepository(SuperAdmin);
  let a = await adminRepo.findOne({ where: { email: 'admin@iebc.go.ke' } });
  if (!a) {
    a = adminRepo.create({
      email: 'admin@iebc.go.ke', firstName: 'Admin', lastName: 'User',
      passwordHash: adminPassword, level: 'super_admin', isActive: true,
    });
    console.log('Created demo admin: admin@iebc.go.ke / Admin123456!');
  } else {
    a.passwordHash = adminPassword;
    console.log('Updated demo admin password');
  }
  await adminRepo.save(a);

  // Demo RO
  const roRepo = dataSource.getRepository(ReturningOfficer);
  let r = await roRepo.findOne({ where: { email: 'ro@iebc.go.ke' } });
  if (!r) {
    r = roRepo.create({
      email: 'ro@iebc.go.ke', firstName: 'Returning', lastName: 'Officer',
      passwordHash: roPassword, assignedCountyId: county.id,
      assignedCountyName: county.countyName, status: 'active',
    });
    console.log('Created demo RO: ro@iebc.go.ke / Ro123456789!');
  } else {
    r.passwordHash = roPassword;
    console.log('Updated demo RO password');
  }
  await roRepo.save(r);

  console.log('\n========================================');
  console.log('Demo accounts:');
  console.log('  Voter: voter@iebc.go.ke / Voter123456!');
  console.log('  Admin: admin@iebc.go.ke / Admin123456!');
  console.log('  RO:    ro@iebc.go.ke    / Ro123456789!');
  console.log('========================================\n');

  await dataSource.destroy();
}

main().catch(console.error);
