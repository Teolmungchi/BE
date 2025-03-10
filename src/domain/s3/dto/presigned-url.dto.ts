import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlDto {
  @ApiProperty({
    example: 'http://localhost:9000/nestjs-bucket/1596445630123-myfile.jpg?...',
    description: 'Presigned URL입니다.',
  })
  url: string;

  static of(url: string): PresignedUrlDto {
    const dto = new PresignedUrlDto();
    dto.url = url;
    return dto;
  }
}