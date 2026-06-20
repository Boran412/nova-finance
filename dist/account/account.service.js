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
exports.AccountService = void 0;
const common_1 = require("@nestjs/common");
const csv_service_1 = require("../database/csv.service");
let AccountService = class AccountService {
    csvService;
    constructor(csvService) {
        this.csvService = csvService;
    }
    async create(userId, dto) {
        return this.csvService.append('accounts', {
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
    async findAll(userId) {
        const accounts = await this.csvService.read('accounts');
        return accounts
            .filter((acc) => acc.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async findOne(userId, id) {
        const accounts = await this.csvService.read('accounts');
        const account = accounts.find((acc) => acc.id === id && acc.userId === userId);
        if (!account) {
            throw new common_1.NotFoundException('Hesap bulunamadı.');
        }
        return account;
    }
    async update(userId, id, dto) {
        const accounts = await this.csvService.read('accounts');
        const index = accounts.findIndex((acc) => acc.id === id && acc.userId === userId);
        if (index === -1) {
            throw new common_1.NotFoundException('Hesap bulunamadı.');
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
    async remove(userId, id) {
        const accounts = await this.csvService.read('accounts');
        const index = accounts.findIndex((acc) => acc.id === id && acc.userId === userId);
        if (index === -1) {
            throw new common_1.NotFoundException('Hesap bulunamadı.');
        }
        const [deletedAccount] = accounts.splice(index, 1);
        await this.csvService.write('accounts', accounts);
        const transactions = await this.csvService.read('transactions');
        const remainingTransactions = transactions.filter((tx) => tx.accountId !== id && tx.toAccountId !== id);
        if (transactions.length !== remainingTransactions.length) {
            await this.csvService.write('transactions', remainingTransactions);
        }
        return deletedAccount;
    }
};
exports.AccountService = AccountService;
exports.AccountService = AccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [csv_service_1.CsvService])
], AccountService);
//# sourceMappingURL=account.service.js.map