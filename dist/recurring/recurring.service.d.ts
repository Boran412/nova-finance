import { CsvService } from '../database/csv.service';
import { RecurringDto } from './dto/recurring.dto';
export declare class RecurringService {
    private csvService;
    constructor(csvService: CsvService);
    create(userId: number, dto: RecurringDto): Promise<any>;
    findAllAndTrigger(userId: number): Promise<any[]>;
    remove(userId: number, id: number): Promise<{
        success: boolean;
    }>;
}
