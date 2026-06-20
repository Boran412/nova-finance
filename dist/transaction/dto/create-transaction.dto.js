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
exports.CreateTransactionDto = void 0;
const class_validator_1 = require("class-validator");
const types_1 = require("../../database/types");
class CreateTransactionDto {
    accountId;
    category;
    amount;
    type;
    description;
    date;
    toAccountId;
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Hesap ID geçerli bir tam sayı olmalıdır.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Hesap ID boş bırakılamaz.' }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "accountId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Kategori boş bırakılamaz.' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Miktar sayısal bir değer olmalıdır.' }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(types_1.TransactionType, { message: 'Geçersiz işlem türü. INCOME, EXPENSE veya TRANSFER olmalıdır.' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type === types_1.TransactionType.TRANSFER),
    (0, class_validator_1.IsInt)({ message: 'Hedef hesap ID geçerli bir tam sayı olmalıdır.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Transfer işlemi için hedef hesap belirtilmelidir.' }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "toAccountId", void 0);
//# sourceMappingURL=create-transaction.dto.js.map