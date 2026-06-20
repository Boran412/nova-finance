import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
export declare class AccountController {
    private readonly accountService;
    constructor(accountService: AccountService);
    create(userId: number, dto: CreateAccountDto): Promise<any>;
    findAll(userId: number): Promise<any[]>;
    findOne(userId: number, id: number): Promise<any>;
    update(userId: number, id: number, dto: UpdateAccountDto): Promise<any>;
    remove(userId: number, id: number): Promise<any>;
}
