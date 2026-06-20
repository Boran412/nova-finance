import { Injectable } from '@nestjs/common';
import { CsvService } from '../database/csv.service';
import { FeedbackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private csvService: CsvService) {}

  async create(userId: number, dto: FeedbackDto) {
    const feedback = await this.csvService.append<any>('feedbacks', {
      id: 0,
      userId,
      rating: dto.rating,
      comment: dto.comment || '',
      createdAt: new Date(),
    });
    return feedback;
  }

  async findAll() {
    return this.csvService.read<any>('feedbacks');
  }
}
