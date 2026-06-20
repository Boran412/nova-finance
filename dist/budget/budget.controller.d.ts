import { BudgetService } from './budget.service';
import { BudgetDto } from './dto/budget.dto';
export declare class BudgetController {
    private readonly budgetService;
    constructor(budgetService: BudgetService);
    create(userId: number, dto: BudgetDto): Promise<any>;
    findAll(userId: number): Promise<any[]>;
    remove(userId: number, id: number): Promise<{
        success: boolean;
    }>;
}
