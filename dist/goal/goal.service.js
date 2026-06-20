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
exports.GoalService = void 0;
const common_1 = require("@nestjs/common");
const csv_service_1 = require("../database/csv.service");
let GoalService = class GoalService {
    csvService;
    constructor(csvService) {
        this.csvService = csvService;
    }
    async create(userId, dto) {
        const newGoal = {
            id: 0,
            userId,
            name: dto.name,
            targetAmount: dto.targetAmount,
            currentAmount: dto.currentAmount || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const created = await this.csvService.append('goals', newGoal);
        return created;
    }
    async findAll(userId) {
        const goals = await this.csvService.read('goals');
        return goals.filter((g) => g.userId === userId);
    }
    async updateAmount(userId, id, dto) {
        const goals = await this.csvService.read('goals');
        const idx = goals.findIndex((g) => g.id === id && g.userId === userId);
        if (idx === -1) {
            throw new common_1.NotFoundException('Birikim hedefi bulunamadı.');
        }
        goals[idx].currentAmount = dto.currentAmount;
        goals[idx].updatedAt = new Date().toISOString();
        await this.csvService.write('goals', goals);
        return goals[idx];
    }
    async remove(userId, id) {
        const goals = await this.csvService.read('goals');
        const filtered = goals.filter((g) => !(g.id === id && g.userId === userId));
        if (filtered.length === goals.length) {
            throw new common_1.NotFoundException('Birikim hedefi bulunamadı.');
        }
        await this.csvService.write('goals', filtered);
        return { success: true };
    }
};
exports.GoalService = GoalService;
exports.GoalService = GoalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [csv_service_1.CsvService])
], GoalService);
//# sourceMappingURL=goal.service.js.map