export class MatchingStatDto {
  constructor(partial: Partial<MatchingStatDto>) {
    Object.assign(this, partial);
  }
  month: string;
  success: number;
  fail: number;
}