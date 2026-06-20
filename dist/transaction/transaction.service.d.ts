import { CsvService } from '../database/csv.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class TransactionService {
    private csvService;
    constructor(csvService: CsvService);
    create(userId: number, dto: CreateTransactionDto): Promise<any>;
    findAll(userId: number): Promise<any[]>;
    findOne(userId: number, id: number): Promise<any>;
    remove(userId: number, id: number): Promise<any>;
}
