export class JwtTokenDto {
  accessToken: string;
  refreshToken: string;
  userId: number;

  constructor(accessToken: string, refreshToken: string, userId: number) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.userId = userId;
  }

  static of(accessToken: string, refreshToken: string, userId: number): JwtTokenDto {
    return new JwtTokenDto(accessToken, refreshToken, userId);
  }
}
