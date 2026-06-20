import { Controller, Get, Post, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetDto } from './dto/budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  create(@GetUser('id') userId: number, @Body() dto: BudgetDto) {
    return this.budgetService.create(userId, dto);
  }

  @Get()
  findAll(@GetUser('id') userId: number) {
    return this.budgetService.findAll(userId);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.budgetService.remove(userId, id);
  }
}
