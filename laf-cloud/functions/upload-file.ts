import cloud from '@lafjs/cloud';
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';

export default async function (ctx: FunctionContext) {
  const { credentials, endpoint, region } = await cloud.invoke('get-sts');

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
  console.log(res);
  const url = `${endpoint}/${bucket}/${key}`;

  return { url, key };
}

const uploadFile = async (file: File) => {};
