import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { Cloud } from 'laf-client-sdk';
import { nanoid } from 'nanoid';
import { logger } from '@/utils/Logger';

const APPID = import.meta.env.VITE_APPID;
const LAF_URL = import.meta.env.VITE_GLOB_LAF_URL;
const bucket = `${APPID}-public`;

const cloud = new Cloud({
  baseUrl: LAF_URL,
  getAccessToken: () => localStorage.getItem('access_token') || '',
});

// 上传图片
const uploadFile = async (file: File) => {
  const { credentials, endpoint, region } = await cloud.invokeFunction('get-sts', {});

  const s3 = new S3({
    endpoint: endpoint,
    region: region,
    credentials: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken,
      expiration: credentials.Expiration,
    },
    forcePathStyle: true,
  });

  const key = `${nanoid(6)}_${file.name}`;
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
    ContentType: file.type,
  });
  const res = await s3.send(cmd);
  logger.log(res);
  const url = `${endpoint}/${bucket}/${key}`;

  return { url, key };
};

export { uploadFile };
