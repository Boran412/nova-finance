import { AccountType } from '../../database/types';
export declare class CreateAccountDto {
    name: string;
    type: AccountType;
    balance?: number;
    currency?: string;
}
