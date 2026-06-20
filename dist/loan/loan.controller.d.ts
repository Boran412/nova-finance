import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { PayLoanDto } from './dto/pay-loan.dto';
export declare class LoanController {
    private readonly loanService;
    constructor(loanService: LoanService);
    create(userId: number, dto: CreateLoanDto): Promise<any>;
    findAll(userId: number): Promise<any[]>;
    findOne(userId: number, id: number): Promise<any>;
    payInstallment(userId: number, id: number, dto: PayLoanDto): Promise<any>;
    remove(userId: number, id: number): Promise<any>;
}
