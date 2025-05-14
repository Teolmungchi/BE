import { MatchingStatus } from '../entity/matching-status.enum';

export class MatchingResultDto {
  feedId: number;
  similarity: number;
  status: MatchingStatus;
}
