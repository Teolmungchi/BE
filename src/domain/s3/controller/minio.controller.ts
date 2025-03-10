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
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Presigned URL 반환 성공' })
  @Get('upload/:fileName')
  @UseGuards(JwtAuthGuard)
  async getUploadUrl(): Promise<ResponseDto<any>> {
    const url = await this.minioService.getPresignedUrlForUpload();

    return ResponseDto.ok(url);
  }

  @ApiOperation({ summary: 'S3 Presigned URL (다운로드)' })
  @Get('download/:fileName')
  async getDownloadUrl(
    @Param('fileName') fileName: string,
  ): Promise<ResponseDto<any>> {
    const url = await this.minioService.getPresignedUrlForDownload(fileName);

    return ResponseDto.ok(url);
  }
}
