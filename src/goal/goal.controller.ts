import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { GoalService } from './goal.service';
import { GoalDto, UpdateGoalAmountDto } from './dto/goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  create(@GetUser('id') userId: number, @Body() dto: GoalDto) {
    return this.goalService.create(userId, dto);
  }

  @Get()
  findAll(@GetUser('id') userId: number) {
    return this.goalService.findAll(userId);
  }

  @Put(':id/amount')
  updateAmount(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGoalAmountDto
  ) {
    return this.goalService.updateAmount(userId, id, dto);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.goalService.remove(userId, id);
  }
}
