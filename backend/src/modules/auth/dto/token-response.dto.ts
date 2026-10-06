export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    organizationId: string;
    roleId: string;
    permissions: string[];
  };
}

