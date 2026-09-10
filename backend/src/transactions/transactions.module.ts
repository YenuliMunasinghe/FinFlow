import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, CloudinaryService],
  exports: [TransactionsService, CloudinaryService],
})
export class TransactionsModule {}
