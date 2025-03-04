export class JwtTokenDto {
  accessToken: string;
  refreshToken: string;

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  static of(accessToken: string, refreshToken: string): JwtTokenDto {
    return new JwtTokenDto(accessToken, refreshToken);
  }
}
