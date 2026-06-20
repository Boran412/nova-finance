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
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const csv_service_1 = require("../database/csv.service");
const types_1 = require("../database/types");
const decimal_js_1 = require("decimal.js");
let TransactionService = class TransactionService {
    csvService;
    constructor(csvService) {
        this.csvService = csvService;
    }
    async create(userId, dto) {
        const amountDecimal = new decimal_js_1.Decimal(dto.amount);
        if (amountDecimal.lte(0)) {
            throw new common_1.BadRequestException('İşlem miktarı sıfırdan büyük olmalıdır.');
        }
        return this.csvService.runTransaction(async () => {
            const accounts = await this.csvService.read('accounts');
            const accountIndex = accounts.findIndex((acc) => acc.id === dto.accountId && acc.userId === userId);
            if (accountIndex === -1) {
                throw new common_1.NotFoundException('Kaynak hesap bulunamadı.');
            }
            const account = accounts[accountIndex];
            const accountBalanceDec = new decimal_js_1.Decimal(account.balance);
            if (dto.type === types_1.TransactionType.INCOME) {
                account.balance = accountBalanceDec.plus(amountDecimal).toNumber();
            }
            else if (dto.type === types_1.TransactionType.EXPENSE) {
                account.balance = accountBalanceDec.minus(amountDecimal).toNumber();
            }
            else if (dto.type === types_1.TransactionType.TRANSFER) {
                if (!dto.toAccountId) {
                    throw new common_1.BadRequestException('Transfer işlemi için hedef hesap belirtilmelidir.');
                }
                if (dto.accountId === dto.toAccountId) {
                    throw new common_1.BadRequestException('Kaynak hesap ile hedef hesap aynı olamaz.');
                }
                const toAccountIndex = accounts.findIndex((acc) => acc.id === dto.toAccountId && acc.userId === userId);
                if (toAccountIndex === -1) {
                    throw new common_1.NotFoundException('Hedef hesap bulunamadı.');
                }
                const toAccount = accounts[toAccountIndex];
                const toAccountBalanceDec = new decimal_js_1.Decimal(toAccount.balance);
                account.balance = accountBalanceDec.minus(amountDecimal).toNumber();
                toAccount.balance = toAccountBalanceDec.plus(amountDecimal).toNumber();
            }
            await this.csvService.write('accounts', accounts);
            const newTransaction = await this.csvService.append('transactions', {
                id: 0,
                userId,
                accountId: dto.accountId,
                category: dto.category,
                amount: amountDecimal.toNumber(),
                type: dto.type,
                description: dto.description || null,
                date: dto.date ? new Date(dto.date) : new Date(),
                toAccountId: dto.type === types_1.TransactionType.TRANSFER ? dto.toAccountId : null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            return newTransaction;
        });
    }
    async findAll(userId) {
        const transactions = await this.csvService.read('transactions');
        const accounts = await this.csvService.read('accounts');
        return transactions
            .filter((tx) => tx.userId === userId)
            .map((tx) => {
            const account = accounts.find((acc) => acc.id === tx.accountId);
            const toAccount = tx.toAccountId ? accounts.find((acc) => acc.id === tx.toAccountId) : null;
            return {
                ...tx,
                account,
                toAccount,
            };
        })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    async findOne(userId, id) {
        const transactions = await this.csvService.read('transactions');
        const transaction = transactions.find((tx) => tx.id === id && tx.userId === userId);
        if (!transaction) {
            throw new common_1.NotFoundException('İşlem bulunamadı.');
        }
        const accounts = await this.csvService.read('accounts');
        const account = accounts.find((acc) => acc.id === transaction.accountId);
        const toAccount = transaction.toAccountId ? accounts.find((acc) => acc.id === transaction.toAccountId) : null;
        return {
            ...transaction,
            account,
            toAccount,
        };
    }
    async remove(userId, id) {
        return this.csvService.runTransaction(async () => {
            const transactions = await this.csvService.read('transactions');
            const txIndex = transactions.findIndex((tx) => tx.id === id && tx.userId === userId);
            if (txIndex === -1) {
                throw new common_1.NotFoundException('İşlem bulunamadı.');
            }
            const transaction = transactions[txIndex];
            const amountDecimal = new decimal_js_1.Decimal(transaction.amount);
            const accounts = await this.csvService.read('accounts');
            const accountIndex = accounts.findIndex((acc) => acc.id === transaction.accountId);
            if (accountIndex !== -1) {
                const account = accounts[accountIndex];
                const accountBalanceDec = new decimal_js_1.Decimal(account.balance);
                if (transaction.type === types_1.TransactionType.INCOME) {
                    account.balance = accountBalanceDec.minus(amountDecimal).toNumber();
                }
                else if (transaction.type === types_1.TransactionType.EXPENSE) {
                    account.balance = accountBalanceDec.plus(amountDecimal).toNumber();
                }
                else if (transaction.type === types_1.TransactionType.TRANSFER) {
                    account.balance = accountBalanceDec.plus(amountDecimal).toNumber();
                    if (transaction.toAccountId) {
                        const toAccountIndex = accounts.findIndex((acc) => acc.id === transaction.toAccountId);
                        if (toAccountIndex !== -1) {
                            const toAccount = accounts[toAccountIndex];
                            const toAccountBalanceDec = new decimal_js_1.Decimal(toAccount.balance);
                            toAccount.balance = toAccountBalanceDec.minus(amountDecimal).toNumber();
                        }
                    }
                }
                await this.csvService.write('accounts', accounts);
            }
            const [deletedTx] = transactions.splice(txIndex, 1);
            await this.csvService.write('transactions', transactions);
            return deletedTx;
        });
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [csv_service_1.CsvService])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map