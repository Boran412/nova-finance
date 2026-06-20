import { CsvService } from '../database/csv.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private csvService;
    private jwtService;
    constructor(csvService: CsvService, jwtService: JwtService);
    signUp(dto: SignUpDto): Promise<{
        accessToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
    }>;
    private generateToken;
}
