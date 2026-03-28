# API Controllers

## Overview

This document details the controller logic for handling API requests.

---

## 1. Authentication Controllers

### AuthController

```typescript
// controllers/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    // 1. Validate credentials
    const user = await this.authService.validateCredentials(
      loginDto.nationalId,
      loginDto.password,
      loginDto.userType
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check if MFA required
    const requiresMfa = await this.authService.requiresMfa(user);

    // 3. Generate tokens
    const tokens = await this.authService.generateTokens(user);

    // 4. Return response
    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 900,
        requiresMfa
      }
    };
  }

  @Post('mfa/verify')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async verifyMfa(
    @Body() mfaDto: MfaVerifyDto,
    @User() user: AuthUser
  ): Promise<MfaVerifyResponse> {
    let verified = false;

    if (mfaDto.mfaType === 'biometric') {
      verified = await this.biometricService.verifyFace(
        user.id,
        mfaDto.mfaData.faceTemplate
      );
      verified = verified && await this.biometricService.verifyFingerprint(
        user.id,
        mfaDto.mfaData.fingerprintTemplate
      );
    } else if (mfaDto.mfaType === 'totp') {
      verified = await this.authService.verifyTotp(
        user.id,
        mfaDto.mfaData.totpCode
      );
    }

    if (!verified) {
      throw new UnauthorizedException('MFA verification failed');
    }

    // Create session
    const sessionId = await this.authService.createSession(user);

    return {
      success: true,
      data: { verified: true, sessionId }
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() refreshDto: RefreshTokenDto): Promise<TokenResponse> {
    const user = await this.authService.validateRefreshToken(
      refreshDto.refreshToken
    );

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.authService.generateTokens(user);

    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        expiresIn: 900
      }
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@User() user: AuthUser): Promise<MessageResponse> {
    await this.authService.invalidateSession(user.sessionId);
    await this.authService.blacklistToken(user.accessToken);

    return { success: true, data: { message: 'Logged out successfully' } };
  }
}
```

---

## 2. Voter Controllers

### VoterController

```typescript
// controllers/voter.controller.ts
@Controller('voters')
export class VoterController {
  constructor(
    private readonly voterService: VoterService,
    private readonly biometricService: BiometricService
  ) {}

  @Post('register')
  async register(@Body() registerDto: VoterRegisterDto): Promise<VoterResponse> {
    // 1. Validate ID format
    if (!this.validator.validateNationalId(registerDto.nationalId)) {
      throw new BadRequestException('Invalid National ID format');
    }

    // 2. Check if already registered
    const existing = await this.voterService.findByNationalId(
      registerDto.nationalId
    );
    if (existing) {
      throw new ConflictException('Voter already registered');
    }

    // 3. Verify location data
    const location = await this.locationService.validateLocation({
      county: registerDto.county,
      constituency: registerDto.constituency,
      ward: registerDto.ward
    });

    // 4. Create voter record
    const voter = await this.voterService.create({
      ...registerDto,
      locationId: location.id,
      status: 'pending_biometrics'
    });

    return {
      success: true,
      data: {
        voterId: voter.id,
        status: voter.status,
        message: 'Please complete biometric enrollment'
      }
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('voter', 'ro', 'admin')
  async getVoter(
    @Param('id') id: string,
    @User() user: AuthUser
  ): Promise<VoterDetailsResponse> {
    // Voters can only view their own profile
    if (user.role === 'voter' && user.voterId !== id) {
      throw new ForbiddenException('Access denied');
    }

    const voter = await this.voterService.findById(id);
    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    return {
      success: true,
      data: this.voterMapper.toDto(voter)
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateVoter(
    @Param('id') id: string,
    @Body() updateDto: VoterUpdateDto,
    @User() user: AuthUser
  ): Promise<UpdateResponse> {
    // Verify ownership
    if (user.voterId !== id) {
      throw new ForbiddenException('Cannot update other voter profiles');
    }

    const updated = await this.voterService.update(id, updateDto);

    return {
      success: true,
      data: { voterId: id, updated: true }
    };
  }

  @Post(':id/biometrics/enroll')
  @UseGuards(JwtAuthGuard)
  async enrollBiometrics(
    @Param('id') id: string,
    @Body() biometricDto: BiometricEnrollDto,
    @User() user: AuthUser
  ): Promise<BiometricEnrollResponse> {
    // Verify ownership
    if (user.voterId !== id) {
      throw new ForbiddenException('Cannot enroll biometrics for other voter');
    }

    // 1. Liveness check
    const liveness = await this.biometricService.checkLiveness(
      biometricDto.faceImage,
      biometricDto.faceLivenessToken
    );

    if (!liveness.valid) {
      throw new BadRequestException('Liveness check failed');
    }

    // 2. Extract face template
    const faceTemplate = await this.biometricService.extractFaceTemplate(
      biometricDto.faceImage
    );

    // 3. Extract fingerprint templates
    const fingerprintTemplates = await this.biometricService.extractFingerprintTemplates(
      biometricDto.fingerprintImages
    );

    // 4. Store securely
    await this.biometricService.enrollFace(id, faceTemplate);
    await this.biometricService.enrollFingerprints(id, fingerprintTemplates);

    // 5. Update voter status
    await this.voterService.updateStatus(id, 'pending_verification');

    return {
      success: true,
      data: {
        enrolled: true,
        faceEnrolled: true,
        fingerprintEnrolled: true
      }
    };
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Param('id') id: string): Promise<VoterStatusResponse> {
    const voter = await this.voterService.findById(id);
    
    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    return {
      success: true,
      data: {
        voterId: voter.id,
        status: voter.status,
        idVerified: voter.nationalIdVerified,
        faceEnrolled: voter.faceEnrolled,
        fingerprintEnrolled: voter.fingerprintEnrolled,
        verifiedAt: voter.verifiedAt
      }
    };
  }
}
```

