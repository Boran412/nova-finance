import { Controller, Get, Post, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RecurringService } from './recurring.service';
import { RecurringDto } from './dto/recurring.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('recurring')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Post()
  create(@GetUser('id') userId: number, @Body() dto: RecurringDto) {
    return this.recurringService.create(userId, dto);
  }

  @Get()
  findAll(@GetUser('id') userId: number) {
    return this.recurringService.findAllAndTrigger(userId);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.recurringService.remove(userId, id);
  }
}
