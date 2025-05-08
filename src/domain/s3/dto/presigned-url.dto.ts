import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlDto {
  @ApiProperty({
    example: 'http://localhost:9000/nestjs-bucket/1596445630123-myfile.jpg?...',
    description: 'Presigned URL입니다.',
  })
  url: string;
  fileName: string;
  expiration: number; // 초 단위

  static of(data: { url: string; fileName: string; expiration: number }): PresignedUrlDto {
    const dto = new PresignedUrlDto();
    dto.url = data.url;
    dto.fileName = data.fileName;
    dto.expiration = data.expiration;
    return dto;
  }
}