---

## 3. Vote Controllers

### VoteController

```typescript
// controllers/vote.controller.ts
@Controller('votes')
export class VoteController {
  constructor(
    private readonly voteService: VoteService,
    private readonly batchService: BatchService
  ) {}

  @Get('ballot')
  @UseGuards(JwtAuthGuard, MfaGuard)
  async getBallot(@User() user: AuthUser): Promise<BallotResponse> {
    // 1. Verify voter eligibility
    const voter = await this.voterService.findById(user.voterId);
    if (!voter || voter.status !== 'verified') {
      throw new ForbiddenException('Voter not eligible to vote');
    }

    // 2. Check if already voted
    const hasVoted = await this.voteService.hasVoted(user.voterId);
    if (hasVoted) {
      throw new ConflictException('Vote already cast');
    }

    // 3. Get ballot
    const ballot = await this.voteService.getBallot(voter.countyId);

    return {
      success: true,
      data: ballot
    };
  }

  @Post('cast')
  @UseGuards(JwtAuthGuard, MfaGuard)
  async castVote(
    @Body() castVoteDto: CastVoteDto,
    @User() user: AuthUser
  ): Promise<VoteConfirmationResponse> {
    // 1. Verify voter eligibility
    const voter = await this.voterService.findById(user.voterId);
    if (!voter || voter.status !== 'verified') {
      throw new ForbiddenException('Voter not eligible to vote');
    }

    // 2. Check if already voted (double-vote prevention)
    const hasVoted = await this.voteService.hasVoted(user.voterId);
    if (hasVoted) {
      throw new ConflictException('Vote already cast');
    }

    // 3. Verify ZK proof
    const isValidProof = await this.cryptographyService.verifyVoteProof(
      castVoteDto.encryptedVote,
      castVoteDto.zkProof
    );

    if (!isValidProof) {
      throw new BadRequestException('Invalid vote proof');
    }

    // 4. Submit to batch
    const result = await this.batchService.submitVote(
      user.voterId,
      castVoteDto.batchId,
      castVoteDto.encryptedVote
    );

    // 5. Wait for confirmation
    const confirmation = await this.voteService.waitForConfirmation(
      result.submissionId,
      30000 // 30 second timeout
    );

    return {
      success: true,
      data: confirmation
    };
  }

  @Get('confirmation/:id')
  @UseGuards(JwtAuthGuard)
  async getConfirmation(
    @Param('id') id: string,
    @User() user: AuthUser
  ): Promise<VoteConfirmationDetailsResponse> {
    const confirmation = await this.voteService.getConfirmation(id);
    
    if (!confirmation) {
      throw new NotFoundException('Confirmation not found');
    }

    // Verify ownership
    if (confirmation.voterId !== user.voterId && user.role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }

    return {
      success: true,
      data: confirmation
    };
  }

  @Get('status/:voterId')
  @UseGuards(JwtAuthGuard)
  async getVoteStatus(
    @Param('voterId') voterId: string,
    @User() user: AuthUser
  ): Promise<VoteStatusResponse> {
    // Verify ownership or admin
    if (user.voterId !== voterId && user.role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }

    const status = await this.voteService.getVoteStatus(voterId);

    return {
      success: true,
      data: status
    };
  }
}
```

