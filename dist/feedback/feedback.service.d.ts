import { CsvService } from '../database/csv.service';
import { FeedbackDto } from './dto/feedback.dto';
export declare class FeedbackService {
    private csvService;
    constructor(csvService: CsvService);
    create(userId: number, dto: FeedbackDto): Promise<any>;
    findAll(): Promise<any[]>;
}
