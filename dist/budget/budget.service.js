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
exports.BudgetService = void 0;
const common_1 = require("@nestjs/common");
const csv_service_1 = require("../database/csv.service");
let BudgetService = class BudgetService {
    csvService;
    constructor(csvService) {
        this.csvService = csvService;
    }
    async create(userId, dto) {
        const budgets = await this.csvService.read('budgets');
        const existingIndex = budgets.findIndex((b) => b.userId === userId && b.category.toLowerCase() === dto.category.toLowerCase());
        if (existingIndex !== -1) {
            budgets[existingIndex].limitAmount = dto.limitAmount;
            budgets[existingIndex].updatedAt = new Date().toISOString();
            await this.csvService.write('budgets', budgets);
            return budgets[existingIndex];
        }
        else {
            const newBudget = {
                id: 0,
                userId,
                category: dto.category,
                limitAmount: dto.limitAmount,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const created = await this.csvService.append('budgets', newBudget);
            return created;
        }
    }
    async findAll(userId) {
        const budgets = await this.csvService.read('budgets');
        return budgets.filter((b) => b.userId === userId);
    }
    async remove(userId, id) {
        const budgets = await this.csvService.read('budgets');
        const filtered = budgets.filter((b) => !(b.id === id && b.userId === userId));
        if (filtered.length === budgets.length) {
            throw new common_1.NotFoundException('Bütçe limiti bulunamadı.');
        }
        await this.csvService.write('budgets', filtered);
        return { success: true };
    }
};
exports.BudgetService = BudgetService;
exports.BudgetService = BudgetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [csv_service_1.CsvService])
], BudgetService);
//# sourceMappingURL=budget.service.js.map