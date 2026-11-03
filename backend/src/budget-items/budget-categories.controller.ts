import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BudgetItemsService } from './budget-items.service';

@Controller('budget-categories')
@UseGuards(JwtAuthGuard)
export class BudgetCategoriesController {
  constructor(private readonly budgetItemsService: BudgetItemsService) {}

  @Get()
  findAll() {
    return this.budgetItemsService.findCategories();
  }
}
