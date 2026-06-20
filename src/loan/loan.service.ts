import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CsvService } from '../database/csv.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { PayLoanDto } from './dto/pay-loan.dto';
import { TransactionType } from '../database/types';
import { Decimal } from 'decimal.js';

@Injectable()
export class LoanService {
  constructor(private csvService: CsvService) {}

  async create(userId: number, dto: CreateLoanDto) {
    const P = new Decimal(dto.totalAmount);
    const ratePercent = new Decimal(dto.interestRate);
    const n = dto.termMonths;

    let monthlyPayment: Decimal;
    if (ratePercent.isZero()) {
      monthlyPayment = P.div(n);
    } else {
      const r = ratePercent.div(100);
      const onePlusR = r.plus(1);
      const pow = onePlusR.pow(n);
      const numerator = r.mul(pow);
      const denominator = pow.minus(1);
      monthlyPayment = P.mul(numerator.div(denominator));
    }

    const roundedPayment = monthlyPayment.toDecimalPlaces(4).toNumber();

    return this.csvService.runTransaction(async () => {
      // 1. Eğer hesap belirtilmişse, kredi tutarını bu hesaba yatır
      if (dto.accountId) {
        const accounts = await this.csvService.read<any>('accounts');
        const accountIndex = accounts.findIndex(
          (acc) => acc.id === dto.accountId && acc.userId === userId,
        );

        if (accountIndex === -1) {
          throw new NotFoundException(
            'Kredi ödemesinin yatırılacağı hesap bulunamadı.',
          );
        }

        // Hesap bakiyesini artır
        const account = accounts[accountIndex];
        const accountBalanceDec = new Decimal(account.balance);
        account.balance = accountBalanceDec.plus(dto.totalAmount).toNumber();
        await this.csvService.write('accounts', accounts);

        // Gelir kaydı oluştur
        await this.csvService.append<any>('transactions', {
          id: 0,
          userId,
          accountId: dto.accountId,
          category: 'Kredi Girişi',
          amount: dto.totalAmount,
          type: TransactionType.INCOME,
          description: `${dto.name} Kredi Payout`,
          date: dto.startDate ? new Date(dto.startDate) : new Date(),
          toAccountId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Krediyi oluştur
      const newLoan = await this.csvService.append<any>('loans', {
        id: 0,
        userId,
        name: dto.name,
        totalAmount: dto.totalAmount,
        paidAmount: 0.0,
        interestRate: dto.interestRate,
        termMonths: dto.termMonths,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        monthlyPayment: roundedPayment,
        remainingInstallments: dto.termMonths,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return newLoan;
    });
  }

  async findAll(userId: number) {
    const loans = await this.csvService.read<any>('loans');
    return loans
      .filter((loan) => loan.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async findOne(userId: number, id: number) {
    const loans = await this.csvService.read<any>('loans');
    const loan = loans.find((l) => l.id === id && l.userId === userId);

    if (!loan) {
      throw new NotFoundException('Kredi bulunamadı.');
    }

    return loan;
  }

  async payInstallment(userId: number, id: number, dto: PayLoanDto) {
    return this.csvService.runTransaction(async () => {
      // 1. Krediyi oku ve doğrula
      const loans = await this.csvService.read<any>('loans');
      const loanIndex = loans.findIndex(
        (l) => l.id === id && l.userId === userId,
      );

      if (loanIndex === -1) {
        throw new NotFoundException('Kredi bulunamadı.');
      }

      const loan = loans[loanIndex];

      if (loan.remainingInstallments <= 0) {
        throw new BadRequestException(
          'Bu kredinin tüm taksitleri zaten ödenmiştir.',
        );
      }

      // 2. Hesabı oku ve doğrula
      const accounts = await this.csvService.read<any>('accounts');
      const accountIndex = accounts.findIndex(
        (acc) => acc.id === dto.accountId && acc.userId === userId,
      );

      if (accountIndex === -1) {
        throw new NotFoundException('Ödemenin yapılacağı hesap bulunamadı.');
      }

      const account = accounts[accountIndex];
      const accountBalanceDec = new Decimal(account.balance);

      const totalAmountDec = new Decimal(loan.totalAmount);
      const paidAmountDec = new Decimal(loan.paidAmount);
      const remainingBalance = totalAmountDec.minus(paidAmountDec);

      // Ödeme tutarını belirle
      let paymentAmount = dto.amount
        ? new Decimal(dto.amount)
        : new Decimal(loan.monthlyPayment);

      // Fazla ödeme yapılmasını engelle
      if (paymentAmount.gt(remainingBalance)) {
        paymentAmount = remainingBalance;
      }

      if (paymentAmount.lte(0)) {
        throw new BadRequestException('Ödeme tutarı sıfırdan büyük olmalıdır.');
      }

      // Hesap bakiyesini düş
      account.balance = accountBalanceDec.minus(paymentAmount).toNumber();
      await this.csvService.write('accounts', accounts);

      // Gider işlemi oluştur
      await this.csvService.append<any>('transactions', {
        id: 0,
        userId,
        accountId: dto.accountId,
        category: 'Kredi Ödemesi',
        amount: paymentAmount.toNumber(),
        type: TransactionType.EXPENSE,
        description: `${loan.name} taksit ödemesi`,
        date: new Date(),
        toAccountId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Krediyi güncelle
      loan.paidAmount = paidAmountDec.plus(paymentAmount).toNumber();
      loan.remainingInstallments = loan.remainingInstallments - 1;
      if (
        loan.remainingInstallments < 0 ||
        new Decimal(loan.paidAmount).gte(totalAmountDec)
      ) {
        loan.remainingInstallments = 0;
      }
      loan.updatedAt = new Date();

      await this.csvService.write('loans', loans);

      return loan;
    });
  }

  async remove(userId: number, id: number) {
    const loans = await this.csvService.read<any>('loans');
    const index = loans.findIndex(
      (loan) => loan.id === id && loan.userId === userId,
    );

    if (index === -1) {
      throw new NotFoundException('Kredi bulunamadı.');
    }

    const [deletedLoan] = loans.splice(index, 1);
    await this.csvService.write('loans', loans);

    return deletedLoan;
  }
}
