import {
  Controller,
  Get,
  Param, Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MinioService } from '../service/minio.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../global/common/guards/jwt-auth.guard';
import { ResponseInterceptor } from '../../../global/common/interceptor/response.interceptor';
import { HttpExceptionFilter } from '../../../global/exception/filter/http-exception.filter';
import { ResponseDto } from '../../../global/exception/dto/response.dto';
import { PresignedUrlDto } from '../dto/presigned-url.dto';

@ApiTags('S3 파일 업로드/다운로드')
@Controller('api/v1/s3')
@UseInterceptors(ResponseInterceptor)
@UseFilters(HttpExceptionFilter)
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @ApiOperation({ summary: 'S3 Presigned URL (업로드)' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL 반환 성공',
    schema: {
      example: {
        'httpStatus': 200,
        'success': true,
        'data': {
          'url': 'http://tmc.kro.kr:9000/tmc/1747372137008_8bb64d30?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=root%2F20250516%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250516T050857Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=b1a8ea33a706dd880cd420ce210897de225d4def678199054b0b6a85c34d5fe4',
          'fileName': '1747372137008_8bb64d30',
          'expiration': 3600,
        },
      },
    },

  })
  @ApiResponse({
    status: 401,
    description: 'JWT 토큰이 없거나 유효하지 않음',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @Get('upload')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getUploadUrl(
    @Query('extension') extension?: string, // 확장자 파라미터 추가 (선택)
  ): Promise<ResponseDto<PresignedUrlDto>> {
    const url = await this.minioService.getPresignedUrlForUpload(extension);
    return ResponseDto.ok(url);
  }

  @ApiOperation({ summary: 'S3 Presigned URL (다운로드)' })
  @ApiResponse({
    status: 400,
    description: 'URL 생성 실패',
    schema: {
      example: {
        success: false,
        error: '파일 다운로드 URL 생성에 실패했습니다.',
        statusCode: 500,
        message: '파일 다운로드 URL 생성에 실패했습니다.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'JWT 토큰이 없거나 유효하지 않음',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @Get('download/:fileName')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getDownloadUrl(
    @Param('fileName') fileName: string,
  ): Promise<ResponseDto<PresignedUrlDto>> {
    const url = await this.minioService.getPresignedUrlForDownload(fileName);
    return ResponseDto.ok(url);
  }
}
