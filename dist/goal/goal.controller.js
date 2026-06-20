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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalController = void 0;
const common_1 = require("@nestjs/common");
const goal_service_1 = require("./goal.service");
const goal_dto_1 = require("./dto/goal.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
let GoalController = class GoalController {
    goalService;
    constructor(goalService) {
        this.goalService = goalService;
    }
    create(userId, dto) {
        return this.goalService.create(userId, dto);
    }
    findAll(userId) {
        return this.goalService.findAll(userId);
    }
    updateAmount(userId, id, dto) {
        return this.goalService.updateAmount(userId, id, dto);
    }
    remove(userId, id) {
        return this.goalService.remove(userId, id);
    }
};
exports.GoalController = GoalController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, goal_dto_1.GoalDto]),
    __metadata("design:returntype", void 0)
], GoalController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GoalController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(':id/amount'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, goal_dto_1.UpdateGoalAmountDto]),
    __metadata("design:returntype", void 0)
], GoalController.prototype, "updateAmount", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], GoalController.prototype, "remove", null);
exports.GoalController = GoalController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('goals'),
    __metadata("design:paramtypes", [goal_service_1.GoalService])
], GoalController);
//# sourceMappingURL=goal.controller.js.map