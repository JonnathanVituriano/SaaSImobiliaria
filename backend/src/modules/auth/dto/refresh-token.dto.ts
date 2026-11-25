import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'O refresh token é obrigatório' })
  @IsString()
  refreshToken: string;
}
