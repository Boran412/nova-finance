import { Injectable, NotFoundException } from '@nestjs/common';
import { CsvService } from '../database/csv.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountService {
  constructor(private csvService: CsvService) {}

  async create(userId: number, dto: CreateAccountDto) {
    return this.csvService.append<any>('accounts', {
      id: 0,
      userId,
      name: dto.name,
      type: dto.type,
      balance: dto.balance !== undefined ? dto.balance : 0.0,
      currency: dto.currency || 'TRY',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findAll(userId: number) {
    const accounts = await this.csvService.read<any>('accounts');
    return accounts
      .filter((acc) => acc.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async findOne(userId: number, id: number) {
    const accounts = await this.csvService.read<any>('accounts');
    const account = accounts.find(
      (acc) => acc.id === id && acc.userId === userId,
    );

    if (!account) {
      throw new NotFoundException('Hesap bulunamadı.');
    }

    return account;
  }

  async update(userId: number, id: number, dto: UpdateAccountDto) {
    const accounts = await this.csvService.read<any>('accounts');
    const index = accounts.findIndex(
      (acc) => acc.id === id && acc.userId === userId,
    );

    if (index === -1) {
      throw new NotFoundException('Hesap bulunamadı.');
    }

    const updatedAccount = {
      ...accounts[index],
      ...dto,
      updatedAt: new Date(),
    };

    accounts[index] = updatedAccount;
    await this.csvService.write('accounts', accounts);
    return updatedAccount;
  }

  async remove(userId: number, id: number) {
    const accounts = await this.csvService.read<any>('accounts');
    const index = accounts.findIndex(
      (acc) => acc.id === id && acc.userId === userId,
    );

    if (index === -1) {
      throw new NotFoundException('Hesap bulunamadı.');
    }

    const [deletedAccount] = accounts.splice(index, 1);
    await this.csvService.write('accounts', accounts);

    // İlişkili işlemleri temizle (Cascade delete taklidi)
    const transactions = await this.csvService.read<any>('transactions');
    const remainingTransactions = transactions.filter(
      (tx) => tx.accountId !== id && tx.toAccountId !== id,
    );
    if (transactions.length !== remainingTransactions.length) {
      await this.csvService.write('transactions', remainingTransactions);
    }

    return deletedAccount;
  }
}
