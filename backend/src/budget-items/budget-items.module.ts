import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BudgetCategoriesController } from './budget-categories.controller';
import { BudgetItemsController } from './budget-items.controller';
import { BudgetItemsService } from './budget-items.service';

@Module({
  imports: [PrismaModule],
  controllers: [BudgetItemsController, BudgetCategoriesController],
  providers: [BudgetItemsService],
  exports: [BudgetItemsService],
})
export class BudgetItemsModule {}
