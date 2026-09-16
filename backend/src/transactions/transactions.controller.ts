import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CloudinaryService } from '../upload/cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Role } from '../auth/roles.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.transactionsService.findAll(status, type);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Post()
  async create(@Request() req: any, @Body() createDto: CreateTransactionDto) {
    const userId = req.user?.id || req.user?.userId || 'guest-user';
    return this.transactionsService.create(userId, createDto);
  }

  @Post('upload-receipt')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceipt(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No receipt file provided for upload.');
    }
    const receiptUrl = await this.cloudinaryService.uploadReceipt(
      file.buffer || Buffer.from(''),
      file.originalname || 'receipt.png',
    );
    return { receiptUrl };
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.PRESIDENT)
  async approve(@Param('id') id: string, @Request() req: any) {
    const approverId = req.user?.id || req.user?.userId;
    return this.transactionsService.approveTransaction(id, approverId);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.PRESIDENT)
  async reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.transactionsService.rejectTransaction(id, reason);
  }

  @Patch(':id/revision')
  @UseGuards(RolesGuard)
  @Roles(Role.PRESIDENT)
  async requestRevision(
    @Param('id') id: string,
    @Body('instructions') instructions?: string,
  ) {
    return this.transactionsService.requestRevision(id, instructions);
  }
}
