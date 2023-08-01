import cloud from '@lafjs/cloud';
import { S3 } from '@aws-sdk/client-s3';

const fs = require('fs');
const path = require('path');
const db = cloud.database();

export default async function (ctx: FunctionContext) {

  const nanoid = await import('nanoid')
  const bucket = `${cloud.appid}-public`;
  const { credentials, endpoint, region } = await cloud.invoke('get-sts');
  const { path: dir } = ctx.headers;

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


  if (ctx.files) {
    const data = [];
    for (const file of ctx.files) {
      console.log(file);
      let key = `${nanoid.nanoid(6)}_${file.originalname}`;
      if (dir) {
        key = path.join(dir, key);
      }
      const stream = fs.createReadStream(file.path);
      await s3.putObject({
        Bucket: bucket,
        Key: key,
        Body: stream,
        ContentType: file.mimetype,
      });
      const url = `${endpoint}/${bucket}/${key}`;
      db.collection('oss-manager').add({
        key: key,
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        url: url,
      });
      data.push({ key, url })
    }
    return { code: 0, data: data };
  } else {
    return { code: 1000, message: '未检测到上传文件' };
  }


}