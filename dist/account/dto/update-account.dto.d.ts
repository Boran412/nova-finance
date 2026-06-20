import { AccountType } from '../../database/types';
export declare class UpdateAccountDto {
    name?: string;
    type?: AccountType;
    balance?: number;
    currency?: string;
}
