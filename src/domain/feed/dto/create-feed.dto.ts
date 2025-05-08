import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Column } from 'typeorm';

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
  })
  @IsNotEmpty({ message: '사진은 한 장 이상 올리세요'})
  fileName?: string;

  @ApiProperty({
    description: '잃어버린 날짜',
    example: '2025-05-07',
    required: false,
  })
  @IsOptional()
  lostDate: Date;

  @ApiProperty({
    description: '잃어버린 장소)',
    example: '가천대학교 AI공학관',
    required: false,
  })
  @IsOptional()
  lostPlace: string;

  @ApiProperty({
    description: '잃어버린 장소 특징)',
    example: '정문에서 제일 멀어요',
    required: false,
  })
  @IsOptional()
  placeFeature: string;

  @ApiProperty({
    description: '반려동물 품종',
    example: '말티즈',
    required: false,
  })
  @IsOptional()
  dogType: string;

  @ApiProperty({
    description: '반려동물 나이',
    example: '7',
    required: false,
  })
  @IsOptional()
  dogAge: number;

  @ApiProperty({
    description: '반려동물 성별',
    example: '남자',
    required: false,
  })
  @IsOptional()
  dogGender: string;

  @ApiProperty({
    description: '반려동물 색깔',
    example: '흰색',
    required: false,
  })
  @IsOptional()
  dogColor: string;

  @ApiProperty({
    description: '반려동물 특징',
    example: '빨간색 목걸이를 하고 있어요',
    required: false,
  })
  @IsOptional()
  dogFeature: string;

}