import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CsvService } from '../database/csv.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from '../database/types';
import { Decimal } from 'decimal.js';

@Injectable()
export class TransactionService {
  constructor(private csvService: CsvService) {}

  async create(userId: number, dto: CreateTransactionDto) {
    const amountDecimal = new Decimal(dto.amount);
    if (amountDecimal.lte(0)) {
      throw new BadRequestException('İşlem miktarı sıfırdan büyük olmalıdır.');
    }

    return this.csvService.runTransaction(async () => {
      // 1. Hesapları oku ve kontrol et
      const accounts = await this.csvService.read<any>('accounts');
      const accountIndex = accounts.findIndex(
        (acc) => acc.id === dto.accountId && acc.userId === userId,
      );

      if (accountIndex === -1) {
        throw new NotFoundException('Kaynak hesap bulunamadı.');
      }

      const account = accounts[accountIndex];
      const accountBalanceDec = new Decimal(account.balance);

      // 2. İşlem türüne göre bakiyeleri güncelle
      if (dto.type === TransactionType.INCOME) {
        account.balance = accountBalanceDec.plus(amountDecimal).toNumber();
      } else if (dto.type === TransactionType.EXPENSE) {
        account.balance = accountBalanceDec.minus(amountDecimal).toNumber();
      } else if (dto.type === TransactionType.TRANSFER) {
        if (!dto.toAccountId) {
          throw new BadRequestException(
            'Transfer işlemi için hedef hesap belirtilmelidir.',
          );
        }
        if (dto.accountId === dto.toAccountId) {
          throw new BadRequestException(
            'Kaynak hesap ile hedef hesap aynı olamaz.',
          );
        }

        const toAccountIndex = accounts.findIndex(
          (acc) => acc.id === dto.toAccountId && acc.userId === userId,
        );
        if (toAccountIndex === -1) {
          throw new NotFoundException('Hedef hesap bulunamadı.');
        }

        const toAccount = accounts[toAccountIndex];
        const toAccountBalanceDec = new Decimal(toAccount.balance);

        account.balance = accountBalanceDec.minus(amountDecimal).toNumber();
        toAccount.balance = toAccountBalanceDec.plus(amountDecimal).toNumber();
      }

      // Güncellenen hesapları diske yaz
      await this.csvService.write('accounts', accounts);

      // 3. İşlem kaydını ekle
      const newTransaction = await this.csvService.append<any>('transactions', {
        id: 0,
        userId,
        accountId: dto.accountId,
        category: dto.category,
        amount: amountDecimal.toNumber(),
        type: dto.type,
        description: dto.description || null,
        date: dto.date ? new Date(dto.date) : new Date(),
        toAccountId:
          dto.type === TransactionType.TRANSFER ? dto.toAccountId : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return newTransaction;
    });
  }

  async findAll(userId: number) {
    const transactions = await this.csvService.read<any>('transactions');
    const accounts = await this.csvService.read<any>('accounts');

    return transactions
      .filter((tx) => tx.userId === userId)
      .map((tx) => {
        const account = accounts.find((acc) => acc.id === tx.accountId);
        const toAccount = tx.toAccountId
          ? accounts.find((acc) => acc.id === tx.toAccountId)
          : null;
        return {
          ...tx,
          account,
          toAccount,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async findOne(userId: number, id: number) {
    const transactions = await this.csvService.read<any>('transactions');
    const transaction = transactions.find(
      (tx) => tx.id === id && tx.userId === userId,
    );

    if (!transaction) {
      throw new NotFoundException('İşlem bulunamadı.');
    }

    const accounts = await this.csvService.read<any>('accounts');
    const account = accounts.find((acc) => acc.id === transaction.accountId);
    const toAccount = transaction.toAccountId
      ? accounts.find((acc) => acc.id === transaction.toAccountId)
      : null;

    return {
      ...transaction,
      account,
      toAccount,
    };
  }

  async remove(userId: number, id: number) {
    return this.csvService.runTransaction(async () => {
      const transactions = await this.csvService.read<any>('transactions');
      const txIndex = transactions.findIndex(
        (tx) => tx.id === id && tx.userId === userId,
      );

      if (txIndex === -1) {
        throw new NotFoundException('İşlem bulunamadı.');
      }

      const transaction = transactions[txIndex];
      const amountDecimal = new Decimal(transaction.amount);

      // Hesap bakiyelerini eski haline getir (revert)
      const accounts = await this.csvService.read<any>('accounts');
      const accountIndex = accounts.findIndex(
        (acc) => acc.id === transaction.accountId,
      );

      if (accountIndex !== -1) {
        const account = accounts[accountIndex];
        const accountBalanceDec = new Decimal(account.balance);

        if (transaction.type === TransactionType.INCOME) {
          account.balance = accountBalanceDec.minus(amountDecimal).toNumber();
        } else if (transaction.type === TransactionType.EXPENSE) {
          account.balance = accountBalanceDec.plus(amountDecimal).toNumber();
        } else if (transaction.type === TransactionType.TRANSFER) {
          account.balance = accountBalanceDec.plus(amountDecimal).toNumber();

          if (transaction.toAccountId) {
            const toAccountIndex = accounts.findIndex(
              (acc) => acc.id === transaction.toAccountId,
            );
            if (toAccountIndex !== -1) {
              const toAccount = accounts[toAccountIndex];
              const toAccountBalanceDec = new Decimal(toAccount.balance);
              toAccount.balance = toAccountBalanceDec
                .minus(amountDecimal)
                .toNumber();
            }
          }
        }
        await this.csvService.write('accounts', accounts);
      }

      // İşlemi sil
      const [deletedTx] = transactions.splice(txIndex, 1);
      await this.csvService.write('transactions', transactions);

      return deletedTx;
    });
  }
}
