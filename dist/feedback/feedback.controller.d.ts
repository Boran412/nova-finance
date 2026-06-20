import { FeedbackService } from './feedback.service';
import { FeedbackDto } from './dto/feedback.dto';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    create(userId: number, dto: FeedbackDto): Promise<any>;
    findAll(): Promise<any[]>;
}
