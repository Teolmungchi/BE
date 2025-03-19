import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateFeedDto {
  @ApiProperty({
    description: '피드(게시글) 제목',
    example: '수정할 제목',
    required: false,
  })
  @IsOptional()
  title: string;

  @ApiProperty({
    description: '피드(게시글) 내용',
    example: '수정할 컨텐츠 내용',
    required: false,
  })
  @IsOptional()
  content: string;

  @ApiProperty({
    description: '이미지 URL (presigned URL로 업로드 후 얻은 값)',
    example: 'https://minio.example.com/bucket/1616161616_abcd',
    required: false,
  })
  @IsOptional()
  imageUrl?: string;
}