---

## 4. Batch Controllers

### BatchController

```typescript
// controllers/batch.controller.ts
@Controller('batches')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post('join')
  @UseGuards(JwtAuthGuard, MfaGuard)
  async joinBatch(@User() user: AuthUser): Promise<BatchAssignmentResponse> {
    // Check if voter eligible
    const voter = await this.voterService.findById(user.voterId);
    if (!voter || voter.status !== 'verified') {
      throw new ForbiddenException('Voter not eligible');
    }

    // Check if already in batch
    const existingBatch = await this.batchService.getVoterBatch(user.voterId);
    if (existingBatch) {
      return {
        success: true,
        data: {
          batchId: existingBatch.id,
          assignedPosition: existingBatch.getPosition(user.voterId),
          estimatedWait: existingBatch.getWaitTime(),
          totalVoters: existingBatch.totalVoters,
          currentVoters: existingBatch.currentVoters
        }
      };
    }

    // Join new batch
    const assignment = await this.batchService.assignVoter(user.voterId);

    return {
      success: true,
      data: assignment
    };
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  async submitVoteToBatch(
    @Param('id') batchId: string,
    @Body() submitDto: BatchVoteDto,
    @User() user: AuthUser
  ): Promise<BatchSubmitResponse> {
    // Verify voter in batch
    const batch = await this.batchService.getBatch(batchId);
    if (!batch.hasVoter(user.voterId)) {
      throw new BadRequestException('Voter not in this batch');
    }

    // Submit vote
    const result = await this.batchService.queueVote(
      batchId,
      user.voterId,
      submitDto.encryptedVote
    );

    return {
      success: true,
      data: {
        queued: true,
        queuePosition: result.position,
        estimatedConfirmation: result.estimatedTime
      }
    };
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  async getBatchStatus(
    @Param('id') batchId: string,
    @User() user: AuthUser
  ): Promise<BatchStatusResponse> {
    const batch = await this.batchService.getBatch(batchId);
    
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return {
      success: true,
      data: {
        batchId: batch.id,
        status: batch.status,
        totalVoters: batch.totalVoters,
        currentVoters: batch.currentVoters,
        votesCollected: batch.votesCollected,
        timeRemaining: batch.getTimeRemaining()
      }
    };
  }

  @Post('heartbeat')
  @UseGuards(JwtAuthGuard)
  async heartbeat(@User() user: AuthUser): Promise<HeartbeatResponse> {
    const result = await this.batchService.updateHeartbeat(user.voterId);

    return {
      success: true,
      data: {
        heartbeatReceived: true,
        positionSecured: result.positionSecured
      }
    };
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  async leaveBatch(
    @Param('id') batchId: string,
    @User() user: AuthUser
  ): Promise<LeaveBatchResponse> {
    await this.batchService.removeVoter(batchId, user.voterId);

    return {
      success: true,
      data: {
        message: 'Removed from batch',
        canRejoin: true
      }
    };
  }
}
```

---

## 5. Admin Controllers

### AdminController

