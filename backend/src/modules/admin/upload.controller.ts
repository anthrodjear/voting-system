import { Controller, Post, Param, UseInterceptors, UploadedFile, UseGuards, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload directories exist
    const dirs = ['candidates', 'voters', 'general'];
    dirs.forEach(dir => {
      const fullPath = join(this.uploadDir, dir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  @Post('candidates/:id/photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload candidate photo' })
  @ApiResponse({ status: 200, description: 'Photo uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req: any, _file: any, cb: any) => {
          const dest = join(process.cwd(), 'uploads', 'candidates');
          cb(null, dest);
        },
        filename: (req: any, file: any, cb: any) => {
          const candidateId = (req.params as any).id;
          const ext = extname(file.originalname);
          const uniqueName = `${candidateId}-${Date.now()}${ext}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (_req: any, file: any, cb: any) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadCandidatePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: MulterFile,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: { url: string; filename: string } }> {
    const url = `/uploads/candidates/${file.filename}`;
    
    return {
      success: true,
      data: {
        url,
        filename: file.filename,
      },
    };
  }

  @Post('general')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a general file' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req: any, _file: any, cb: any) => {
          const dest = join(process.cwd(), 'uploads', 'general');
          cb(null, dest);
        },
        filename: (_req: any, file: any, cb: any) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (_req: any, file: any, cb: any) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadGeneralFile(
    @UploadedFile() file: MulterFile,
  ): Promise<{ success: boolean; data: { url: string; filename: string } }> {
    const url = `/uploads/general/${file.filename}`;
    
    return {
      success: true,
      data: {
        url,
        filename: file.filename,
      },
    };
  }
}
