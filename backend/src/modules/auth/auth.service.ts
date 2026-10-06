import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto.js';
import { TokenResponseDto } from './dto/token-response.dto.js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const { email, password } = loginDto;

    // Busca o usuário e suas informações importantes relacionadas
    const user = await this.prisma.extended.user.findFirst({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Usuário inativo');
    }

    // Proteção contra brute force: Verifica se a conta está bloqueada
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(
        'Conta temporariamente bloqueada devido a muitas tentativas inválidas',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Incrementar tentativas de login
      const attempts = user.loginAttempts + 1;
      let lockedUntil = null;
      if (attempts >= 5) {
        // Bloqueia por 15 minutos
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      
      await this.prisma.extended.user.update({
        where: { id: user.id },
        data: { loginAttempts: attempts, lockedUntil },
      });

      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    // Login com sucesso, resetamos as tentativas de falha
    await this.prisma.extended.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Mapeia todas as permissões para um array simples (ex: ['properties.create', 'billing.read'])
    const permissions = user.role.rolePermissions.map(
      (rp) => rp.permission.code,
    );

    // Gera os tokens (Access Token e Refresh Token)
    return this.generateTokens(user, permissions);
  }

  private async generateTokens(
    user: any,
    permissions: string[],
  ): Promise<TokenResponseDto> {
    // Payload do JWT de curta duração
    const payload = {
      sub: user.id,
      org: user.organizationId,
      role: user.roleId,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);

    // Gera um hash aleatório para o refresh token
    const refreshTokenPlain = uuidv4();
    const refreshTokenHash = await bcrypt.hash(refreshTokenPlain, 10);

    const expiresInString = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRES_IN',
      '7d',
    );
    // Assumindo 7 dias como padrão
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 

    // Salva o Refresh Token no banco de dados, atrelado ao usuário
    await this.prisma.extended.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      // Retornamos o plain apenas na criação para o cliente armazenar, depois não temos mais acesso a ele
      refreshToken: refreshTokenPlain,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId,
        roleId: user.roleId,
        permissions,
      },
    };
  }

  // TODO: Criar a lógica do Refresh Token e de Logout depois (RF-AUTH-03, RF-AUTH-04)
}

