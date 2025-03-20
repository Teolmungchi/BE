import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFeedDto {
  @ApiProperty({
    description: '피드(게시글) 제목',
    example: '생성할 피드(게시글) 제목.',
  })
  @IsNotEmpty({ message: '피드(게시글) 제목은 비어있을 수 없습니다.' })
  title: string;

  @ApiProperty({
    description: '피드(게시글) 내용',
    example: '생성할 피드(게시글) 내용.',
  })
  @IsNotEmpty({ message: '피드(게시글) 내용은 비어있을 수 없습니다.' })
  content: string;

  @ApiProperty({
    description: '이미지 URL (presigned URL로 업로드 후 얻은 값)',
    example: 'https://minio.example.com/bucket/1616161616_abcd',
    required: false,
  })
  @IsOptional()
  imageUrl?: string;
}