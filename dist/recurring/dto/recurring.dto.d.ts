export declare class RecurringDto {
    accountId: number;
    category: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    description?: string;
    interval: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    nextExecutionDate: string;
}
