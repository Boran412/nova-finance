import { Injectable, NotFoundException } from '@nestjs/common';
import { CsvService } from '../database/csv.service';
import { BudgetDto } from './dto/budget.dto';

@Injectable()
export class BudgetService {
  constructor(private csvService: CsvService) {}

  async create(userId: number, dto: BudgetDto) {
    const budgets = await this.csvService.read<any>('budgets');
    
    // Aynı kategori için daha önce bütçe limiti konulmuşsa güncelle, yoksa yeni oluştur
    const existingIndex = budgets.findIndex(
      (b) => b.userId === userId && b.category.toLowerCase() === dto.category.toLowerCase()
    );

    if (existingIndex !== -1) {
      budgets[existingIndex].limitAmount = dto.limitAmount;
      budgets[existingIndex].updatedAt = new Date().toISOString();
      await this.csvService.write('budgets', budgets);
      return budgets[existingIndex];
    } else {
      const newBudget = {
        id: 0,
        userId,
        category: dto.category,
        limitAmount: dto.limitAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const created = await this.csvService.append<any>('budgets', newBudget);
      return created;
    }
  }

  async findAll(userId: number) {
    const budgets = await this.csvService.read<any>('budgets');
    return budgets.filter((b) => b.userId === userId);
  }

  async remove(userId: number, id: number) {
    const budgets = await this.csvService.read<any>('budgets');
    const filtered = budgets.filter((b) => !(b.id === id && b.userId === userId));
    
    if (filtered.length === budgets.length) {
      throw new NotFoundException('Bütçe limiti bulunamadı.');
    }
    
    await this.csvService.write('budgets', filtered);
    return { success: true };
  }
}
