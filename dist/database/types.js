"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionType = exports.AccountType = void 0;
var AccountType;
(function (AccountType) {
    AccountType["CASH"] = "CASH";
    AccountType["BANK"] = "BANK";
    AccountType["CRYPTO"] = "CRYPTO";
    AccountType["STOCK"] = "STOCK";
})(AccountType || (exports.AccountType = AccountType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["INCOME"] = "INCOME";
    TransactionType["EXPENSE"] = "EXPENSE";
    TransactionType["TRANSFER"] = "TRANSFER";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
//# sourceMappingURL=types.js.map