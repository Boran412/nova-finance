import { Injectable, NotFoundException } from '@nestjs/common';
import { CsvService } from '../database/csv.service';
import { RecurringDto } from './dto/recurring.dto';

@Injectable()
export class RecurringService {
  constructor(private csvService: CsvService) {}

  async create(userId: number, dto: RecurringDto) {
    const newRecurring = {
      id: 0,
      userId,
      accountId: dto.accountId,
      category: dto.category,
      amount: dto.amount,
      type: dto.type,
      description: dto.description || '',
      interval: dto.interval,
      nextExecutionDate: new Date(dto.nextExecutionDate).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.csvService.append<any>('recurring', newRecurring);
  }

  async findAllAndTrigger(userId: number) {
    const recurringList = await this.csvService.read<any>('recurring');
    const transactions = await this.csvService.read<any>('transactions');
    const accounts = await this.csvService.read<any>('accounts');

    const userRecurring = recurringList.filter((r) => r.userId === userId);
    let dbUpdated = false;
    const now = new Date();

    for (const rec of userRecurring) {
      let nextExec = new Date(rec.nextExecutionDate);

      while (nextExec <= now) {
        const account = accounts.find((a) => a.id === rec.accountId && a.userId === userId);
        if (account) {
          if (rec.type === 'INCOME') {
            account.balance = Number(account.balance) + Number(rec.amount);
          } else {
            account.balance = Number(account.balance) - Number(rec.amount);
          }
          account.updatedAt = now.toISOString();

          const maxTxId = transactions.reduce((max, t) => Math.max(max, t.id), 0);
          transactions.push({
            id: maxTxId + 1,
            userId,
            accountId: rec.accountId,
            category: rec.category,
            amount: rec.amount,
            type: rec.type,
            description: `${rec.description || 'Otomatik işlem'} (Otomatik İşlem)`,
            date: nextExec.toISOString(),
            toAccountId: null,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          });
        }

        if (rec.interval === 'WEEKLY') {
          nextExec.setDate(nextExec.getDate() + 7);
        } else if (rec.interval === 'MONTHLY') {
          nextExec.setMonth(nextExec.getMonth() + 1);
        } else if (rec.interval === 'YEARLY') {
          nextExec.setFullYear(nextExec.getFullYear() + 1);
        }

        rec.nextExecutionDate = nextExec.toISOString();
        rec.updatedAt = now.toISOString();
        dbUpdated = true;
      }
    }

    if (dbUpdated) {
      await this.csvService.write('accounts', accounts);
      await this.csvService.write('transactions', transactions);
      await this.csvService.write('recurring', recurringList);
    }

    return recurringList.filter((r) => r.userId === userId);
  }

  async remove(userId: number, id: number) {
    const recurringList = await this.csvService.read<any>('recurring');
    const filtered = recurringList.filter((r) => !(r.id === id && r.userId === userId));

    if (filtered.length === recurringList.length) {
      throw new NotFoundException('Otomatik işlem talimatı bulunamadı.');
    }

    await this.csvService.write('recurring', filtered);
    return { success: true };
  }
}
