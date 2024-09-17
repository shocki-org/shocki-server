import { PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  constructor(
    private readonly configService: ConfigService<
      {
        S3_ENDPOINT: string;
        S3_PUBLIC_URL: string;
        S3_BUCKET_NAME: string;
        S3_REGION: string;
        S3_ACCESS_KEY: string;
        S3_SECRET_KEY: string;
      },
      true
    >,
  ) {}

  #S3Endpoint = this.configService.get('S3_ENDPOINT', { infer: true });
  #bucketName = this.configService.get('S3_BUCKET_NAME', { infer: true });
  #S3Region = this.configService.get('S3_REGION', { infer: true });
  #S3AccessKey = this.configService.get('S3_ACCESS_KEY', { infer: true });
  #S3SecretKey = this.configService.get('S3_SECRET_KEY', { infer: true });
  #S3PublicUrl = this.configService.get('S3_PUBLIC_URL', { infer: true });

  private readonly clientConfig: S3ClientConfig = {
    endpoint: this.#S3Endpoint,
    region: this.#S3Region,
    credentials: {
      accessKeyId: this.#S3AccessKey,
      secretAccessKey: this.#S3SecretKey,
    },
  };

  private readonly client = new S3Client(this.clientConfig);

  /**
   * 이미지를 AWS S3에 업로드합니다.
   * @param base64Image 업로드할 이미지의 base64 문자열
   * @returns 업로드된 이미지의 URL
   */
  async uploadImage(key: string, base64Image: string): Promise<string> {
    const buffer = Buffer.from(base64Image, 'base64');

    const command = new PutObjectCommand({
      Bucket: this.#bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
    });

    await this.client.send(command);

    return `${this.#S3PublicUrl}/${key}`;
  }
}
