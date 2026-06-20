"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanService = void 0;
const common_1 = require("@nestjs/common");
const csv_service_1 = require("../database/csv.service");
const types_1 = require("../database/types");
const decimal_js_1 = require("decimal.js");
let LoanService = class LoanService {
    csvService;
    constructor(csvService) {
        this.csvService = csvService;
    }
    async create(userId, dto) {
        const P = new decimal_js_1.Decimal(dto.totalAmount);
        const ratePercent = new decimal_js_1.Decimal(dto.interestRate);
        const n = dto.termMonths;
        let monthlyPayment;
        if (ratePercent.isZero()) {
            monthlyPayment = P.div(n);
        }
        else {
            const r = ratePercent.div(100);
            const onePlusR = r.plus(1);
            const pow = onePlusR.pow(n);
            const numerator = r.mul(pow);
            const denominator = pow.minus(1);
            monthlyPayment = P.mul(numerator.div(denominator));
        }
        const roundedPayment = monthlyPayment.toDecimalPlaces(4).toNumber();
        return this.csvService.runTransaction(async () => {
            if (dto.accountId) {
                const accounts = await this.csvService.read('accounts');
                const accountIndex = accounts.findIndex((acc) => acc.id === dto.accountId && acc.userId === userId);
                if (accountIndex === -1) {
                    throw new common_1.NotFoundException('Kredi ödemesinin yatırılacağı hesap bulunamadı.');
                }
                const account = accounts[accountIndex];
                const accountBalanceDec = new decimal_js_1.Decimal(account.balance);
                account.balance = accountBalanceDec.plus(dto.totalAmount).toNumber();
                await this.csvService.write('accounts', accounts);
                await this.csvService.append('transactions', {
                    id: 0,
                    userId,
                    accountId: dto.accountId,
                    category: 'Kredi Girişi',
                    amount: dto.totalAmount,
                    type: types_1.TransactionType.INCOME,
                    description: `${dto.name} Kredi Payout`,
                    date: dto.startDate ? new Date(dto.startDate) : new Date(),
                    toAccountId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
            const newLoan = await this.csvService.append('loans', {
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
    async findAll(userId) {
        const loans = await this.csvService.read('loans');
        return loans
            .filter((loan) => loan.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async findOne(userId, id) {
        const loans = await this.csvService.read('loans');
        const loan = loans.find((l) => l.id === id && l.userId === userId);
        if (!loan) {
            throw new common_1.NotFoundException('Kredi bulunamadı.');
        }
        return loan;
    }
    async payInstallment(userId, id, dto) {
        return this.csvService.runTransaction(async () => {
            const loans = await this.csvService.read('loans');
            const loanIndex = loans.findIndex((l) => l.id === id && l.userId === userId);
            if (loanIndex === -1) {
                throw new common_1.NotFoundException('Kredi bulunamadı.');
            }
            const loan = loans[loanIndex];
            if (loan.remainingInstallments <= 0) {
                throw new common_1.BadRequestException('Bu kredinin tüm taksitleri zaten ödenmiştir.');
            }
            const accounts = await this.csvService.read('accounts');
            const accountIndex = accounts.findIndex((acc) => acc.id === dto.accountId && acc.userId === userId);
            if (accountIndex === -1) {
                throw new common_1.NotFoundException('Ödemenin yapılacağı hesap bulunamadı.');
            }
            const account = accounts[accountIndex];
            const accountBalanceDec = new decimal_js_1.Decimal(account.balance);
            const totalAmountDec = new decimal_js_1.Decimal(loan.totalAmount);
            const paidAmountDec = new decimal_js_1.Decimal(loan.paidAmount);
            const remainingBalance = totalAmountDec.minus(paidAmountDec);
            let paymentAmount = dto.amount ? new decimal_js_1.Decimal(dto.amount) : new decimal_js_1.Decimal(loan.monthlyPayment);
            if (paymentAmount.gt(remainingBalance)) {
                paymentAmount = remainingBalance;
            }
            if (paymentAmount.lte(0)) {
                throw new common_1.BadRequestException('Ödeme tutarı sıfırdan büyük olmalıdır.');
            }
            account.balance = accountBalanceDec.minus(paymentAmount).toNumber();
            await this.csvService.write('accounts', accounts);
            await this.csvService.append('transactions', {
                id: 0,
                userId,
                accountId: dto.accountId,
                category: 'Kredi Ödemesi',
                amount: paymentAmount.toNumber(),
                type: types_1.TransactionType.EXPENSE,
                description: `${loan.name} taksit ödemesi`,
                date: new Date(),
                toAccountId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            loan.paidAmount = paidAmountDec.plus(paymentAmount).toNumber();
            loan.remainingInstallments = loan.remainingInstallments - 1;
            if (loan.remainingInstallments < 0 || new decimal_js_1.Decimal(loan.paidAmount).gte(totalAmountDec)) {
                loan.remainingInstallments = 0;
            }
            loan.updatedAt = new Date();
            await this.csvService.write('loans', loans);
            return loan;
        });
    }
    async remove(userId, id) {
        const loans = await this.csvService.read('loans');
        const index = loans.findIndex((loan) => loan.id === id && loan.userId === userId);
        if (index === -1) {
            throw new common_1.NotFoundException('Kredi bulunamadı.');
        }
        const [deletedLoan] = loans.splice(index, 1);
        await this.csvService.write('loans', loans);
        return deletedLoan;
    }
};
exports.LoanService = LoanService;
exports.LoanService = LoanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [csv_service_1.CsvService])
], LoanService);
//# sourceMappingURL=loan.service.js.map