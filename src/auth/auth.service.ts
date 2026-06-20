import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { CsvService } from '../database/csv.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private csvService: CsvService,
    private jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    const users = await this.csvService.read<any>('users');
    const existingUser = users.find((u) => u.email === dto.email);

    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = await this.csvService.append<any>('users', {
      id: 0,
      email: dto.email,
      password: hashedPassword,
      premiumStatus: false,
      defaultCurrency: dto.defaultCurrency || 'TRY',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.generateToken(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const users = await this.csvService.read<any>('users');
    const user = users.find((u) => u.email === dto.email);

    if (!user) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    return this.generateToken(user.id, user.email);
  }

  private generateToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
