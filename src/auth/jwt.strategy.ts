import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload); // This should log the payload including 'sub'

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub }, // 'sub' contains the user ID in the JWT payload
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return the user object with the correct properties
    return { id: user.id, email: user.email, role: user.role };
  }
}
