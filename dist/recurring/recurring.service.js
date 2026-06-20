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
exports.RecurringService = void 0;
const common_1 = require("@nestjs/common");
const csv_service_1 = require("../database/csv.service");
let RecurringService = class RecurringService {
    csvService;
    constructor(csvService) {
        this.csvService = csvService;
    }
    async create(userId, dto) {
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
        return this.csvService.append('recurring', newRecurring);
    }
    async findAllAndTrigger(userId) {
        const recurringList = await this.csvService.read('recurring');
        const transactions = await this.csvService.read('transactions');
        const accounts = await this.csvService.read('accounts');
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
                    }
                    else {
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
                }
                else if (rec.interval === 'MONTHLY') {
                    nextExec.setMonth(nextExec.getMonth() + 1);
                }
                else if (rec.interval === 'YEARLY') {
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
    async remove(userId, id) {
        const recurringList = await this.csvService.read('recurring');
        const filtered = recurringList.filter((r) => !(r.id === id && r.userId === userId));
        if (filtered.length === recurringList.length) {
            throw new common_1.NotFoundException('Otomatik işlem talimatı bulunamadı.');
        }
        await this.csvService.write('recurring', filtered);
        return { success: true };
    }
};
exports.RecurringService = RecurringService;
exports.RecurringService = RecurringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [csv_service_1.CsvService])
], RecurringService);
//# sourceMappingURL=recurring.service.js.map