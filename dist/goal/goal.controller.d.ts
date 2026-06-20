import { GoalService } from './goal.service';
import { GoalDto, UpdateGoalAmountDto } from './dto/goal.dto';
export declare class GoalController {
    private readonly goalService;
    constructor(goalService: GoalService);
    create(userId: number, dto: GoalDto): Promise<any>;
    findAll(userId: number): Promise<any[]>;
    updateAmount(userId: number, id: number, dto: UpdateGoalAmountDto): Promise<any>;
    remove(userId: number, id: number): Promise<{
        success: boolean;
    }>;
}
