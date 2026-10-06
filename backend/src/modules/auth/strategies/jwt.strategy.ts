import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extrai o token do cabeçalho de Autorização (Bearer <token>)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // A mesma chave secreta que usamos para assinar o token
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  // O NestJS passa automaticamente o payload validado aqui para este método
  async validate(payload: any) {
    // Isso injetará o objeto no req.user do Express
    return {
      sub: payload.sub,
      org: payload.org,
      role: payload.role,
      permissions: payload.permissions,
    };
  }
}

