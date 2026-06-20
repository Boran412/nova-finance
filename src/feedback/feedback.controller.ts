import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackDto } from './dto/feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@GetUser('id') userId: number, @Body() dto: FeedbackDto) {
    return this.feedbackService.create(userId, dto);
  }

  @Get()
  findAll() {
    return this.feedbackService.findAll();
  }
}
