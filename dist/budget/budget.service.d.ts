import { CsvService } from '../database/csv.service';
import { BudgetDto } from './dto/budget.dto';
export declare class BudgetService {
    private csvService;
    constructor(csvService: CsvService);
    create(userId: number, dto: BudgetDto): Promise<any>;
    findAll(userId: number): Promise<any[]>;
    remove(userId: number, id: number): Promise<{
        success: boolean;
    }>;
}
