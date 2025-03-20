import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { Client } from 'minio';
import { CommonException } from '../../../global/exception/common-exception';
import { ErrorCode } from '../../../global/exception/error-code';
import { ResponseDto } from '../../../global/exception/dto/response.dto';
import { PresignedUrlDto } from '../dto/presigned-url.dto';

dotenv.config();

@Injectable()
export class MinioService {
  private readonly minioClient: Client;
  private readonly bucket: string = process.env.MINIO_BUCKET_NAME!;
  private readonly expiration: number = 3600;

  constructor() {
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT!,
      port: Number(process.env.MINIO_PORT),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY!,
      secretKey: process.env.MINIO_SECRET_KEY!,
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  async getPresignedUrlForUpload(): Promise<PresignedUrlDto> {
    const fileName = this.generateFileUploadUrl();
    let url: string;

    try {
      url = await this.minioClient.presignedPutObject(this.bucket, fileName, this.expiration);
    } catch (error) {
      Logger.error(`파일 업로드 URL 생성 중 오류 발생:`, error);
      throw new CommonException(ErrorCode.UPLOAD_FILE_ERROR);
    }

    return PresignedUrlDto.of(url);
  }
  async getPresignedUrlForDownload(
    fileName: string,
  ): Promise<PresignedUrlDto> {
    let url: string;

    try {
      url = await this.minioClient.presignedGetObject(this.bucket, fileName, this.expiration * 60 * 24);
    } catch (error) {
      Logger.error(`파일 다운로드 URL 생성 중 오류 발생:`, error);
      throw new CommonException(ErrorCode.DOWNLOAD_FILE_ERROR);
    }

    return PresignedUrlDto.of(url);
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        Logger.log(`버킷 '${this.bucket}'이 존재하지 않음. 생성 중...`);
        await this.minioClient.makeBucket(this.bucket);
        Logger.log(`버킷 '${this.bucket}' 생성 완료.`);
      } else {
        Logger.error(`버킷 '${this.bucket}'이 이미 존재합니다.`);
      }
    } catch (error) {
      console.error(`버킷 확인 중 오류 발생:`, error);
    }
  }

  private generateFileUploadUrl(): string {
    const timestamp = Date.now();
    const uuidPart = uuidv4().split('-').join('').substring(0, 5);
    return `${timestamp}_${uuidPart}`;
  }
}