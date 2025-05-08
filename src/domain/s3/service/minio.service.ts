import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { Client } from 'minio';
import { CommonException } from '../../../global/exception/common-exception';
import { ErrorCode } from '../../../global/exception/error-code';
import { PresignedUrlDto } from '../dto/presigned-url.dto';

dotenv.config();

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly minioClient: Client;
  private readonly bucket: string;
  private readonly uploadExpirationSec: number = 60 * 60; // 1시간 (초 단위)
  private readonly downloadExpirationSec: number = 60 * 60 * 24; // 1일 (초 단위)

  constructor() {
    // 환경 변수 체크 및 명확한 에러 처리
    this.bucket = process.env.MINIO_BUCKET_NAME ?? '';
    if (!this.bucket) {
      Logger.error('MINIO_BUCKET_NAME 환경변수가 설정되어 있지 않습니다.');
      throw new Error('MINIO_BUCKET_NAME 환경변수가 필요합니다.');
    }
    const endPoint = process.env.MINIO_ENDPOINT;
    const port = process.env.MINIO_PORT;
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY;
    const secretKey = process.env.MINIO_SECRET_KEY;

    if (!endPoint || !port || !accessKey || !secretKey) {
      Logger.error('MinIO 환경변수가 누락되었습니다.');
      throw new Error('MinIO 환경변수가 모두 필요합니다.');
    }

    this.minioClient = new Client({
      endPoint,
      port: Number(port),
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  /**
   * Presigned URL for upload (PUT)
   * @param extension 파일 확장자 (예: 'jpg', 'png', 'pdf') - 선택적
   */
  async getPresignedUrlForUpload(extension?: string): Promise<PresignedUrlDto> {
    const fileName = this.generateFileUploadName(extension);
    let url: string;

    try {
      url = await this.minioClient.presignedPutObject(
        this.bucket,
        fileName,
        this.uploadExpirationSec,
      );
    } catch (error) {
      Logger.error('파일 업로드 URL 생성 중 오류 발생:', error);
      throw new CommonException(ErrorCode.UPLOAD_FILE_ERROR);
    }

    // PresignedUrlDto에 파일명, 만료시간 등 추가
    return PresignedUrlDto.of({
      url,
      fileName,
      expiration: this.uploadExpirationSec,
    });
  }

  /**
   * Presigned URL for download (GET)
   */
  async getPresignedUrlForDownload(fileName: string): Promise<PresignedUrlDto> {
    let url: string;
    try {
      url = await this.minioClient.presignedGetObject(
        this.bucket,
        fileName,
        this.downloadExpirationSec,
      );
    } catch (error) {
      Logger.error('파일 다운로드 URL 생성 중 오류 발생:', error);
      throw new CommonException(ErrorCode.DOWNLOAD_FILE_ERROR);
    }

    return PresignedUrlDto.of({
      url,
      fileName,
      expiration: this.downloadExpirationSec,
    });
  }

  /**
   * 버킷 존재 여부 확인 및 생성
   */
  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        Logger.log(`버킷 '${this.bucket}'이 존재하지 않음. 생성 중...`);
        await this.minioClient.makeBucket(this.bucket);
        Logger.log(`버킷 '${this.bucket}' 생성 완료.`);
      } else {
        Logger.log(`버킷 '${this.bucket}'이 이미 존재합니다.`);
      }
    } catch (error) {
      Logger.error('버킷 확인/생성 중 오류 발생:', error);
      throw new Error('MinIO 버킷 생성 실패');
    }
  }

  /**
   * 업로드 파일명 생성 (확장자 포함)
   */
  private generateFileUploadName(extension?: string): string {
    const timestamp = Date.now();
    const uuidPart = uuidv4().replace(/-/g, '').substring(0, 8);
    return extension
      ? `${timestamp}_${uuidPart}.${extension.replace(/^\./, '')}`
      : `${timestamp}_${uuidPart}`;
  }
}
