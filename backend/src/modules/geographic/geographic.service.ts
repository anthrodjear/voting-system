import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';

@Injectable()
export class GeographicService {
  constructor(
    @InjectRepository(County)
    private countyRepository: Repository<County>,
    @InjectRepository(Constituency)
    private constituencyRepository: Repository<Constituency>,
    @InjectRepository(Ward)
    private wardRepository: Repository<Ward>,
  ) {}

  /**
   * Get all active counties
   */
  async getCounties(): Promise<Array<{ id: string; name: string; code: string }>> {
    const counties = await this.countyRepository.find({
      where: { isActive: true },
      select: ['id', 'countyName', 'countyCode'],
      order: { countyName: 'ASC' },
    });

    return counties.map(county => ({
      id: county.id,
      name: county.countyName,
      code: county.countyCode,
    }));
  }

  /**
   * Get constituencies by county ID
   */
  async getConstituenciesByCounty(countyId: string): Promise<Array<{ id: string; name: string; code: string }>> {
    // Validate that county exists
    const county = await this.countyRepository.findOne({
      where: { id: countyId, isActive: true },
    });

    if (!county) {
      throw new NotFoundException(`County with ID ${countyId} not found`);
    }

    const constituencies = await this.constituencyRepository.find({
      where: { countyId, isActive: true },
      select: ['id', 'constituencyName', 'constituencyCode'],
      order: { constituencyName: 'ASC' },
    });

    return constituencies.map(constituency => ({
      id: constituency.id,
      name: constituency.constituencyName,
      code: constituency.constituencyCode,
    }));
  }

  /**
   * Get wards by constituency ID
   */
  async getWardsByConstituency(constituencyId: string): Promise<Array<{ id: string; name: string; code: string }>> {
    // Validate that constituency exists
    const constituency = await this.constituencyRepository.findOne({
      where: { id: constituencyId, isActive: true },
    });

    if (!constituency) {
      throw new NotFoundException(`Constituency with ID ${constituencyId} not found`);
    }

    const wards = await this.wardRepository.find({
      where: { constituencyId, isActive: true },
      select: ['id', 'wardName', 'wardCode'],
      order: { wardName: 'ASC' },
    });

    return wards.map(ward => ({
      id: ward.id,
      name: ward.wardName,
      code: ward.wardCode,
    }));
  }

  /**
   * Get county name by ID
   */
  async getCountyName(countyId: string): Promise<string> {
    const county = await this.countyRepository.findOne({
      where: { id: countyId, isActive: true },
      select: ['countyName'],
    });

    if (!county) {
      throw new NotFoundException(`County with ID ${countyId} not found`);
    }

    return county.countyName;
  }

  /**
   * Get constituency name by ID
   */
  async getConstituencyName(constituencyId: string): Promise<string> {
    const constituency = await this.constituencyRepository.findOne({
      where: { id: constituencyId, isActive: true },
      select: ['constituencyName'],
    });

    if (!constituency) {
      throw new NotFoundException(`Constituency with ID ${constituencyId} not found`);
    }

    return constituency.constituencyName;
  }

  /**
   * Get ward name by ID
   */
  async getWardName(wardId: string): Promise<string> {
    const ward = await this.wardRepository.findOne({
      where: { id: wardId, isActive: true },
      select: ['wardName'],
    });

    if (!ward) {
      throw new NotFoundException(`Ward with ID ${wardId} not found`);
    }

    return ward.wardName;
  }
}