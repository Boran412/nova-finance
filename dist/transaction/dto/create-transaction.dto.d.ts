import { TransactionType } from '../../database/types';
export declare class CreateTransactionDto {
    accountId: number;
    category: string;
    amount: number;
    type: TransactionType;
    description?: string;
    date?: string;
    toAccountId?: number;
}