```typescript
// controllers/admin.controller.ts
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly roService: ReturningOfficerService
  ) {}

  // RO Application Management
  @Post('ro/applications')
  async submitApplication(
    @Body() applicationDto: RoApplicationDto
  ): Promise<ApplicationResponse> {
    const application = await this.roService.submitApplication(applicationDto);
    
    return {
      success: true,
      data: {
        applicationId: application.id,
        status: 'submitted',
        message: 'Application submitted. Pending approval.'
      }
    };
  }

  @Get('ro/applications')
  @Roles('admin')
  async listApplications(
    @Query() query: ApplicationQueryDto
  ): Promise<ApplicationListResponse> {
    const applications = await this.roService.listApplications(query);
    
    return {
      success: true,
      data: applications
    };
  }

  @Put('ro/applications/:id')
  @Roles('admin')
  async reviewApplication(
    @Param('id') id: string,
    @Body() reviewDto: ApplicationReviewDto
  ): Promise<ApplicationReviewResponse> {
    const result = await this.roService.reviewApplication(id, reviewDto);
    
    return {
      success: true,
      data: result
    };
  }

  // County Management
  @Post('counties')
  @Roles('super_admin')
  async addCounty(@Body() countyDto: CountyDto): Promise<CountyResponse> {
    const county = await this.adminService.addCounty(countyDto);
    
    return {
      success: true,
      data: county
    };
  }

  @Get('counties')
  async listCounties(): Promise<CountyListResponse> {
    const counties = await this.adminService.listCounties();
    
    return {
      success: true,
      data: counties
    };
  }

  // Presidential Candidates
  @Post('presidential')
  @Roles('super_admin')
  async addPresidentialCandidate(
    @Body() candidateDto: PresidentialCandidateDto
  ): Promise<CandidateResponse> {
    const candidate = await this.adminService.addPresidentialCandidate(
      candidateDto
    );
    
    return {
      success: true,
      data: {
        candidateId: candidate.id,
        status: candidate.status,
        message: 'Candidate added successfully'
      }
    };
  }

  // Candidate Management
  @Put('candidates/:id/approve')
  @Roles('admin', 'super_admin')
  async approveCandidate(
    @Param('id') id: string
  ): Promise<ApprovalResponse> {
    const candidate = await this.candidateService.approve(id);
    
    return {
      success: true,
      data: {
        candidateId: candidate.id,
        status: 'approved',
        approvedAt: new Date()
      }
    };
  }
}
```

---

## 6. Reporting Controllers

### ReportingController

```typescript
// controllers/reporting.controller.ts
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('results')
  async getResults(
    @Query() query: ResultsQueryDto
  ): Promise<ResultsResponse> {
    const results = await this.reportingService.getResults(query);
    
    return {
      success: true,
      data: results
    };
  }

  @Get('turnout')
  async getTurnout(): Promise<TurnoutResponse> {
    const turnout = await this.reportingService.getTurnout();
    
    return {
      success: true,
      data: turnout
    };
  }

  @Get('audit')
  @Roles('admin', 'super_admin')
  async getAuditReport(): Promise<AuditResponse> {
    const audit = await this.reportingService.generateAuditReport();
    
    return {
      success: true,
      data: audit
    };
  }

  @Get('county/:countyId')
  @Roles('admin', 'ro')
  async getCountyReport(
    @Param('countyId') countyId: string,
    @User() user: AuthUser
  ): Promise<CountyReportResponse> {
    // Verify RO access to county
    if (user.role === 'ro' && user.countyId !== countyId) {
      throw new ForbiddenException('Access denied');
    }

    const report = await this.reportingService.getCountyReport(countyId);
    
    return {
      success: true,
      data: report
    };
  }
}
```

---

## 7. Request/Response DTOs

### Authentication DTOs

```typescript
// dto/auth.dto.ts
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(['voter', 'ro', 'admin'])
  userType: 'voter' | 'ro' | 'admin';
}

export class MfaVerifyDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(['biometric', 'totp'])
  mfaType: 'biometric' | 'totp';

  @IsObject()
  mfaData: {
    faceTemplate?: string;
    fingerprintTemplate?: string;
    totpCode?: string;
  };
}
```

### Voter DTOs

```typescript
// dto/voter.dto.ts
export class VoterRegisterDto {
  @IsString()
  @Matches(/^[0-9]{8}$/, { message: 'Invalid National ID' })
  nationalId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  county: string;

  @IsString()
  constituency: string;

  @IsString()
  ward: string;

  @IsString()
  @IsPhoneNumber('KE')
  phoneNumber: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export class BiometricEnrollDto {
  @IsString()
  @IsNotEmpty()
  faceImage: string;

  @IsString()
  @IsNotEmpty()
  faceLivenessToken: string;

  @IsObject()
  @ValidateNested()
  fingerprintImages: {
    leftThumb: string;
    rightThumb: string;
  };
}
```

### Vote DTOs

```typescript
// dto/vote.dto.ts
export class CastVoteDto {
  @IsString()
  @IsNotEmpty()
  ballotId: string;

  @IsString()
  @IsNotEmpty()
  encryptedVote: string;

  @IsString()
  @IsNotEmpty()
  zkProof: string;

  @IsString()
  @IsNotEmpty()
  batchId: string;
}
```

---

## 8. Error Handling

### Global Exception Filter

```typescript
// filters/global.exception-filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getStatus(exception);
    const message = this.getMessage(exception);
    const code = this.getCode(exception);

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details: this.getDetails(exception)
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.headers['x-request-id']
      }
    });
  }
}
```
