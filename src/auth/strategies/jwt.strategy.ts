import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CsvService } from '../../database/csv.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private csvService: CsvService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallbackSecretKey123',
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const users = await this.csvService.read<any>('users');
    const user = users.find((u) => u.id === payload.sub);

    if (!user) {
      throw new UnauthorizedException('Geçersiz oturum');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
