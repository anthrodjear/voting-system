import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  private readonly startTime = Date.now();

  @Get('health')
  @ApiOperation({ summary: 'System health check' })
  @ApiResponse({ status: 200, description: 'Health status' })
  getHealth(): { success: boolean; data: { status: string; version: string; uptime: number; timestamp: string } } {
    return {
      success: true,
      data: {
        status: 'healthy',
        version: '1.0.0',
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        timestamp: new Date().toISOString(),
      },
    };
  }
}
