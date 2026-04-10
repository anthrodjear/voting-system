import { Controller, Get, Query, Param } from '@nestjs/common';
import { GeographicService } from './geographic.service';

@Controller('geographic')
export class GeographicController {
  constructor(private readonly geographicService: GeographicService) {}

  @Get('counties')
  async getCounties() {
    return this.geographicService.getCounties();
  }

  @Get('constituencies')
  async getConstituenciesByCounty(@Query('countyId') countyId: string) {
    return this.geographicService.getConstituenciesByCounty(countyId);
  }

  @Get('wards')
  async getWardsByConstituency(@Query('constituencyId') constituencyId: string) {
    return this.geographicService.getWardsByConstituency(constituencyId);
  }
}