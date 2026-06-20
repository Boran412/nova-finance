import { CsvService } from '../database/csv.service';
import { GoalDto, UpdateGoalAmountDto } from './dto/goal.dto';
export declare class GoalService {
    private csvService;
    constructor(csvService: CsvService);
    create(userId: number, dto: GoalDto): Promise<any>;
    findAll(userId: number): Promise<any[]>;
    updateAmount(userId: number, id: number, dto: UpdateGoalAmountDto): Promise<any>;
    remove(userId: number, id: number): Promise<{
        success: boolean;
    }>;
}
