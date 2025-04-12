import {
  Controller,
  Get,
  Param,
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
        httpStatus: 200,
        success: true,
        data: {
          url: 'http://localhost:9000/tmc/1744354182542_27999?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=root%2F20250411%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250411T064942Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=96f13378a43c2f2130be1929e6fb783fd971d776a70c6efedb241f590c76cac1',
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
  async getUploadUrl(): Promise<ResponseDto<any>> {
    const url = await this.minioService.getPresignedUrlForUpload();

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
  ): Promise<ResponseDto<any>> {
    const url = await this.minioService.getPresignedUrlForDownload(fileName);

    return ResponseDto.ok(url);
  }
}
