import { Injectable, NotFoundException } from '@nestjs/common';
import { CsvService } from '../database/csv.service';
import { GoalDto, UpdateGoalAmountDto } from './dto/goal.dto';

@Injectable()
export class GoalService {
  constructor(private csvService: CsvService) {}

  async create(userId: number, dto: GoalDto) {
    const newGoal = {
      id: 0,
      userId,
      name: dto.name,
      targetAmount: dto.targetAmount,
      currentAmount: dto.currentAmount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const created = await this.csvService.append<any>('goals', newGoal);
    return created;
  }

  async findAll(userId: number) {
    const goals = await this.csvService.read<any>('goals');
    return goals.filter((g) => g.userId === userId);
  }

  async updateAmount(userId: number, id: number, dto: UpdateGoalAmountDto) {
    const goals = await this.csvService.read<any>('goals');
    const idx = goals.findIndex((g) => g.id === id && g.userId === userId);
    
    if (idx === -1) {
      throw new NotFoundException('Birikim hedefi bulunamadı.');
    }
    
    goals[idx].currentAmount = dto.currentAmount;
    goals[idx].updatedAt = new Date().toISOString();
    
    await this.csvService.write('goals', goals);
    return goals[idx];
  }

  async remove(userId: number, id: number) {
    const goals = await this.csvService.read<any>('goals');
    const filtered = goals.filter((g) => !(g.id === id && g.userId === userId));
    
    if (filtered.length === goals.length) {
      throw new NotFoundException('Birikim hedefi bulunamadı.');
    }
    
    await this.csvService.write('goals', filtered);
    return { success: true };
  }
}
