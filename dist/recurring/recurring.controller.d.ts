import { RecurringService } from './recurring.service';
import { RecurringDto } from './dto/recurring.dto';
export declare class RecurringController {
    private readonly recurringService;
    constructor(recurringService: RecurringService);
    create(userId: number, dto: RecurringDto): Promise<any>;
    findAll(userId: number): Promise<any[]>;
    remove(userId: number, id: number): Promise<{
        success: boolean;
    }>;
}
