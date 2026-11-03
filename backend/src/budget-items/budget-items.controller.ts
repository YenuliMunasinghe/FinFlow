import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role, Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BudgetItemsService } from './budget-items.service';
import { CreateBudgetItemDto } from './dto/create-budget-item.dto';
import { UpdateBudgetItemDto } from './dto/update-budget-item.dto';

@Controller('events/:eventId/budget-items')
@UseGuards(JwtAuthGuard)
export class BudgetItemsController {
  constructor(private readonly budgetItemsService: BudgetItemsService) {}

  @Get()
  findAll(@Param('eventId') eventId: string) {
    return this.budgetItemsService.findAll(eventId);
  }

  @Get(':budgetItemId')
  findOne(
    @Param('eventId') eventId: string,
    @Param('budgetItemId') budgetItemId: string,
  ) {
    return this.budgetItemsService.findOne(eventId, budgetItemId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.TREASURER, Role.PRESIDENT, Role.ADMIN)
  create(@Param('eventId') eventId: string, @Body() dto: CreateBudgetItemDto) {
    return this.budgetItemsService.create(eventId, dto);
  }

  @Patch(':budgetItemId')
  @UseGuards(RolesGuard)
  @Roles(Role.TREASURER, Role.PRESIDENT, Role.ADMIN)
  update(
    @Param('eventId') eventId: string,
    @Param('budgetItemId') budgetItemId: string,
    @Body() dto: UpdateBudgetItemDto,
  ) {
    return this.budgetItemsService.update(eventId, budgetItemId, dto);
  }

  @Delete(':budgetItemId')
  @UseGuards(RolesGuard)
  @Roles(Role.TREASURER, Role.PRESIDENT, Role.ADMIN)
  remove(
    @Param('eventId') eventId: string,
    @Param('budgetItemId') budgetItemId: string,
  ) {
    return this.budgetItemsService.remove(eventId, budgetItemId);
  }
}
