import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class TransactionController {
    private readonly transactionService;
    constructor(transactionService: TransactionService);
    create(userId: number, dto: CreateTransactionDto): Promise<any>;
    findAll(userId: number): Promise<any[]>;
    findOne(userId: number, id: number): Promise<any>;
    remove(userId: number, id: number): Promise<any>;
}
